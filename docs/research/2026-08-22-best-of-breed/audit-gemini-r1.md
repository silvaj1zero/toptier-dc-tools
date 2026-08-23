Ripgrep is not available. Falling back to GrepTool.
# Relatório de Auditoria Visual e UX: Suíte Top Tools
Este documento apresenta uma análise visual e de experiência de usuário (UX) minuciosa da suíte **Top Tools** (ferramentas.toptier.net.br), confrontando a implementação atual com os mais rigorosos padrões de design de produtos B2B modernos e refinados do ecossistema de tecnologia (referências: *Stripe*, *Linear* e *Vercel*).

---

## 1. Mapeamento de Achados (Findings) P0, P1 e P2

### Gravidade P0: Impedimentos Críticos, Acessibilidade e Quebras de Layout

* **[P0] Ausência Geral de Indicadores de Foco Acessíveis (`:focus-visible`)**
  * **Arquivo:** `src/styles/global.css`
  * **Recomendação:** Definir anéis de foco personalizados e consistentes com `--tt-green` para todos os elementos focáveis (botões, links, abas e cartões expansíveis), eliminando a dependência do outline padrão do navegador ou sua ausência.
* **[P0] Bug Crítico de Gap Vertical no Grid Mobile (`.grid-2`)**
  * **Arquivo:** `src/styles/global.css` (linha 304)
  * **Recomendação:** Alterar `gap: 0 1.25rem;` para `gap: 1.25rem;` (ou `gap: 1.25rem 1rem;`) para garantir que os inputs empilhados em telas pequenas tenham espaçamento vertical e não fiquem colados uns nos outros.
* **[P0] Emblema Remendado do Logo no Dark Mode**
  * **Arquivo:** `src/styles/global.css` (linha 166 e tokens)
  * **Recomendação:** Substituir o fundo branco sólido da classe `.brand-logo` (`--tt-logo-chip: #ffffff`) por uma imagem SVG transparente e otimizada ou aplicar um filtro CSS de inversão de luminância no dark mode.
* **[P0] Ilegibilidade Crítica do PUE Gauge em Telas Pequenas**
  * **Arquivo:** `src/components/PueGauge.tsx` (linhas 45-80)
  * **Recomendação:** Ajustar a escala responsiva do SVG ou ocultar as marcações de texto secundárias em telas mobile menores que 480px para evitar que as fontes fiquem com altura menor que 5px e se tornem borrões ilegíveis.

---

### Gravidade P1: Deficiências Estéticas Altas, Hierarquia Visual e Ruídos de Jornada

* **[P1] Inconsistência de Títulos H2 e H3 sem Escala Tipográfica Definida**
  * **Arquivo:** `src/styles/global.css` (linhas 140-150)
  * **Recomendação:** Definir tamanhos de fonte e margens explícitos e consistentes para as tags `h2` e `h3` em vez de depender dos estilos default do navegador.
* **[P1] Falta de Destaque Heróico para a Métrica Principal**
  * **Arquivo:** `src/styles/global.css` (linhas 330-345)
  * **Recomendação:** Aumentar drasticamente o tamanho do valor primário dos resultados (de `1.45rem` para no mínimo `2.5rem` ou `3rem`) e aplicar pesos e cores ultra-contrastantes para que o número principal domine a tela.
* **[P1] Hero Section Fraca e Diferenciador Crítico ("Metodologia Aberta") Ocultado na Home**
  * **Arquivo:** `src/pages/index.astro`
  * **Recomendação:** Redesenhar o cabeçalho/hero da Home com tipografia marcante em duas colunas e mover o bloco de metodologia para cima da dobra para comunicar imediatamente a autoridade do portal.
* **[P1] Fieldsets e Legendas HTML Datados que Transmitem Amadorismo**
  * **Arquivo:** `src/styles/global.css` (linhas 270-280)
  * **Recomendação:** Substituir as bordas contínuas cinzas e legendas flutuantes dos `fieldset` por agrupamentos modernos com espaçamentos limpos, divisórias sutis e fundos em cartões suaves.
* **[P1] Falta de Progressive Disclosure com Exposição Excessiva de Inputs Avançados**
  * **Arquivo:** `src/components/VirtualizationCalculator.tsx` e `src/components/PueCalculator.tsx`
  * **Recomendação:** Encapsular métricas opcionais e inputs secundários (como WUE, emissões CUE e melhorias avançadas) em seções colapsáveis (`details/summary` estilizados) para diminuir a carga cognitiva inicial.
* **[P1] Área de Toque Diminuta e Quebra de Linha Desordenada no Mobile para Menu de Navegação**
  * **Arquivo:** `src/styles/global.css` (linhas 185-200) e `src/layouts/Base.astro`
  * **Recomendação:** Adicionar padding interno vertical e horizontal de no mínimo `12px` nos links de navegação (`nav a`) e ajustar o espaçamento para garantir alvos de toque de no mínimo 44x44px em celulares.
* **[P1] Tabelas de Benchmark Longas Exigem Rolagem Horizontal Desconfortável no Celular**
  * **Arquivo:** `src/components/PueCalculator.tsx` (linhas 180-210)
  * **Recomendação:** Implementar uma diretiva CSS que converta as colunas da tabela em blocos verticais auto-suficientes de dados (estilo list-cards) quando visualizadas em telas de largura mobile.

---

### Gravidade P2: Detalhes Visuais, Polimento de Estados e Microinterações

* **[P2] Transições de Estados Bruscas (Ausência de Microinterações)**
  * **Arquivo:** `src/styles/global.css`
  * **Recomendação:** Aplicar transições de aceleração suave (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);`) ao passar o mouse em botões, links, toggles e ao alternar cores de fundo corporativas.
* **[P2] Contraste Limítrofe dos Badges de Status no Dark Mode**
  * **Arquivo:** `src/styles/global.css` (linhas 346-364)
  * **Recomendação:** Refinar a cor do texto e de fundo das classes `.badge` no modo escuro para assegurar conformidade total com a relação de contraste WCAG AA 4.5:1 para fontes pequenas de 12px.
* **[P2] Ausência de Feedback Visual em Atualizações de Dados Dinâmicas**
  * **Arquivo:** Todos os componentes em `src/components/`
  * **Recomendação:** Adicionar uma animação breve de transição de opacidade ou pulso na seção de resultados sempre que houver um recálculo dinâmico disparado pelas mudanças dos inputs.
* **[P2] Cabeçalho e Rodapé Monótonos e Institucionalmente Fracos**
  * **Arquivo:** `src/layouts/Base.astro`
  * **Recomendação:** Elevar a identidade institucional refinando o logo "Top Tools", estruturando o rodapé em uma grade de links organizada e incorporando links para redes profissionais da empresa.

---

## 2. Os 5 Quick-Wins Visuais de Maior Impacto

1. **Microinterações Globais:** Adicionar transições suaves no arquivo `global.css` com `transition: all 0.2s ease-in-out` nos botões, links, toggles de tema e elementos interativos para dar uma sensação moderna de fluidez instantaneamente.
2. **Correção do Gap de Inputs no Mobile:** Mudar o gap de `.grid-2` de `gap: 0 1.25rem` para `gap: 1.25rem` no `global.css`. Isso evita que os campos de inputs e legendas grudem verticalmente quando a grade quebrar em telas de celulares.
3. **Máscara Inteligente para o Logo no Dark Mode:** Remover o fundo retangular branco grosseiro da imagem do logo no modo escuro. Utilizar um filtro CSS de inversão cromática (`filter: invert(1) brightness(2)`) ou carregar uma imagem SVG otimizada de alta resolução com fundo transparente.
4. **Gigantismo Heróico do Resultado Principal:** Modificar as classes de exibição do valor principal de saída (ex: valor final de PUE e Economia de Energia) para exibir o número resultante em fontes imponentes (mínimo `3rem` de tamanho, usando a fonte mono para dados numéricos), fazendo-o saltar aos olhos do usuário antes de qualquer leitura detalhada.
5. **Modernização Visual de Fieldsets:** Remover as bordas finas datadas das tags `fieldset` e a sobreposição de `legend`. Substituí-las por cartões de fundo suave (`--tt-bg-soft`) com cantos arredondados, usando margens e cabeçalhos em negrito bem estruturados para delinear as divisões lógicas do formulário.

---

## 3. Veredito de Conformidade Estética

**Veredito:** **REPROVADO** em comparação ao padrão visual Best-of-Breed.  
*Embora a suíte ostente uma riqueza acadêmica invejável e um rigor de cálculo impecável, o produto final assemelha-se a uma aplicação montada sobre um template genérico antigo. A experiência é severamente comprometida por quebras de espaçamento em telas verticais, ausência de transições interativas e falta de uma assinatura visual moderna que comunique autoridade institucional à primeira vista.*
