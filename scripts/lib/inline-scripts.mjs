/**
 * Extração dos scripts inline de um HTML — a ÚNICA definição no repo.
 *
 * Existe como módulo compartilhado de propósito. Três lugares precisam da
 * mesma resposta para "quais inline existem e qual o hash de cada um": o
 * sincronizador que escreve os hashes no `vercel.json`, o gate local e o
 * verificador de produção. Duas regexes ligeiramente diferentes dariam falso
 * verde num lado e falha no outro — e a falha apareceria como formulário morto
 * em silêncio, que é exatamente o modo de defeito que a CSP hash-only existe
 * para não reintroduzir.
 *
 * EXECUTÁVEL vs NÃO-EXECUTÁVEL. `script-src` governa o que o navegador
 * EXECUTA. Um `<script type="application/ld+json">` é dado, não código: o
 * navegador não o executa e não exige hash para ele. Incluí-lo no conjunto
 * faria os hashes mudarem a cada edição de título ou descrição de qualquer
 * página — churn que ninguém sustenta, e que acabaria em alguém commitando
 * `'unsafe-inline'` de volta "só para destravar".
 *
 * Essa exclusão é hipótese verificada, não presumida: o gate confere, nas 9
 * rotas sob a política hash-only, que há zero `securitypolicyviolation` E que
 * o bloco JSON-LD continua no DOM. Se algum dia um navegador passar a exigir
 * o hash do JSON-LD, é esse gate que acusa — não um usuário.
 *
 * Medido em 31/08/2026 neste repo: 5 hashes executáveis (tema e menu, ambos
 * `is:inline` do Base.astro, mais 3 bootstrappers de hidratação do Astro),
 * estáveis entre builds repetidos e idênticos com ou sem as variáveis
 * `PUBLIC_*` presentes.
 */

import { createHash } from 'node:crypto';

/** `type` que o navegador trata como script executável. Vazio = clássico. */
const TIPOS_EXECUTAVEIS = /^(module|text\/javascript|application\/javascript)$/i;

/**
 * @typedef {object} ScriptInline
 * @property {string} corpo   conteúdo exato entre as tags (o que entra no hash)
 * @property {string} atributos texto cru dos atributos, para diagnóstico
 * @property {string} tipo    valor de `type`, ou '' quando ausente
 * @property {boolean} executavel se `script-src` exige hash para ele
 * @property {string} hash    `sha256-<base64>` do corpo
 */

/**
 * Todos os `<script>` inline de um HTML (com `src` são externos e ficam fora).
 * @param {string} html
 * @returns {ScriptInline[]}
 */
export function extrairScriptsInline(html) {
  /** @type {ScriptInline[]} */
  const achados = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const atributos = m[1];
    const corpo = m[2];
    if (/\bsrc\s*=/.test(atributos)) continue; // externo: governado por host, não por hash
    if (!corpo.trim()) continue; // vazio não executa nada
    const tipo = (atributos.match(/type\s*=\s*["']([^"']+)["']/i) ?? [])[1] ?? '';
    achados.push({
      corpo,
      atributos: atributos.trim(),
      tipo,
      executavel: tipo === '' || TIPOS_EXECUTAVEIS.test(tipo),
      hash: hashDoCorpo(corpo),
    });
  }
  return achados;
}

/**
 * O hash exatamente como a CSP o exige: sobre os bytes UTF-8 do corpo, sem
 * normalizar nada. Qualquer "limpeza" aqui (trim, troca de fim de linha)
 * produziria um hash que o navegador não reconhece.
 * @param {string} corpo
 * @returns {string} `sha256-<base64>`
 */
export function hashDoCorpo(corpo) {
  return `sha256-${createHash('sha256').update(corpo, 'utf8').digest('base64')}`;
}

/**
 * Conjunto ordenado dos hashes que `script-src` precisa declarar para um HTML.
 * @param {string} html
 * @returns {string[]}
 */
export function hashesExecutaveis(html) {
  return [...new Set(extrairScriptsInline(html).filter((s) => s.executavel).map((s) => s.hash))].sort();
}
