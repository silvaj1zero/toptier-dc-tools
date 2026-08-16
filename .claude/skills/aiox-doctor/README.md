# aiox-doctor — proveniência e SOT (D2 `ADR-COCKPIT-GLOBAL-SKILLS-PROVISIONING`)

**A fonte de verdade (SOT) desta skill é `.aiox-core/skills/aiox-doctor/` (este diretório).**

## Histórico

`aiox-doctor` nasceu publicada em `SynkraAI/aiox-cockpit-issues` (`skills/aiox-doctor/SKILL.md`),
instalada manualmente via curl/`Invoke-WebRequest` — fora do embed `AIOX_CORE_BUNDLE` que já
carrega as demais skills `sinkra-os`. Story `029.W1.1` (D2 da ADR) migrou o conteúdo para dentro
deste repo, para que `aiox-doctor` passe a ser um artefato de produto versionado e
auto-atualizado pelo MESMO mecanismo `include_dir!` (`crates/aiox-cockpit/src/provision.rs:37`)
que já embarca as 31 skills existentes — sem infraestrutura de embed nova.

O conteúdo migrado corresponde ao HEAD de `main` em `SynkraAI/aiox-cockpit-issues:skills/
aiox-doctor/SKILL.md` no momento da migração (2026-07-19), verificado idêntico ao commit `ed00fe8`
citado pela ADR — sem divergência a reconciliar.

## Regra (NON-NEGOTIABLE)

- **SOT vive AQUI** (`.aiox-core/skills/aiox-doctor/`). Toda edição futura de `aiox-doctor`
  acontece neste diretório, nunca no repo público.
- **`SynkraAI/aiox-cockpit-issues` é um MIRROR** — mantido como fallback de instalação
  **headless/sem-cockpit** (um usuário sem o AIOX Cockpit instalado ainda consegue puxar a skill
  via curl/`Invoke-WebRequest` direto do repo público). Ele é gerado/copiado a partir daqui,
  **nunca editado à mão** a partir de agora.
- Esta story **não automatiza** a publicação do mirror (sem CI/script de push ao repo público) —
  isso é um follow-up não nomeado pela ADR, fora de escopo aqui (D2 condition explícita).

## Classificação de tier

`aiox-doctor` é classificada como `base` (livre, nunca paywalled) em
`.aiox-core/skills-tiers.json` — ver esse manifest para o schema completo consumido por
`029.W1.3`.
