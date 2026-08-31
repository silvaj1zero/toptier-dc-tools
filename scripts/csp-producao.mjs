#!/usr/bin/env node
/**
 * A outra metade do B-39: o que só o domínio responde.
 *
 * O `csp-gate.mjs` prova que o aplicativo sobrevive à política ESCRITA — ele
 * serve o `dist/` local aplicando as regras lidas do `vercel.json`. Três coisas
 * ficam fora do alcance dele por construção:
 *
 *   1. **A borda entrega o que foi declarado?** Nenhum servidor local responde
 *      por isso. (No site institucional essa pergunta custou dois dias sem CSP
 *      no ar — B-33: o Cloudflare Pages descartava em silêncio a primeira de
 *      duas seções `/*`. A Vercel compõe as regras em vez de descartar, mas
 *      "provavelmente compõe" não é evidência.)
 *   2. **`frame-src`.** As três site keys de teste da Cloudflare montam o
 *      widget SEM iframe, então o gate local nunca exercita essa diretiva. Só a
 *      chave real do projeto — que vive no painel da Vercel e chega aqui pelo
 *      build de produção — cria o iframe.
 *   3. **Os hashes do HTML no ar estão no `script-src` da borda?** A Vercel
 *      lê o `vercel.json` do repositório no deploy, mas o build acontece
 *      depois. Se o build da Vercel produzir algum script inline diferente
 *      do build local, o hash commitado não bate, a CSP bloqueia em
 *      silêncio e o menu, o tema e os formulários de lead morrem sem
 *      nenhum erro visível. O `csp-gate` não pega isso: ele aplica o
 *      `vercel.json` local sobre o `dist/` local — as duas pontas batem
 *      por construção. Só o domínio responde.
 *   4. **Hash declarado no header não é script executando.** A seção 2
 *      prova que o SHA-256 do HTML está no `script-src` da mesma resposta.
 *      Não prova que o navegador ACEITOU e RODOU o script. Hash errado
 *      numa rota mata o tema ou o menu daquela rota sem erro de build e
 *      sem exceção no console — só o comportamento denuncia. O Chromium
 *      visita as 9 rotas e confere `data-theme` no `<html>` e o menu
 *      `[data-menu]` abrindo no clique do `summary` e fechando com Esc.
 *
 * Este script responde as quatro contra `ferramentas.toptier.net.br`, com um
 * Chromium de verdade (1, 2 e 4) e `fetch` do HTML (3). Hash declarado no
 * header não é a mesma coisa que script executando: a seção 4 visita as
 * 9 rotas no Chromium e exige os dois efeitos dos `is:inline` do
 * Base.astro (tema no `<html>`, menu que fecha com Esc). Sob hash-only,
 * um hash errado não levanta erro de build nem exceção no console — só
 * o comportamento denuncia.
 *
 * NENHUM LEAD DE TESTE É ENVIADO. O POST para o canal de lead é interceptado e
 * respondido com 403 pelo próprio script. A CSP é avaliada pelo renderer ANTES
 * da requisição sair, então `connect-src` continua sendo exercitado de verdade:
 * se a política bloquear, a chamada nunca chega à interceptação — que é
 * exatamente o sinal que este script procura.
 *
 * Uso: node scripts/csp-producao.mjs [https://outro-dominio]
 */

import { chromium } from 'playwright';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashesExecutaveis } from './lib/inline-scripts.mjs';
import { lerRegrasDeHeader, headersParaCaminho } from './lib/vercel-headers.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.argv[2] ?? 'https://ferramentas.toptier.net.br').replace(/\/$/, '');
const ORIGEM_LEAD = 'https://toptier.net.br';

let falhas = 0;
function checar(ok, msgOk, msgFalha) {
  if (ok) {
    console.log(`   ok   ${msgOk}`);
  } else {
    falhas += 1;
    console.log(`  FALHA ${msgFalha}`);
  }
}

console.log(`[csp-producao] medindo ${BASE}\n`);

/* --- 1. O header que a borda devolve ------------------------------- */
const resposta = await fetch(`${BASE}/`, { redirect: 'follow' });
const cspDoDominio = resposta.headers.get('content-security-policy') ?? '';
console.log('== o que a borda devolve ==');
checar(Boolean(cspDoDominio), 'a home responde com Content-Security-Policy', 'a home NÃO responde com Content-Security-Policy');
checar(
  resposta.headers.get('x-content-type-options') === 'nosniff',
  'X-Content-Type-Options: nosniff',
  `X-Content-Type-Options ausente ou diferente (${resposta.headers.get('x-content-type-options')})`,
);
checar(
  (resposta.headers.get('referrer-policy') ?? '') === 'strict-origin-when-cross-origin',
  'Referrer-Policy: strict-origin-when-cross-origin',
  `Referrer-Policy ausente ou diferente (${resposta.headers.get('referrer-policy')})`,
);
checar(
  (resposta.headers.get('strict-transport-security') ?? '').includes('max-age='),
  `Strict-Transport-Security presente (${resposta.headers.get('strict-transport-security')})`,
  'Strict-Transport-Security ausente',
);
// A borda entrega o que o repo declara? É a pergunta do B-33 feita à Vercel:
// lá o Cloudflare Pages descartava em silêncio uma seção inteira do `_headers`,
// e o site ficou dois dias sem CSP porque ninguém comparava as duas pontas.
const declarada = headersParaCaminho(lerRegrasDeHeader(join(repoRoot, 'vercel.json')), '/')[
  'content-security-policy'
];
const normalizar = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
checar(
  normalizar(declarada) === normalizar(cspDoDominio),
  'a CSP no ar é idêntica à declarada no vercel.json',
  'a CSP no ar DIVERGE do vercel.json — ou o deploy não subiu, ou a borda a transformou:\n' +
    `        declarada: ${normalizar(declarada)}\n` +
    `        no ar:     ${normalizar(cspDoDominio)}`,
);
if (cspDoDominio) console.log(`\n  CSP no ar:\n  ${cspDoDominio}\n`);

/* --- 2. Hashes do HTML no ar vs. script-src da borda ---------------- *
 *
 * Este é o modo de falha que o gate local não alcança. A Vercel lê os
 * headers do `vercel.json` do REPOSITÓRIO no deploy; o build acontece
 * depois. Se o build da Vercel produzir um inline diferente do build
 * local (o que gerou os hashes commitados), o navegador recebe HTML cujo
 * SHA-256 não está no `script-src` daquela mesma resposta. A CSP
 * bloqueia em silêncio: sem erro de build, sem exceção no console, e o
 * menu, o tema e os formulários de lead morrem.
 *
 * Confrontamos o HTML e o header da MESMA resposta, rota a rota. A
 * extração passa por `hashesExecutaveis` — uma segunda regex aqui seria
 * o defeito que o módulo compartilhado existe para impedir.
 *
 * As 9 rotas são as mesmas do `csp-gate.mjs`. Sem essa lista fechada, um
 * "ok" na home não prova as ferramentas — e é nas ferramentas que o lead
 * mora.
 * ------------------------------------------------------------------ */

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

/** Diretiva `script-src` crua de uma CSP, ou string vazia se ausente. */
function scriptSrcDe(csp) {
  const dir = (csp ?? '')
    .split(';')
    .map((d) => d.trim())
    .find((d) => /^script-src\b/i.test(d));
  return dir ?? '';
}

console.log('== hashes do HTML no ar vs. script-src da borda ==');
for (const rota of ROTAS) {
  const resp = await fetch(`${BASE}${rota}`, { redirect: 'follow' });
  const html = await resp.text();
  const csp = resp.headers.get('content-security-policy') ?? '';
  const scriptSrc = scriptSrcDe(csp);
  const hashes = hashesExecutaveis(html);

  checar(
    !/'unsafe-inline'/.test(scriptSrc),
    `${rota}: script-src no ar não permite 'unsafe-inline'`,
    `${rota}: script-src no ar ainda permite 'unsafe-inline' — a migração para hashes SHA-256 não chegou à borda`,
  );

  // Zero hashes = a asserção "cada hash está no script-src" passaria por
  // vacuidade, o mesmo tipo de verde-falso que este arquivo existe para
  // não emitir. Medido em 31/08/2026: toda rota da suíte tem pelo menos o
  // tema e o menu (`is:inline` do Base.astro).
  checar(
    hashes.length > 0,
    `${rota}: ${hashes.length} hash(es) executável(is) no HTML`,
    `${rota}: nenhum script inline executável no HTML — extração vazia, a asserção dos hashes seria vacuidade`,
  );

  for (const hash of hashes) {
    const token = `'${hash}'`;
    checar(
      scriptSrc.includes(token),
      `${rota}: ${token} declarado no script-src da borda`,
      `${rota}: o hash ${token} NÃO está no script-src que a borda entregou. ` +
        'O build da Vercel produziu inline diferente do que está commitado no vercel.json — ' +
        'a CSP bloqueia em silêncio e o menu, o tema e os formulários de lead morrem.',
    );
  }
}

/* --- 3. O aplicativo sob a política REAL ---------------------------- */
const browser = await chromium.launch();

/** @type {string[]} */
const violacoes = [];
let postsDeLead = 0;

/**
 * Contexto novo a cada chamada: o coletor de violações começa limpo
 * (o `addInitScript` vive no contexto; reusar o mesmo misturaria rotas).
 * A interceptação do canal de lead vai junto — nenhum POST real sai,
 * em nenhuma rota.
 */
async function novaPagina() {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__cspViolations.push(`${e.violatedDirective} :: ${e.blockedURI}`);
    });
  });
  await ctx.route(`${ORIGEM_LEAD}/api/**`, (route) => {
    postsDeLead += 1;
    return route.fulfill({
      status: 403,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ erro: 'interceptado pelo csp-producao — nenhum lead real enviado' }),
    });
  });
  return { ctx, page };
}

console.log('== o anti-robô e o canal de lead, sob a CSP que está no ar ==');
const { ctx, page } = await novaPagina();
await page.goto(`${BASE}/calculadora-pue`, { waitUntil: 'load' });

// `client:visible`: sem rolar, o formulário nem hidrata. Ver csp-gate.mjs.
await page.locator('.turnstile-box').scrollIntoViewIfNeeded();

try {
  await page.waitForFunction(() => Boolean(window.turnstile), null, { timeout: 30000 });
  console.log('   ok   o script de challenges.cloudflare.com executou (script-src)');
} catch {
  falhas += 1;
  console.log('  FALHA window.turnstile nunca apareceu — script-src está bloqueando challenges.cloudflare.com');
}

// frame-src: medido em 31/08 e REGISTRADO como não-provável por aqui.
//
// A expectativa era que a chave real criasse o iframe que a chave de teste não
// cria. Não cria: no modo managed — o caminho do visitante comum, e o único que
// um script consegue reproduzir — o widget resolve o desafio em `blob:` workers
// e o `.turnstile-box` fica com um `<input type=hidden>` e nenhum iframe. O
// iframe só nasce quando a Cloudflare decide apresentar desafio interativo a um
// visitante suspeito, o que não se provoca sob demanda.
//
// Então `frame-src` segue declarado por prescrição da Cloudflare, sem prova
// empírica deste projeto. Dizer isso é o ponto: um "ok" aqui seria uma
// asserção que nunca falharia, e uma asserção que nunca falha é decoração.
const iframes = await page.locator('.turnstile-box iframe').count();
console.log(
  iframes > 0
    ? '   ok   iframe do Turnstile presente (frame-src exercitado — desafio interativo apareceu)'
    : '   --   sem iframe: o desafio veio no modo managed (blob workers). frame-src fica declarado ' +
        'mas SEM prova — só um desafio interativo o exercitaria, e ele não se provoca sob demanda.',
);

await page.fill('#lead-name', 'Verificacao de CSP');
await page.fill('#lead-email', 'csp-producao@exemplo.com');
await page.check('.consent input[type="checkbox"]');
await page.click('form button[type="submit"]');
await page.waitForTimeout(2500);

checar(
  postsDeLead > 0,
  `o POST do lead alcançou ${ORIGEM_LEAD} (connect-src permite o canal) — interceptado, nada foi enviado`,
  `o POST do lead NUNCA saiu — connect-src está bloqueando ${ORIGEM_LEAD} em produção`,
);

violacoes.push(...(await page.evaluate(() => window.__cspViolations ?? [])));
await ctx.close();

/* --- 4. Tema e menu nas 9 rotas: hash declarado ≠ script rodando ---- *
 *
 * A seção 2 confronta os hashes do HTML com o `script-src` da borda. Isso
 * prova que o header CITA os hashes certos. Não prova que o navegador
 * EXECUTOU aqueles scripts. Os dois `is:inline` do Base.astro existem em
 * TODAS as 9 rotas — o que resolve o tema antes do primeiro paint
 * (`data-theme` no `<html>`) e o que faz o menu do cabeçalho fechar com
 * Esc e com clique fora (`[data-menu]`, um `<details>` com `<summary>`).
 *
 * Sob hash-only, um hash errado numa rota específica não levanta erro de
 * build nem exceção no console: a CSP bloqueia em silêncio e o tema ou o
 * menu daquela rota morre. Só o comportamento denuncia. Por isso esta
 * seção visita as 9 rotas com o Chromium já aberto, contexto novo por
 * rota (coletor de violações começa limpo), e exige os dois efeitos.
 * ------------------------------------------------------------------ */

console.log('\n== tema e menu: os dois inline hasheados executaram, nas 9 rotas ==');
for (const rota of ROTAS) {
  const { ctx: ctxRota, page: pageRota } = await novaPagina();
  await pageRota.goto(`${BASE}${rota}`, { waitUntil: 'load' });

  // O tema é resolvido por script inline ANTES do primeiro paint.
  // Bloqueado pela CSP, o atributo nunca aparece.
  const tema = await pageRota.evaluate(() => document.documentElement.getAttribute('data-theme'));
  checar(
    Boolean(tema),
    `${rota}: script do tema rodou (data-theme="${tema}")`,
    `${rota}: o script do tema NÃO rodou — data-theme ausente no html. ` +
      'Sob hash-only um hash errado não levanta erro de build nem exceção no console; só o comportamento denuncia.',
  );

  const menu = pageRota.locator('[data-menu]').first();
  if ((await menu.count()) === 0) {
    falhas += 1;
    console.log(`  FALHA ${rota}: nenhum [data-menu] — o seletor deste script envelheceu`);
  } else {
    await menu.locator('summary').click();
    await pageRota.waitForTimeout(100);
    const abriu = await menu.evaluate((el) => el.hasAttribute('open'));
    await pageRota.keyboard.press('Escape');
    await pageRota.waitForTimeout(200);
    const fechou = await menu.evaluate((el) => !el.hasAttribute('open'));
    checar(
      abriu && fechou,
      `${rota}: o menu abre no summary e fecha com Esc`,
      `${rota}: o menu não respondeu (abriu=${abriu}, fechou com Esc=${fechou}) — ` +
        'o inline do layout pode ter sido bloqueado. Sob hash-only um hash errado ' +
        'não levanta erro de build nem exceção no console; só o comportamento denuncia.',
    );
  }

  const daRota = await pageRota.evaluate(() => window.__cspViolations ?? []);
  for (const v of daRota) violacoes.push(`${rota}: ${v}`);
  checar(
    daRota.length === 0,
    `${rota}: zero securitypolicyviolation`,
    `${rota}: ${daRota.length} securitypolicyviolation: ${daRota.join('; ')}`,
  );

  await ctxRota.close();
}

await browser.close();

console.log('\n== violações ==');
if (violacoes.length > 0) {
  falhas += 1;
  console.log(`  FALHA ${violacoes.length} securitypolicyviolation em produção:`);
  for (const v of violacoes) console.log(`    - ${v}`);
} else {
  console.log('   ok   zero securitypolicyviolation');
}

console.log(
  falhas === 0
    ? '\n[csp-producao] OK — a borda entrega a política declarada, idêntica ao vercel.json, e sob ' +
        'ela o script do Turnstile executa, o canal de lead continua vivo, e o tema e o menu ' +
        'sobrevivem nas 9 rotas.\n' +
        `               ${
          iframes > 0
            ? 'frame-src exercitado pelo desafio interativo.'
            : 'frame-src NÃO foi exercitado (modo managed, sem iframe) — segue declarado sem prova.'
        }`
    : `\n[csp-producao] ${falhas} falha(s).`,
);
process.exit(falhas === 0 ? 0 : 1);
