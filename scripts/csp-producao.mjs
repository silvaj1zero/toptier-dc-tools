#!/usr/bin/env node
/**
 * A outra metade do B-39: o que só o domínio responde.
 *
 * O `csp-gate.mjs` prova que o aplicativo sobrevive à política ESCRITA — ele
 * serve o `dist/` local aplicando as regras lidas do `vercel.json`. Duas coisas
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
 *
 * Este script responde as duas contra `ferramentas.toptier.net.br`, com um
 * Chromium de verdade.
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

/* --- 2. O aplicativo sob a política REAL ---------------------------- */
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

/** @type {string[]} */
const violacoes = [];
await page.addInitScript(() => {
  window.__cspViolations = [];
  document.addEventListener('securitypolicyviolation', (e) => {
    window.__cspViolations.push(`${e.violatedDirective} :: ${e.blockedURI}`);
  });
});

let postsDeLead = 0;
await ctx.route(`${ORIGEM_LEAD}/api/**`, (route) => {
  postsDeLead += 1;
  return route.fulfill({
    status: 403,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify({ erro: 'interceptado pelo csp-producao — nenhum lead real enviado' }),
  });
});

console.log('== o anti-robô e o canal de lead, sob a CSP que está no ar ==');
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
    ? '\n[csp-producao] OK — a borda entrega a política declarada, e sob ela o Turnstile monta ' +
        '(script E iframe) e o canal de lead continua vivo.'
    : `\n[csp-producao] ${falhas} falha(s).`,
);
process.exit(falhas === 0 ? 0 : 1);
