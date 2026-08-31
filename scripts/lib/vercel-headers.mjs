/**
 * Leitura das regras `headers` do `vercel.json` — a fonte única da política.
 *
 * POR QUE ISTO EXISTE, e por que NÃO é `vercel dev`. O caminho óbvio seria
 * subir o emulador oficial da plataforma, como o site institucional faz com
 * `wrangler pages dev`. Medido em 31/08/2026 contra este próprio repo
 * (projeto linkado, `vercel whoami` = silvaj1zero, CLI 50.4.9):
 *
 *   $ vercel dev --listen 19321 --yes     # sobe, roda `astro dev --port $PORT`
 *   $ curl -sI .../fonts/plex-mono-400.woff2   -> cache-control: no-cache
 *   $ curl -sI .../favicon.png                 -> cache-control: no-cache
 *
 * As duas rotas casam regras de `headers` do `vercel.json` que pedem
 * `public, max-age=31536000, immutable` e `public, max-age=86400, …`.
 * Nenhuma foi aplicada. Em dev-command mode o `vercel dev` delega ao servidor
 * do framework e NÃO aplica o bloco `headers` — logo ele não pode servir de
 * prova de uma política de segurança. Usá-lo como se pudesse seria repetir,
 * ao contrário, o erro que o B-35 do site registrou: passar por um caminho
 * que não prova o que anuncia.
 *
 * Este módulo então lê o `vercel.json` do repo e aplica as MESMAS regras num
 * servidor local. A prova que ele dá é honesta e delimitada: **o aplicativo
 * sobrevive à política escrita**. A outra metade — *a Vercel entrega os
 * headers como escritos* — só o domínio responde, e é por isso que o B-39 pede
 * `curl -sI https://ferramentas.toptier.net.br/` como evidência de fechamento.
 * Duas perguntas, duas provas; nenhuma finge ser a outra.
 *
 * Matching: as `source` da Vercel são path-to-regexp. Aqui traduzimos só o
 * subconjunto que este repo usa — regex puro sobre o caminho. Qualquer fonte
 * com sintaxe de parâmetro (`:slug`, `:path*`) faz este módulo FALHAR ALTO em
 * vez de aplicar uma regra pela metade: um header de segurança que silenciosa-
 * mente não casa é exatamente o defeito que este gate existe para pegar.
 */

import { readFileSync } from 'node:fs';

const SINTAXE_NAO_SUPORTADA = /:[A-Za-z_]/;

/** @typedef {{ source: string, regex: RegExp, headers: Record<string,string> }} RegraHeader */

/**
 * Lê e compila as regras de `headers` do vercel.json.
 * @param {string} caminho caminho do vercel.json
 * @returns {RegraHeader[]}
 */
export function lerRegrasDeHeader(caminho) {
  const json = JSON.parse(readFileSync(caminho, 'utf8'));
  const regras = Array.isArray(json.headers) ? json.headers : [];

  return regras.map((r) => {
    if (typeof r.source !== 'string') {
      throw new Error(`vercel.json: regra de header sem \`source\` string: ${JSON.stringify(r)}`);
    }
    if (SINTAXE_NAO_SUPORTADA.test(r.source)) {
      throw new Error(
        `vercel.json: a fonte "${r.source}" usa sintaxe de parâmetro do path-to-regexp, ` +
          'que este leitor não traduz. Aplicá-la pela metade esconderia um header ausente — ' +
          'estenda scripts/lib/vercel-headers.mjs antes de usar essa sintaxe.',
      );
    }
    /** @type {Record<string,string>} */
    const headers = {};
    for (const h of r.headers ?? []) headers[String(h.key).toLowerCase()] = String(h.value);
    return { source: r.source, regex: new RegExp(`^${r.source}$`), headers };
  });
}

/**
 * Headers que a plataforma aplicaria a um caminho, na ordem em que as regras
 * aparecem (regra posterior sobrescreve a anterior para a mesma chave — é o
 * comportamento da Vercel, e o oposto do Cloudflare Pages, onde a última seção
 * `/*` DESCARTA as anteriores inteiras; foi essa diferença que deixou o site
 * dois dias sem CSP no B-33).
 * @param {RegraHeader[]} regras
 * @param {string} caminho pathname, com barra inicial
 * @returns {Record<string,string>}
 */
export function headersParaCaminho(regras, caminho) {
  /** @type {Record<string,string>} */
  const saida = {};
  for (const r of regras) {
    if (r.regex.test(caminho)) Object.assign(saida, r.headers);
  }
  return saida;
}
