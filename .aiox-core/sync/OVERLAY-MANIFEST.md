# Overlay manifest — `.aiox-project/skills-tiers.json`

Contrato do **manifesto do overlay** lido por `.aiox-core/sync/sync.mjs`. Um único arquivo por camada de
overlay; o sync **nunca** lê um segundo manifesto para essa camada.

> **Por que este arquivo e não um novo.** A story `055.W1.1` abriu este seam para as *tags de tier* do
> overlay e fechou com o princípio ratificado — *"SECOND SOURCE feeding the SAME decision point, never a
> second gate"*. A `055.W2.2` (D23) precisava de um manifesto para declarar identidade + sombreamento;
> criar um terceiro arquivo quebraria esse princípio. Então é **o mesmo arquivo, o mesmo leitor**, com um
> bloco novo no topo.

## Forma

```jsonc
{
  "overlay": {
    "id": "<plugin-id>",                       // raiz do namespace no disco do cliente — IMUTÁVEL (D24(a))
    "shadows": { "<base-skill>": "<motivo>" }  // única forma de sombrear uma skill base (D23)
  },
  "skills": {                                  // 029.W1.3 / 055.W1.1 — inalterado
    "<skill>": { "tier": "base" | "pack:sinkra-os" | "pack:sinkra-os:mapear" | "pack:sinkra-os:forjar" }
  }
}
```

Ausência do arquivo, do bloco `overlay`, ou de `overlay.shadows` = **zero sombreamento**. Nunca aborta o
sync: forma inválida gera `WARN` e é ignorada (fail-**closed** — ignorar uma declaração de sombreamento
preserva a skill base).

## `overlay.id` — escolha SEM VOLTA (D24(a), AC7 da `055.W2.2`)

O `id` **não é rótulo de catálogo**: ele é **raiz de caminho no disco de cada cliente instalado**
(`.claude/skills/<id>/<skill>`). Consequências, todas medidas no comportamento do próprio sync:

1. **Renomear não renomeia uma entrada — invalida todo caminho já projetado.** Em cada máquina instalada,
   os caminhos antigos passam a ser itens *stale* e entram no **caminho de poda** do sync
   (`syncAdapter`, ramo `GLOBAL`, laço `prevNames`).
2. Se o usuário tiver **editado localmente** qualquer um desses itens, o `managedSkipReason` recusa podar
   e o item fica **órfão** no disco: nem gerenciado pelo novo id, nem removível automaticamente.
3. O `id` também é a identidade que aparece no aviso de sombreamento e na entrada do catálogo
   (`055.W3.1`), e é o que a CI do repo de catálogo verifica (`055.W3.3`).

**Portanto: fixe o `id` antes da primeira publicação e nunca o mude.** Um id novo é um plugin novo.

## `overlay.shadows` — sombrear exige declaração (D23, AC3)

| Situação | Efeito |
|----------|--------|
| Skill de overlay **flat** (`.aiox-project/skills/<skill>`) com nome de skill base, **declarada** | sombreia: a versão do overlay substitui a base, e o sync imprime `! DECLARED SHADOW` com o motivo |
| Idem, **não declarada** | **recusada**: a base é mantida, a cópia do overlay **não** é projetada, e o sync imprime `✗ REFUSED SHADOW (undeclared)` com a correção exata |
| Skill de **plugin** (`.aiox-project/skills/<plugin-id>/<skill>`) | sempre materializa em `<plugin-id>/<skill>` — **nunca** no nome simples (AC1) |
| Skill de plugin cujo nome consta em `shadows` | a skill **base** é **retirada** da projeção (`! BASE WITHHELD`); a do plugin continua sob o namespace |

O motivo é **obrigatório e não-vazio**. Um sombreamento sem motivo declarado é exatamente o override
silencioso que a D23 proíbe — entrada sem motivo é ignorada com `WARN`.

**Atribuição.** Um sombreamento vindo de skill de plugin só é honrado quando o `overlay.id` **nomeia
aquele plugin**. Um manifesto declarado por `acme` não retira skill base nenhuma em nome de `globex` —
declaração é atribuível ou não é declaração. (Hoje há **um** manifesto por camada de overlay, porque a
camada é trocada atomicamente por um instalador só; quando o catálogo da `055.W3.1` permitir vários
plugins coexistindo, o `shadows` precisa passar a ser chaveado por plugin.)

**Colisão de `id` com nome de skill.** Se o `overlay.id` for igual ao nome de uma skill base, o diretório
`skills/<id>` seria **ao mesmo tempo** uma skill e uma raiz de namespace. O sync **recusa o plugin
inteiro** com `WARN`, em vez de aninhar os arquivos dele dentro da skill base (que a poda por-item do alvo
GLOBAL depois apagaria, dependendo da ordem). O invariante de verdade é de publicação — `055.W3.3`, CI do
catálogo; aqui é só o anteparo de runtime.

## Namespace por construção (D23, AC2)

O discriminador é o **disco**, não um campo de manifesto:

- diretório que contém `SKILL.md` → **é uma skill** (camada first-party do projeto consumidor);
- diretório que contém diretórios-de-skill → **é uma raiz de plugin**, e cada filho vira o item
  `<plugin-id>/<skill>`.

Por isso a colisão entre dois plugins **não é representável**: `a/review` e `b/review` não são a mesma
chave do mapa de nomes. Não há colisão para detectar, contar ou reportar — é o contrário do
`sync.mjs:206-209` pré-D23, que resolvia por *"project wins wholly"*, **contava** e **nunca errava**.

O `id` do plugin e o nome da skill precisam ser tokens kebab (`^[a-z0-9][a-z0-9-]*$`) — é o mesmo
`SAFE_NAME` que impede um nome vindo do consumidor de escapar de `skills/` via `join()`.

## Quem é DONO deste arquivo — leia antes de editá-lo à mão

| Situação | Dono | Editar à mão? |
|----------|------|---------------|
| Camada própria do projeto consumidor (repo com `.aiox-project/` commitado) | você | **sim** — é arquivo de fonte, versionado |
| Camada materializada por um PLUGIN instalado (`~/.aiox/.aiox-project/`) | o instalador do plugin | **NÃO** — `plugin_channel.rs::write_plugin_tiers_manifest` reescreve o arquivo INTEIRO a cada install e `atomic_swap_overlay` troca a árvore. Sua edição é apagada em silêncio |

No segundo caso, a declaração precisa vir **no bundle do próprio plugin**. Hoje o canal não propaga o
bloco `overlay` — ou seja, **nenhum plugin consegue declarar sombreamento ainda**. Isso é fail-closed
(nada sombreia) e está cardado em
`docs/backlog/plugin-nao-consegue-declarar-shadow-canal-reescreve-o-manifesto.md`.

## Código de saída de uma recusa — decisão, não acidente

Um `✗ REFUSED SHADOW` **avisa e o sync continua com exit 0**. Escolha deliberada:

- a projeção produzida está **correta**, não quebrada — a skill base, que é o que se está protegendo,
  materializou. A recusa é o mecanismo **funcionando**;
- sair diferente de zero deixaria **um** plugin de terceiro com colisão não-declarada **derrubar o
  install inteiro** do usuário (`provision.rs` roda `sync.mjs claude` e checa o resultado). Trocar uma
  recusa por-item por uma falha total de install é estritamente pior para quem usa;
- o lugar onde colisão não-declarada **deve** ser fatal é o **publish**, na CI do catálogo (D22 /
  `055.W3.3`) — que é exatamente onde a D20 coloca verificação mecânica sem review humano.

A visibilidade fica por conta do `console.warn`, do nome do item e da contagem na linha de resumo.

## Projeção do nome declarado

- **Claude** (`.claude/skills/<plugin-id>/<skill>/SKILL.md`): o `SKILL.md` é copiado verbatim.
- **Codex** (`.codex/skills/<plugin-id>/<skill>/SKILL.md`): a transformação nativa reescreve o
  frontmatter para `name: <plugin-id>:<skill>`, para que o namespace **sobreviva à projeção** em vez de
  ser achatado num nome simples colidente — que é a única propriedade de que esta linha depende.

> **Escopo honesto da afirmação.** `<plugin>:<skill>` é a forma verificada em primeira mão no
> **marketplace do Claude**. Se o **CLI do Codex** aceita `:` em `name:` **não foi verificado** — sem
> teste e sem citação de documentação. `[Confiança: MÉDIA]`. Não leia isto como afirmação de capacidade
> cross-CLI; está cardado em `docs/backlog/codex-declared-name-plugin-skill-forma-nao-verificada.md`.
