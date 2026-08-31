#!/usr/bin/env node
/**
 * Gate de prova RODANDO da política de headers da suíte (B-39) — não lê a
 * política, EXERCITA o navegador contra ela.
 *
 * POR QUE ELE VEM ANTES DA POLÍTICA. A suíte captura lead: o gate de registro
 * do FOMM e o LeadForm de seis ferramentas mandam `fetch` para a Pages Function
 * do site institucional, e o anti-robô carrega script e iframe de
 * `challenges.cloudflare.com`. Uma CSP escrita por leitura mata qualquer um dos
 * três SEM erro de build, lint ou type-check — e sem exceção no console: o
 * navegador só dispara `securitypolicyviolation` e segue como se o pedido não
 * existisse. Este projeto já pagou por isso duas vezes: em 22/08 faltou
 * `challenges.cloudflare.com` no `connect-src` do site e os formulários
 * ficaram mortos em silêncio do cutover até alguém testar de fato; em 27/08 a
 * medição de carregamento das 9 rotas da suíte viu só o Umami, porque o
 * Turnstile só monta quando a pessoa ABRE o formulário. Escrever a CSP com
 * aquela medição teria matado todos os leads.
 *
 * Por isso a ordem do B-39 é: (1) este gate; (2) só então a política.
 *
 * O QUE ELE PROVA, e o que ele não prova. Ele serve `dist/` aplicando as
 * MESMAS regras de header do `vercel.json` (ver scripts/lib/vercel-headers.mjs,
 * que documenta a medição de 31/08 provando que `vercel dev` NÃO aplica esse
 * bloco) e dirige um Chromium real por cima. Prova: o aplicativo sobrevive à
 * política escrita. Não prova que a borda da Vercel entrega os headers como
 * escritos — essa metade só o domínio responde, com
 * `curl -sI https://ferramentas.toptier.net.br/`, que é a evidência de
 * fechamento que o B-39 pede.
 *
 * Uso: node scripts/csp-gate.mjs        (ele mesmo faz o build)
 *      node scripts/csp-gate.mjs --sem-build   (reaproveita dist/)
 */

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { createServer as criarSocket } from 'node:net';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerRegrasDeHeader, headersParaCaminho } from './lib/vercel-headers.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(repoRoot, 'dist');
const SEM_BUILD = process.argv.includes('--sem-build');

function falharAlto(msg) {
  console.error(`[csp-gate] FALHA ${msg}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * 1. Build com as variáveis públicas presentes.
 *
 * Sem `PUBLIC_TOOL_LEAD_ENDPOINT` o LeadForm nem chega a chamar `fetch` —
 * degrada para `mailto:`. Sem `PUBLIC_TURNSTILE_SITE_KEY` o widget não é
 * renderizado. Um dist construído sem elas passaria neste gate por vacuidade:
 * verde porque não há o que bloquear. É a armadilha central deste arquivo, e
 * por isso o gate faz o próprio build e depois CONFERE no bundle que as duas
 * origens estão lá.
 *
 * Valores de teste, não segredos: o endpoint é o canal público declarado em
 * src/lib/lead.ts, e a site key é a de teste da Cloudflare (1x0000...AA,
 * pública e documentada, que sempre passa). Ambos podem ser sobrescritos pelo
 * ambiente para rodar o gate contra os valores reais do projeto.
 * ------------------------------------------------------------------ */
const LEAD_ENDPOINT =
  process.env.PUBLIC_TOOL_LEAD_ENDPOINT?.trim() || 'https://toptier.net.br/api/tool-lead';
const SITE_KEY = process.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || '1x00000000000000000000AA';
const UMAMI_ID = process.env.PUBLIC_UMAMI_WEBSITE_ID?.trim() || '00000000-0000-4000-8000-000000000000';
const ORIGEM_LEAD = new URL(LEAD_ENDPOINT).origin;
/** As três site keys de teste públicas da Cloudflare (sempre passa / sempre falha / força desafio). */
const CHAVE_DE_TESTE = /^[123]x0{20}(AA|AB|FF)$/.test(SITE_KEY);

if (!SEM_BUILD) {
  console.log('[csp-gate] build com as variáveis públicas presentes (endpoint de lead + site key)…');
  const r = spawnSync('npm', ['run', 'build'], {
    cwd: repoRoot,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PUBLIC_TOOL_LEAD_ENDPOINT: LEAD_ENDPOINT,
      PUBLIC_TURNSTILE_SITE_KEY: SITE_KEY,
      PUBLIC_UMAMI_WEBSITE_ID: UMAMI_ID,
    },
  });
  if (r.status !== 0) {
    falharAlto(`\`npm run build\` saiu com ${r.status}:\n${(r.stderr ?? '').toString().slice(-2000)}`);
  }
}

if (!existsSync(DIST)) falharAlto('dist/ não existe — rode `npm run build` antes.');

/** Concatena os bundles JS do build para conferir o que de fato foi embutido. */
function bundlesDoDist() {
  const dir = join(DIST, '_astro');
  if (!existsSync(dir)) return '';
  return readdirSync(dir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n');
}

const js = bundlesDoDist();
if (!js.includes(LEAD_ENDPOINT)) {
  falharAlto(
    `o bundle não contém o endpoint de lead (${LEAD_ENDPOINT}). Sem ele o formulário cai no ` +
      'mailto: e nunca chama `fetch` — este gate ficaria VERDE sem ter provado nada sobre `connect-src`.',
  );
}
if (!js.includes(SITE_KEY)) {
  falharAlto(
    `o bundle não contém a site key do Turnstile (${SITE_KEY}). Sem ela o widget não é renderizado ` +
      'e o gate não exercitaria `script-src`/`frame-src` de challenges.cloudflare.com.',
  );
}
console.log(`[csp-gate] bundle confere: endpoint ${LEAD_ENDPOINT} e site key ${SITE_KEY} embutidos.`);

/* ------------------------------------------------------------------ *
 * 2. Política lida do vercel.json — a mesma fonte que a plataforma lê.
 * ------------------------------------------------------------------ */
const regras = lerRegrasDeHeader(join(repoRoot, 'vercel.json'));
const headersDaHome = headersParaCaminho(regras, '/');
const csp = headersDaHome['content-security-policy'];

if (!csp) {
  falharAlto(
    'vercel.json não declara `Content-Security-Policy` para `/` — é exatamente o achado do B-39 ' +
      '(a suíte captura lead sem CSP nenhuma). Este gate existe para provar a política ANTES de ' +
      'publicá-la; sem política escrita ele não tem o que exercitar.',
  );
}
console.log(`[csp-gate] CSP lida de vercel.json:\n  ${csp}\n`);

/** Diretiva -> valor, para as checagens estáticas abaixo. */
const diretivas = Object.fromEntries(
  csp
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const [nome, ...resto] = d.split(/\s+/);
      return [nome.toLowerCase(), resto.join(' ')];
    }),
);

let falhas = 0;
function checar(ok, msgOk, msgFalha) {
  if (ok) {
    console.log(`   ok   ${msgOk}`);
  } else {
    falhas += 1;
    console.log(`  FALHA ${msgFalha}`);
  }
}

console.log('== checagens estáticas da política ==');
checar(
  !/'unsafe-eval'/.test(diretivas['script-src'] ?? ''),
  "script-src não permite 'unsafe-eval'",
  "script-src permite 'unsafe-eval' — nenhum código desta suíte precisa de eval",
);
checar(
  (diretivas['object-src'] ?? '') === "'none'",
  "object-src 'none'",
  `object-src deveria ser 'none' (está: "${diretivas['object-src'] ?? 'ausente'}")`,
);
checar(
  (diretivas['base-uri'] ?? '') === "'self'",
  "base-uri 'self'",
  `base-uri deveria ser 'self' (está: "${diretivas['base-uri'] ?? 'ausente'}")`,
);
// As origens que a suíte precisa alcançar para capturar um lead. Estão aqui
// porque a ausência delas é SILENCIOSA em produção — é o incidente de 22/08 do
// site, e o que a medição de 27/08 quase reproduziu na suíte.
for (const [dir, origem] of [
  ['connect-src', ORIGEM_LEAD],
  ['connect-src', 'https://challenges.cloudflare.com'],
  ['script-src', 'https://challenges.cloudflare.com'],
  ['frame-src', 'https://challenges.cloudflare.com'],
]) {
  checar(
    (diretivas[dir] ?? '').includes(origem),
    `${dir} declara ${origem}`,
    `${dir} não declara ${origem} — o lead morreria em silêncio`,
  );
}

/* ------------------------------------------------------------------ *
 * 3. Servidor que aplica as regras do vercel.json sobre dist/.
 * ------------------------------------------------------------------ */
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
};

/** Resolve o arquivo do dist para um pathname, barrando travessia. */
function arquivoPara(pathname) {
  const limpo = decodeURIComponent(pathname.split('?')[0]);
  const candidatos = limpo.endsWith('/')
    ? [join(DIST, limpo, 'index.html')]
    : [join(DIST, limpo), `${join(DIST, limpo)}.html`, join(DIST, limpo, 'index.html')];
  for (const c of candidatos) {
    const alvo = normalize(c);
    if (!alvo.startsWith(DIST + sep)) return null;
    if (existsSync(alvo) && statSync(alvo).isFile()) return alvo;
  }
  return null;
}

function portaLivre() {
  return new Promise((ok, erro) => {
    const s = criarSocket();
    s.unref();
    s.on('error', erro);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });
}

const porta = await portaLivre();
const servidor = createServer((req, res) => {
  const pathname = req.url.split('?')[0];
  const arquivo = arquivoPara(pathname);
  const extras = headersParaCaminho(regras, pathname);
  if (!arquivo) {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8', ...extras });
    return res.end('<h1>404</h1>');
  }
  res.writeHead(200, {
    'content-type': TIPOS[extname(arquivo).toLowerCase()] ?? 'application/octet-stream',
    ...extras,
  });
  res.end(readFileSync(arquivo));
});
await new Promise((ok) => servidor.listen(porta, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${porta}`;
console.log(`\n[csp-gate] servindo dist/ em ${BASE} com os headers do vercel.json.`);

/* ------------------------------------------------------------------ *
 * 4. Navegador real contra a política.
 * ------------------------------------------------------------------ */
const browser = await chromium.launch();
/** @type {{rota: string, detalhe: string}[]} */
const violacoes = [];
/** Quantas vezes o endpoint de lead foi efetivamente alcançado. */
let chamadasAoEndpoint = 0;

/**
 * Contexto novo com o coletor de violações instalado antes de qualquer script.
 *
 * O Turnstile é carregado DE VERDADE (site key de teste da Cloudflare) na
 * seção do LeadForm: é o único jeito de exercitar `script-src` e `frame-src` do
 * challenges, já que um stub local não criaria o iframe.
 *
 * O endpoint de lead é interceptado e responde 403. A CSP é avaliada pelo
 * renderer ANTES da requisição sair, então um `connect-src` errado é pego mesmo
 * com a interceptação: a chamada simplesmente nunca chega ao stub. Isso também
 * garante que nenhum lead de teste toque a caixa de verdade.
 */
async function novaPagina({ stubTurnstile }) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__cspViolations.push(
        `${e.violatedDirective} :: ${e.blockedURI} :: ${e.sourceFile}:${e.lineNumber}`,
      );
    });
  });
  await ctx.route(`${ORIGEM_LEAD}/**`, (route) => {
    chamadasAoEndpoint += 1;
    return route.fulfill({
      status: 403,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ erro: 'token ausente (stub do csp-gate)' }),
    });
  });
  if (stubTurnstile) {
    await ctx.route('https://challenges.cloudflare.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body:
          'window.turnstile={render:(el,o)=>{setTimeout(()=>o.callback&&o.callback("stub-do-csp-gate"),10);' +
          'return "w1"},reset:()=>{},remove:()=>{}};',
      }),
    );
  }
  return { ctx, page };
}

async function coletar(page, rota) {
  const vs = await page.evaluate(() => window.__cspViolations ?? []);
  for (const v of vs) violacoes.push({ rota, detalhe: v });
}

const ROTAS = [
  '/',
  '/calculadora-pue',
  '/calculadora-virtualizacao',
  '/como-usar',
  '/maturidade-operacional',
  '/metodologia',
  '/modelador-pue',
  '/planejador-densidade',
  '/simulador-economia',
];

console.log('\n== o header chega, e o inline do layout sobrevive ==');
{
  const { ctx, page } = await novaPagina({ stubTurnstile: true });
  const resp = await page.goto(`${BASE}/`, { waitUntil: 'load' });
  const header = resp?.headers()['content-security-policy'] ?? '';
  checar(
    Boolean(header),
    '/ responde com content-security-policy',
    '/ não respondeu com content-security-policy',
  );

  // O tema é resolvido por script inline ANTES do primeiro paint. Bloqueado
  // pela CSP, o atributo nunca aparece — e a página pisca claro/escuro.
  const tema = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  checar(
    Boolean(tema),
    `script inline do tema rodou sob a CSP (data-theme="${tema}")`,
    'o script inline do tema NÃO rodou — a CSP o bloqueou (flash de tema em toda visita)',
  );
  await coletar(page, '/');
  await ctx.close();
}

console.log('\n== as 9 rotas carregam sem violação ==');
for (const rota of ROTAS) {
  const { ctx, page } = await novaPagina({ stubTurnstile: true });
  const resp = await page.goto(`${BASE}${rota}`, { waitUntil: 'load' });
  if (resp?.status() !== 200) {
    falhas += 1;
    console.log(`  FALHA ${rota} respondeu ${resp?.status()}`);
  }
  await page.waitForTimeout(300);
  await coletar(page, rota);
  await ctx.close();
}
console.log(`   ok   ${ROTAS.length} rotas visitadas`);

/* --- LeadForm de uma ferramenta: o lead SAI sob a política ---------- */
console.log('\n== LeadForm (/calculadora-pue): o envio atravessa a política ==');
{
  const antes = chamadasAoEndpoint;
  const { ctx, page } = await novaPagina({ stubTurnstile: false });
  await page.goto(`${BASE}/calculadora-pue`, { waitUntil: 'load' });

  // ROLAR ANTES DE ESPERAR — e é a mesma armadilha do B-39 aparecendo de novo.
  // O LeadForm é `client:visible`: sem chegar ao viewport ele nem hidrata, o
  // efeito do Turnstile não roda e NENHUM script de challenges.cloudflare.com é
  // injetado. Medido em 31/08: esperar o widget sem rolar dá `window.turnstile
  // === undefined` com zero violação de CSP — um gate ingênuo leria isso como
  // "a política bloqueou" ou, pior, como verde. É a versão automatizada do que
  // a medição de 27/08 sofreu: o Turnstile só existe quando alguém ABRE o
  // formulário.
  await page.locator('.turnstile-box').scrollIntoViewIfNeeded();

  // Turnstile REAL — script externo e widget montado sob a política.
  try {
    await page.waitForFunction(() => Boolean(window.turnstile), null, { timeout: 25000 });
    // `state: 'attached'`, não o default 'visible': o campo do Turnstile é
    // `type="hidden"` e nunca fica visível — esperar visibilidade dá timeout e
    // o gate acusaria a CSP por um defeito seu.
    await page.waitForSelector('.turnstile-box input[name="cf-turnstile-response"]', {
      state: 'attached',
      timeout: 25000,
    });
    console.log(
      '   ok   widget do Turnstile montou (script de challenges.cloudflare.com executou e ' +
        'renderizou sob a CSP)',
    );
  } catch {
    falhas += 1;
    console.log(
      '  FALHA o widget do Turnstile não montou. Se houver rede, isto é a CSP bloqueando ' +
        'script-src ou connect-src de challenges.cloudflare.com — o anti-robô morto em silêncio. ' +
        'Sem rede, este gate não pode provar esta parte e prefere reprovar a fingir.',
    );
  }

  // frame-src: o que este gate NÃO consegue provar sozinho, e por quê.
  //
  // As site keys de teste da Cloudflare (1x…AA sempre passa, 2x…AB sempre
  // falha, 3x…FF força desafio interativo) montam um widget dummy: div +
  // `cf-turnstile-response`, SEM iframe. Medido nas três em 31/08. Só a chave
  // real do projeto cria o iframe que exercita `frame-src`. Então: com chave de
  // teste, o gate diz que essa metade ficou sem prova; com a chave real vinda
  // do ambiente, ele a exige.
  const iframes = await page.locator('.turnstile-box iframe').count();
  if (CHAVE_DE_TESTE) {
    console.log(
      '   --   frame-src NÃO foi exercitado: a site key de teste da Cloudflare monta o widget ' +
        'sem iframe. Para provar esta diretiva, rode com a chave real: ' +
        'PUBLIC_TURNSTILE_SITE_KEY=<chave do projeto> node scripts/csp-gate.mjs',
    );
  } else {
    checar(
      iframes > 0,
      'iframe do Turnstile presente (frame-src permite challenges.cloudflare.com)',
      'o iframe do Turnstile não apareceu com a chave real — frame-src está bloqueando ' +
        'challenges.cloudflare.com',
    );
  }

  await page.fill('#lead-name', 'Gate de CSP');
  await page.fill('#lead-email', 'csp-gate@exemplo.com');
  await page.check('.consent input[type="checkbox"]');
  await page.click('form button[type="submit"]');
  await page.waitForTimeout(1500);

  checar(
    chamadasAoEndpoint > antes,
    `o POST do lead alcançou ${ORIGEM_LEAD} (connect-src permite o canal de lead)`,
    `o POST do lead NUNCA saiu — connect-src está bloqueando ${ORIGEM_LEAD}. ` +
      'Em produção isto é lead perdido sem nenhum sinal.',
  );

  // O 403 do stub tem que virar a mensagem de anti-robô — prova de que a
  // resposta foi lida, não que a requisição morreu na CSP.
  const alerta = await page.evaluate(
    () => document.querySelector('[role="alert"]')?.textContent?.trim() ?? '',
  );
  checar(
    /anti-rob/i.test(alerta),
    'a resposta 403 virou a mensagem de anti-robô na tela',
    `a resposta do envio não virou a mensagem esperada (texto: "${alerta}")`,
  );

  await coletar(page, '/calculadora-pue (envio)');
  await ctx.close();
}

/* --- Gate do FOMM: o lead mais qualificado da suíte ------------------ */
console.log('\n== Gate do FOMM (/maturidade-operacional): 18 respostas e o registro ==');
{
  const antes = chamadasAoEndpoint;
  const { ctx, page } = await novaPagina({ stubTurnstile: true });
  await page.goto(`${BASE}/maturidade-operacional`, { waitUntil: 'load' });
  await page.waitForSelector('.fomm-q');

  // Responde tudo no nível 3 — o resultado só aparece completo.
  const perguntas = await page.locator('.fomm-q').count();
  for (let i = 0; i < perguntas; i += 1) {
    await page.locator('.fomm-q').nth(i).locator('.fomm-opt').nth(2).click();
  }
  checar(perguntas === 18, `${perguntas} perguntas respondidas`, `esperava 18 perguntas, achei ${perguntas}`);

  const gate = page.locator('.fomm-gate');
  await gate.waitFor({ timeout: 10000 });
  await page.fill('#fg-name', 'Gate de CSP');
  await page.fill('#fg-email', 'csp-gate@exemplo.com');
  await gate.locator('button[type="submit"]').click();
  await page.waitForTimeout(1500);

  checar(
    chamadasAoEndpoint > antes,
    `o registro do FOMM alcançou ${ORIGEM_LEAD}`,
    `o registro do FOMM NUNCA saiu — connect-src está bloqueando ${ORIGEM_LEAD}`,
  );

  await coletar(page, '/maturidade-operacional (registro)');
  await ctx.close();
}

/* --- Menu: o segundo inline do layout ------------------------------- */
console.log('\n== Menu do cabeçalho: o inline que fecha com Esc ==');
{
  const { ctx, page } = await novaPagina({ stubTurnstile: true });
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  const menu = page.locator('[data-menu]').first();
  if ((await menu.count()) === 0) {
    falhas += 1;
    console.log('  FALHA nenhum [data-menu] na home — o seletor deste gate envelheceu');
  } else {
    await menu.locator('summary').click();
    await page.waitForTimeout(100);
    const abriu = await menu.evaluate((el) => el.hasAttribute('open'));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const fechou = await menu.evaluate((el) => !el.hasAttribute('open'));
    checar(
      abriu && fechou,
      'o menu abre e o Esc o fecha (script inline do layout vivo sob a CSP)',
      `o menu não respondeu como esperado (abriu=${abriu}, fechou com Esc=${fechou}) — ` +
        'o inline do layout pode ter sido bloqueado',
    );
  }
  await coletar(page, '/ (menu)');
  await ctx.close();
}

await browser.close();
servidor.close();

console.log('\n== violações acumuladas ==');
if (violacoes.length > 0) {
  falhas += 1;
  console.log(`  FALHA ${violacoes.length} securitypolicyviolation:`);
  for (const v of violacoes) console.log(`    - [${v.rota}] ${v.detalhe}`);
} else {
  console.log('   ok   zero securitypolicyviolation em tudo que foi exercitado');
}

console.log(
  falhas === 0
    ? '\n[csp-gate] OK — sob a política do vercel.json: as 9 rotas carregam, o Turnstile monta, ' +
        'o lead da ferramenta e o registro do FOMM saem, e o inline do layout continua vivo.\n' +
        '           Falta a outra metade, que só o domínio responde: ' +
        '`curl -sI https://ferramentas.toptier.net.br/`.'
    : `\n[csp-gate] ${falhas} falha(s).`,
);
process.exit(falhas === 0 ? 0 : 1);
