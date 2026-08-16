# Diagnose bundle — como `/aiox-doctor` (e o `/triage` do time) consome

> Story `029.W2.2` (D6 `ADR-COCKPIT-GLOBAL-SKILLS-PROVISIONING`). O bundle é gerado pelo COCKPIT
> (não por esta skill) por dois caminhos equivalentes — mesmo coletor, duas portas:
> - CLI: `aiox-cockpit --diagnose`
> - Menu: `Ajuda ▸ Reportar problema…`

## Onde encontrar

`~/.aiox/diagnose/aiox-diagnose-<epoch_ms>.json` — arquivo **LOCAL**; nada é enviado
automaticamente (v1). O usuário anexa/envia manualmente, ou cita o path ao rodar `/aiox-doctor`.

## Formato (schema_version: 1)

| Campo | O quê | Como usar no triage |
|-------|-------|---------------------|
| `schema_version` | versão do shape | branch de leitura futura |
| `generated_at_ms` | epoch ms da geração | correlacionar com o relato do usuário |
| `app_version` / `update_channel` | versão do cockpit + canal preferido (`null` = default) | reproduzir na build certa; canal errado explica update "sumido" |
| `os` / `arch` | plataforma | matriz de repro |
| `session.pane_count` | nº de panes do snapshot vivo (`null` = sem snapshot) | cockpit "vazio" vs "carregado" no incidente |
| `session.backup_generations` | gerações de backup do snapshot | sinal de crashes repetidos no fechamento |
| `crashes_tail[]` | últimas entradas de `crashes.jsonl` (panics estruturados), scrubbed | causa direta de fechamento |
| `log_tail[]` | tail do `cockpit.log` mais novo (cap por KB), scrubbed | contexto do incidente |
| `spawn_error_lines[]` | linhas de falha de spawn extraídas dos tails | pane que "não abre" — a razão vem aqui. NOTA: não há store dedicado de spawn-errors hoje; o log É a fonte |
| `updater_events` | `null` — fonte `028.W3.1` ainda não existe | quando aterrissar, últimos N eventos do updater |
| `notes[]` | fontes ausentes + truncamentos DECLARADOS | nunca assumir cobertura de fonte que está listada como ausente |

## Invariantes de privacidade (D10 — o que pode afirmar ao usuário, com precisão)

**Garantia estrutural (absoluta):** o coletor NUNCA lê comandos executados, buffers de terminal/PTY,
programs/args/cwd de panes, nem conteúdo de arquivos do usuário — o snapshot de sessão contribui só
CONTAGENS. O que nunca é lido não pode vazar, independente de padrão de redação.

**Garantia de redação (por PADRÃO NOMEADO E TESTADO, não clarividência):** as linhas de tail
(logs/crashes) passam por redação cobrindo: home path + username (qualquer path, incl. UNC) →
`<user-home>`/`<user>`; userinfo de URL (`scheme://user:senha@host`) → `«redacted»@host`; segredos
`key=value`/`Bearer`; prefixos de token `ghp_`/`github_pat_`/`sk-`/`xox…`/`AKIA`/`eyJ` (JWT);
e-mails → `«email»`; IPv4 → `«ip»`; runs hex ≥32 → `«hex»`. Cada categoria tem exemplo de fixture no
teste de exclusões (`crates/aiox-cockpit/src/diagnose.rs`). **Risco residual** (shapes de segredo
sem padrão reconhecível — ex.: senha solta sem `key=`, IPv6, tokens proprietários): rastreado em
`docs/backlog/diagnose-scrub-residual-hardening.md` — ao citar trechos do bundle numa issue pública,
releia o trecho antes de publicar (o consentimento de publicação desta skill já exige isso).

## Fluxo típico no `/aiox-doctor`

1. Usuário narra o problema; se o bundle existe, leia-o ANTES de examinar a máquina (é o estado do
   momento do incidente, não o de agora).
2. `crashes_tail`/`spawn_error_lines` primeiro (causa), `log_tail` depois (contexto).
3. `notes[]` diz o que NÃO está coberto — examine essas fontes ao vivo na máquina.
4. Ao publicar issue, o consentimento de publicação desta skill continua valendo — mostrar o
   conteúdo completo (incluindo trechos do bundle) antes de publicar.
