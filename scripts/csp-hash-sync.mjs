#!/usr/bin/env node
/**
 * Sincroniza os hashes dos scripts inline executáveis do `dist/` com a CSP
 * versionada no `vercel.json`.
 *
 * POR QUE OS HASHES SÃO VERSIONADOS. Na Vercel, os headers vêm do
 * `vercel.json` lido do REPOSITÓRIO no deploy, e o build acontece depois.
 * Portanto, o build só pode conferir os hashes que já foram commitados; ele
 * não consegue publicar uma correção calculada no próprio `dist/`. É diferente
 * do site institucional, que injeta os headers em `dist/_headers` pós-build.
 *
 * A estabilidade foi medida, não presumida: 3 builds (2 com variáveis
 * `PUBLIC_*` e 1 sem elas) produziram os mesmos 5 hashes executáveis. Os 7
 * blocos `application/ld+json` ficam fora porque são dados estruturados, não
 * código executável sujeito a `script-src`.
 *
 * Uso:
 *   node scripts/csp-hash-sync.mjs --escrever
 *   node scripts/csp-hash-sync.mjs --conferir
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extrairScriptsInline, hashesExecutaveis } from './lib/inline-scripts.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(repoRoot, 'dist');
const VERCEL_JSON = join(repoRoot, 'vercel.json');
const PREFIXO = '[csp-hash-sync]';
const INSTRUCAO = 'rode node scripts/csp-hash-sync.mjs --escrever e commite o vercel.json.';
const RE_DIRETIVA_SCRIPT = /(^|;)(\s*script-src)\s+([^;]*?)(?=;|$)/i;
const RE_HASH = /^'?(sha256-[A-Za-z0-9+/]+={0,2})'?$/i;

function falharAlto(mensagem) {
  throw new Error(mensagem);
}

/** A ordem dos caminhos torna o diagnóstico reproduzível entre plataformas. */
function arquivosHtml(caminho) {
  const arquivos = [];
  const entradas = readdirSync(caminho, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const entrada of entradas) {
    const alvo = join(caminho, entrada.name);
    if (entrada.isDirectory()) arquivos.push(...arquivosHtml(alvo));
    else if (entrada.isFile() && extname(entrada.name).toLowerCase() === '.html') arquivos.push(alvo);
  }
  return arquivos;
}

function inventariarDist() {
  if (!existsSync(DIST)) falharAlto('dist/ não existe — rode `astro build` antes.');

  const htmls = arquivosHtml(DIST);
  if (htmls.length < 9) {
    falharAlto(
      `dist/ contém apenas ${htmls.length} arquivo(s) .html; eram esperados pelo menos 9. ` +
        'Conferir menos rotas permitiria versionar uma CSP incompleta.',
    );
  }

  const hashes = new Set();
  let executaveis = 0;
  for (const caminho of htmls) {
    const html = readFileSync(caminho, 'utf8');
    executaveis += extrairScriptsInline(html).filter((script) => script.executavel).length;
    for (const hash of hashesExecutaveis(html)) hashes.add(hash);
  }

  const ordenados = [...hashes].sort();
  if (executaveis === 0 || ordenados.length === 0) {
    falharAlto(
      `zero script inline executável encontrado nos ${htmls.length} arquivos .html do dist/.`,
    );
  }
  return { hashes: ordenados, quantidadeHtml: htmls.length };
}

function tokenSemAspas(token) {
  return token.replace(/^'|'$/g, '');
}

function hashDoToken(token) {
  return token.match(RE_HASH)?.[1] ?? null;
}

/**
 * Muda somente o conteúdo de `script-src`: as demais diretivas atravessam a
 * substituição como os mesmos bytes, inclusive espaços e ordem.
 */
function cspComHashes(csp, hashes) {
  if (!RE_DIRETIVA_SCRIPT.test(csp)) {
    falharAlto('vercel.json não contém a diretiva `script-src` na Content-Security-Policy.');
  }

  return csp.replace(RE_DIRETIVA_SCRIPT, (diretiva, separador, nome, fontes) => {
    const fixas = fontes
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => tokenSemAspas(token).toLowerCase() !== 'unsafe-inline')
      .filter((token) => hashDoToken(token) === null);
    const indiceSelf = fixas.findIndex(
      (token) => tokenSemAspas(token).toLowerCase() === 'self',
    );
    const posicaoDosHashes = indiceSelf >= 0 ? indiceSelf + 1 : 0;
    fixas.splice(posicaoDosHashes, 0, ...hashes.map((hash) => `'${hash}'`));
    return `${separador}${nome} ${fixas.join(' ')}`;
  });
}

function lerPolitica() {
  let json;
  try {
    json = JSON.parse(readFileSync(VERCEL_JSON, 'utf8'));
  } catch (erro) {
    falharAlto(`não foi possível ler vercel.json: ${erro.message}`);
  }

  const regra = Array.isArray(json.headers)
    ? json.headers.find((candidata) => candidata?.source === '/(.*)')
    : null;
  if (!regra) falharAlto('vercel.json não contém a regra de headers com `source` igual a `/(.*)`.');

  const header = Array.isArray(regra.headers)
    ? regra.headers.find(
        (candidata) => candidata?.key?.toLowerCase() === 'content-security-policy',
      )
    : null;
  if (!header || typeof header.value !== 'string') {
    falharAlto(
      'a regra `/(.*)` do vercel.json não contém um header Content-Security-Policy válido.',
    );
  }
  return { json, header };
}

function hashesDaCsp(csp) {
  const fontes = csp.match(RE_DIRETIVA_SCRIPT)?.[3];
  if (fontes === undefined) {
    falharAlto('vercel.json não contém a diretiva `script-src` na Content-Security-Policy.');
  }
  return new Set(
    fontes
      .trim()
      .split(/\s+/)
      .map(hashDoToken)
      .filter(Boolean),
  );
}

/** Índice do primeiro caractere que difere, ou -1 se uma é prefixo da outra. */
function primeiraDiferenca(a, b) {
  const limite = Math.min(a.length, b.length);
  for (let i = 0; i < limite; i += 1) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : limite;
}

/** Só a diretiva `script-src`, para o diagnóstico não despejar a CSP inteira. */
function diretivaDe(csp) {
  const m = csp.match(RE_DIRETIVA_SCRIPT);
  return m ? `${m[2].trim()} ${m[3].trim()}` : '(script-src ausente)';
}

function imprimirLista(rotulo, hashes) {
  console.error(`${PREFIXO} ${rotulo}:`);
  if (hashes.length === 0) console.error(`${PREFIXO}   (nenhum)`);
  else for (const hash of hashes) console.error(`${PREFIXO}   ${hash}`);
}

function modoSolicitado() {
  const argumentos = process.argv.slice(2);
  if (argumentos.length !== 1 || !['--escrever', '--conferir'].includes(argumentos[0])) {
    falharAlto('use exatamente um modo: `--escrever` ou `--conferir`.');
  }
  return argumentos[0];
}

function main() {
  const modo = modoSolicitado();
  const { hashes, quantidadeHtml } = inventariarDist();
  const { json, header } = lerPolitica();
  const cspAtual = header.value;
  const cspEsperada = cspComHashes(cspAtual, hashes);

  if (modo === '--escrever') {
    header.value = cspEsperada;
    writeFileSync(VERCEL_JSON, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
    console.log(
      `${PREFIXO} vercel.json atualizado com ${hashes.length} hash(es) de ` +
        `${quantidadeHtml} arquivo(s) .html.`,
    );
    return;
  }

  if (cspAtual !== cspEsperada) {
    const atuais = hashesDaCsp(cspAtual);
    const esperados = new Set(hashes);
    const faltam = hashes.filter((hash) => !atuais.has(hash));
    const sobram = [...atuais].filter((hash) => !esperados.has(hash)).sort();

    // Divergência de FORMATAÇÃO, não de conteúdo — e ela precisa ser dita com
    // essas palavras. A comparação é textual, que é o que mantém o diff do
    // vercel.json estável; então um espaço a mais depois de `script-src`
    // reprova com os hashes perfeitamente corretos. Sem esta distinção a saída
    // lista "(nenhum)" nos dois lados sob o título "diverge dos scripts inline
    // do dist/", e quem lê vai caçar um hash errado que não existe.
    // Achado do QG em 31/08, reproduzido antes de ser corrigido.
    if (faltam.length === 0 && sobram.length === 0) {
      const atual = diretivaDe(cspAtual);
      const esperada = diretivaDe(cspEsperada);

      // `'unsafe-inline'` presente NÃO é formatação — é a política inteira
      // sendo desfeita, e chamar isso de "espaçamento" mandaria quem lê para o
      // lado errado. Com hash na lista, o navegador (CSP2+) até ignora o
      // `'unsafe-inline'`; num navegador que só entenda CSP1, ele volta a valer
      // e o inline fica liberado de novo. Nos dois casos é grave, e nenhum dos
      // dois é um espaço a mais.
      if (/'unsafe-inline'/.test(atual)) {
        console.error(
          `${PREFIXO} FALHA script-src contém 'unsafe-inline' junto com os hashes. ` +
            'Os hashes estão corretos, mas o inline segue liberado — a migração perde o sentido.',
        );
      } else {
        console.error(
          `${PREFIXO} FALHA a diretiva script-src do vercel.json está fora do formato canônico. ` +
            'Os hashes estão CORRETOS — a divergência é de formatação (espaçamento ou ordem).',
        );
      }

      console.error(`${PREFIXO}   atual:    ${atual}`);
      console.error(`${PREFIXO}   esperada: ${esperada}`);
      // Sem esta seta, duas linhas que diferem por um espaço duplo aparecem
      // IDÊNTICAS na tela — o diagnóstico viraria charada.
      const i = primeiraDiferenca(atual, esperada);
      if (i >= 0) {
        console.error(`${PREFIXO}   ${' '.repeat(12 + i)}^ primeira diferença (coluna ${i + 1})`);
      }
      console.error(`${PREFIXO} ${INSTRUCAO}`);
      process.exitCode = 1;
      return;
    }

    console.error(
      `${PREFIXO} FALHA a diretiva script-src do vercel.json diverge dos scripts inline do dist/.`,
    );
    imprimirLista('hashes que faltam no vercel.json', faltam);
    imprimirLista('hashes que sobram no vercel.json', sobram);
    console.error(`${PREFIXO} ${INSTRUCAO}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `${PREFIXO} OK — ${hashes.length} hash(es) conferidos em ${quantidadeHtml} arquivo(s) .html.`,
  );
}

try {
  main();
} catch (erro) {
  console.error(`${PREFIXO} FALHA ${erro.message}`);
  process.exitCode = 1;
}
