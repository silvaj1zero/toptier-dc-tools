/*
 * REFERÊNCIA — artefato "Calculadora virtualizacao" gerado no diálogo claude.ai
 * "Calculadora de eficiência energética em data centers" (2026-08-15/16).
 * Capturado em 2026-08-16 para servir de implementação de referência do port
 * para este repo (ver 00-plano.md). NÃO é código de produção deste projeto:
 * a engine será portada para src/lib/virtualization.ts (funções puras testadas)
 * e a UI reescrita no design system da suíte.
 */
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ============================================================
   CALCULADORA DIDÁTICA — ECONOMIA DE ENERGIA POR VIRTUALIZAÇÃO
   Reconstrução educacional do modelo do TradeOff Tool da
   Schneider Electric (descontinuado), conforme documentado em:
   - Blog SE / Wendy Torell (2013): curve fit P_host = P_srv × N_VM^0.38837
   - APC/SE White Paper 118 (Virtualization and Cloud Computing)
   Coeficientes de infraestrutura calibrados para reproduzir o
   caso de referência (1000 kW, 500 kW IT, PUE 2.28 → 1.72).
   ============================================================ */

const EXP = 0.38837; // expoente do curve fit (SPEC.org, Google WSC, Sine Nomine)
const U_POR_SERVIDOR = 2; // premissa: servidor médio de 2U
const U_RACK = 42;
const HORAS_ANO = 8760;

// Presets de infraestrutura: frações de perdas fixas (× capacidade) e
// proporcionais (× carga IT). pf/pp = cadeia elétrica (UPS/PDU/dist.),
// cf/cp = climatização, lt = iluminação/auxiliares.
const INFRA = {
  n_cw: { label: "N power, N cooling (água gelada)", pf: 0.06, pp: 0.10, cf: 0.30, cp: 0.40, lt: 0.03 },
  n1_cw: { label: "N+1 power, N+1 cooling (água gelada)", pf: 0.075, pp: 0.11, cf: 0.34, cp: 0.42, lt: 0.03 },
  dn_cw: { label: "2N power, N+1 cooling (água gelada)", pf: 0.09, pp: 0.12, cf: 0.38, cp: 0.44, lt: 0.03 },
  n_dx: { label: "N power, N cooling (expansão direta)", pf: 0.06, pp: 0.10, cf: 0.24, cp: 0.55, lt: 0.03 },
};

// Efeito de cada melhoria sobre os coeficientes
function coefsComMelhorias(base, m, loadRatio) {
  let pf = base.pf, pp = base.pp, cf = base.cf, cp = base.cp;
  if (m.upsAltaEf) { pf *= 0.42; pp *= 0.40; } // UPS alta eficiência
  if (m.rightsizeUPS) pf *= loadRatio; // right-size UPS/PDU
  if (m.rowCooling) { cf *= 0.57; cp *= 0.625; } // cooling em fileira
  if (m.rightsizeCRAC) cf *= loadRatio; // right-size CRAC/CRAH
  const blank = m.blanking ? 0.95 : 1; // blanking panels
  return { pf, pp, cf, cp, blank, lt: base.lt };
}

function potenciaInfra(cargaIT, capacidade, c) {
  const eletrica = c.pf * capacidade + c.pp * cargaIT;
  const cooling = (c.cf * capacidade + c.cp * cargaIT) * c.blank;
  const aux = c.lt * capacidade;
  return { eletrica, cooling, aux, total: eletrica + cooling + aux };
}

const fmt = (n, d = 0) => n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });
const money = (n, cur) => (cur === "R$" ? "R$ " : "$ ") + (n >= 1e6 ? fmt(n / 1e6, 2) + " M" : fmt(n / 1e3, 0) + " k");

export default function CalculadoraVirtualizacao() {
  // ---- Pré-virtualização ----
  const [capacidade, setCapacidade] = useState(1000);
  const [cargaIT, setCargaIT] = useState(500);
  const [pctServidores, setPctServidores] = useState(50);
  const [numServidores, setNumServidores] = useState(750);
  const [utilRackU, setUtilRackU] = useState(70);
  const [custoKWh, setCustoKWh] = useState(0.12);
  const [moeda, setMoeda] = useState("$");
  const [infraKey, setInfraKey] = useState("n_cw");
  // ---- Pós-virtualização ----
  const [pctVirt, setPctVirt] = useState(50);
  const [ratio, setRatio] = useState(10);
  const [mel, setMel] = useState({
    rightsizeCRAC: true, rightsizeUPS: true, upsAltaEf: true, rowCooling: true, blanking: true,
  });
  const [mostrarModelo, setMostrarModelo] = useState(false);

  const r = useMemo(() => {
    const base = INFRA[infraKey];
    const carga = Math.min(cargaIT, capacidade);

    // --- Estado pré ---
    const pServidoresPre = carga * (pctServidores / 100);
    const pNaoServidor = carga - pServidoresPre;
    const pPorServidor = numServidores > 0 ? pServidoresPre / numServidores : 0;
    const infraPre = potenciaInfra(carga, capacidade, coefsComMelhorias(base, {}, 1));
    const totalPre = carga + infraPre.total;
    const puePre = carga > 0 ? totalPre / carga : 0;
    const racksPre = Math.ceil((numServidores * U_POR_SERVIDOR) / (U_RACK * (utilRackU / 100)));

    // --- Consolidação (curve fit WP118) ---
    const virtualizaveis = numServidores * (pctVirt / 100);
    const hosts = Math.ceil(virtualizaveis / ratio);
    const remanescentes = numServidores - virtualizaveis;
    const pPorHost = pPorServidor * Math.pow(ratio, EXP);
    const pServidoresPos = remanescentes * pPorServidor + hosts * pPorHost;
    const servidoresPos = Math.round(remanescentes + hosts);
    const cargaPos = pNaoServidor + pServidoresPos;
    const loadRatio = carga > 0 ? cargaPos / carga : 1;

    // --- Estado pós ---
    const infraPos = potenciaInfra(cargaPos, capacidade, coefsComMelhorias(base, mel, loadRatio));
    const totalPos = cargaPos + infraPos.total;
    const puePos = cargaPos > 0 ? totalPos / cargaPos : 0;
    const racksPos = Math.ceil((servidoresPos * U_POR_SERVIDOR) / (U_RACK * (utilRackU / 100)));

    const contaPre = totalPre * HORAS_ANO * custoKWh;
    const contaPos = totalPos * HORAS_ANO * custoKWh;

    return {
      pre: { servidores: numServidores, racks: racksPre, pServ: pServidoresPre, carga, infra: infraPre.total, total: totalPre, pue: puePre, conta: contaPre },
      pos: { servidores: servidoresPos, racks: racksPos, pServ: pServidoresPos, carga: cargaPos, infra: infraPos.total, total: totalPos, pue: puePos, conta: contaPos },
    };
  }, [capacidade, cargaIT, pctServidores, numServidores, utilRackU, custoKWh, infraKey, pctVirt, ratio, mel]);

  const linhas = [
    { k: "Servidores", pre: fmt(r.pre.servidores), pos: fmt(r.pos.servidores), red: 1 - r.pos.servidores / r.pre.servidores },
    { k: "Racks", pre: fmt(r.pre.racks), pos: fmt(r.pos.racks), red: 1 - r.pos.racks / r.pre.racks },
    { k: "Potência dos servidores", pre: fmt(r.pre.pServ) + " kW", pos: fmt(r.pos.pServ) + " kW", red: 1 - r.pos.pServ / r.pre.pServ },
    { k: "Carga IT total", pre: fmt(r.pre.carga) + " kW", pos: fmt(r.pos.carga) + " kW", red: 1 - r.pos.carga / r.pre.carga },
    { k: "Infraestrutura física", pre: fmt(r.pre.infra) + " kW", pos: fmt(r.pos.infra) + " kW", red: 1 - r.pos.infra / r.pre.infra },
    { k: "Potência total do DC", pre: fmt(r.pre.total) + " kW", pos: fmt(r.pos.total) + " kW", red: 1 - r.pos.total / r.pre.total },
    { k: "PUE", pre: r.pre.pue.toFixed(2), pos: r.pos.pue.toFixed(2), red: 1 - r.pos.pue / r.pre.pue },
    { k: "Conta anual de energia", pre: money(r.pre.conta, moeda), pos: money(r.pos.conta, moeda), red: 1 - r.pos.conta / r.pre.conta },
  ];

  const custo = (kw) => kw * HORAS_ANO * custoKWh;
  const dadosGrafico = [
    { nome: "Data center", Pré: custo(r.pre.total), Pós: custo(r.pos.total) },
    { nome: "Infraestrutura", Pré: custo(r.pre.infra), Pós: custo(r.pos.infra) },
    { nome: "IT total", Pré: custo(r.pre.carga), Pós: custo(r.pos.carga) },
    { nome: "Servidores", Pré: custo(r.pre.pServ), Pós: custo(r.pos.pServ) },
  ];

  const AZUL = "#1E5AA8", VERDE = "#1F9D55", TINTA = "#12181F";
  const toggle = (key) => setMel((m) => ({ ...m, [key]: !m[key] }));

  const Campo = ({ label, children }) => (
    <label className="flex items-center justify-between gap-3 py-2 border-b" style={{ borderColor: "#E3E7E2" }}>
      <span className="text-sm" style={{ color: "#3A444E" }}>{label}</span>
      {children}
    </label>
  );
  const inputCls = "w-28 text-right rounded px-2 py-1 text-sm font-mono border outline-none focus:ring-2";
  const inputStyle = { borderColor: "#C9D1CB", background: "#FFFFFF", color: TINTA };

  const Check = ({ id, label }) => (
    <button onClick={() => toggle(id)}
      className="flex items-center gap-2 text-sm py-1.5 px-2 rounded transition-colors text-left"
      style={{ background: mel[id] ? "#E7F4EC" : "transparent", color: mel[id] ? "#166534" : "#5A6570" }}>
      <span className="w-4 h-4 rounded-sm border flex items-center justify-center text-[10px] font-bold"
        style={{ borderColor: mel[id] ? VERDE : "#B4BCB6", background: mel[id] ? VERDE : "#fff", color: "#fff" }}>
        {mel[id] ? "✓" : ""}
      </span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ background: "#F5F6F3", color: TINTA, fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .mono { font-family: 'IBM Plex Mono', monospace; }
        input[type=range]{ accent-color:${VERDE}; }
      `}</style>

      {/* Cabeçalho */}
      <header className="px-5 pt-6 pb-4 max-w-5xl mx-auto">
        <p className="mono text-[11px] tracking-widest uppercase" style={{ color: "#6B7680" }}>Ferramenta didática · trade-off</p>
        <h1 className="text-xl md:text-2xl font-semibold leading-snug mt-1">
          Calculadora de economia de energia por virtualização
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5A6570" }}>
          Reconstrução educacional do modelo do TradeOff Tool da Schneider Electric (White Paper 118).
        </p>
      </header>

      {/* Painel instrumento: PUE pré → pós */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="rounded-lg px-4 py-3 flex flex-wrap items-baseline gap-x-6 gap-y-1"
          style={{ background: TINTA, color: "#E8EDEA" }}>
          <span className="mono text-xs uppercase tracking-wider" style={{ color: "#8A97A2" }}>PUE</span>
          <span className="mono text-2xl font-semibold" style={{ color: "#7FB3E8" }}>{r.pre.pue.toFixed(2)}</span>
          <span className="mono text-lg" style={{ color: "#8A97A2" }}>→</span>
          <span className="mono text-2xl font-semibold" style={{ color: "#6FD695" }}>{r.pos.pue.toFixed(2)}</span>
          <span className="mono text-sm ml-auto" style={{ color: "#6FD695" }}>
            economia anual {money(r.pre.conta - r.pos.conta, moeda)}
          </span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-5 grid md:grid-cols-2 gap-5">
        {/* ===== Entradas ===== */}
        <section className="rounded-lg p-4" style={{ background: "#FFFFFF", border: "1px solid #E3E7E2" }}>
          <h2 className="mono text-xs uppercase tracking-widest mb-2" style={{ color: AZUL }}>Pré-virtualização</h2>
          <Campo label="Capacidade IT do data center (kW)">
            <input className={inputCls} style={inputStyle} type="number" value={capacidade}
              onChange={(e) => setCapacidade(Math.max(1, +e.target.value))} />
          </Campo>
          <Campo label="Carga IT total (kW)">
            <input className={inputCls} style={inputStyle} type="number" value={cargaIT}
              onChange={(e) => setCargaIT(Math.max(1, +e.target.value))} />
          </Campo>
          <Campo label="% da carga IT que é servidor">
            <input className={inputCls} style={inputStyle} type="number" value={pctServidores}
              onChange={(e) => setPctServidores(Math.min(100, Math.max(1, +e.target.value)))} />
          </Campo>
          <Campo label="Número total de servidores">
            <input className={inputCls} style={inputStyle} type="number" value={numServidores}
              onChange={(e) => setNumServidores(Math.max(1, +e.target.value))} />
          </Campo>
          <Campo label="Ocupação de U por rack (%)">
            <input className={inputCls} style={inputStyle} type="number" value={utilRackU}
              onChange={(e) => setUtilRackU(Math.min(100, Math.max(10, +e.target.value)))} />
          </Campo>
          <Campo label="Custo da energia (por kWh)">
            <span className="flex items-center gap-1">
              <select value={moeda} onChange={(e) => setMoeda(e.target.value)}
                className="text-sm rounded border px-1 py-1" style={inputStyle}>
                <option>$</option><option>R$</option>
              </select>
              <input className={inputCls} style={inputStyle} type="number" step="0.01" value={custoKWh}
                onChange={(e) => setCustoKWh(Math.max(0.01, +e.target.value))} />
            </span>
          </Campo>
          <Campo label="Arquitetura da infraestrutura">
            <select value={infraKey} onChange={(e) => setInfraKey(e.target.value)}
              className="text-sm rounded border px-2 py-1 max-w-[190px]" style={inputStyle}>
              {Object.entries(INFRA).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Campo>

          <h2 className="mono text-xs uppercase tracking-widest mt-5 mb-2" style={{ color: VERDE }}>Pós-virtualização</h2>
          <div className="py-2">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "#3A444E" }}>Servidores virtualizáveis</span>
              <span className="mono font-medium">{pctVirt}%</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={pctVirt}
              onChange={(e) => setPctVirt(+e.target.value)} className="w-full" />
          </div>
          <div className="py-2">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "#3A444E" }}>Razão de consolidação (VMs por host)</span>
              <span className="mono font-medium">{ratio}:1</span>
            </div>
            <input type="range" min="2" max="30" step="1" value={ratio}
              onChange={(e) => setRatio(+e.target.value)} className="w-full" />
          </div>

          <p className="text-sm mt-3 mb-1" style={{ color: "#3A444E" }}>Melhorias na infraestrutura</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <Check id="rightsizeCRAC" label="Right-size CRAC/CRAH" />
            <Check id="rowCooling" label="Cooling em fileira" />
            <Check id="rightsizeUPS" label="Right-size UPS/PDU" />
            <Check id="blanking" label="Blanking panels" />
            <Check id="upsAltaEf" label="UPS de alta eficiência" />
          </div>
        </section>

        {/* ===== Resultados ===== */}
        <section className="rounded-lg p-4" style={{ background: "#FFFFFF", border: "1px solid #E3E7E2" }}>
          <h2 className="mono text-xs uppercase tracking-widest mb-3" style={{ color: "#3A444E" }}>Comparação</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="mono text-[11px] uppercase tracking-wide" style={{ color: "#6B7680" }}>
                  <th className="text-left font-medium pb-2"> </th>
                  <th className="text-right font-medium pb-2" style={{ color: AZUL }}>Pré</th>
                  <th className="text-right font-medium pb-2" style={{ color: VERDE }}>Pós</th>
                  <th className="text-right font-medium pb-2">Redução</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.k} className="border-t" style={{ borderColor: "#EEF1EC" }}>
                    <td className="py-1.5 pr-2" style={{ color: "#3A444E" }}>{l.k}</td>
                    <td className="py-1.5 text-right mono">{l.pre}</td>
                    <td className="py-1.5 text-right mono">{l.pos}</td>
                    <td className="py-1.5 text-right mono font-medium"
                      style={{ color: l.red > 0 ? VERDE : "#B4483E" }}>
                      {fmt(Math.abs(l.red) * 100, 0)}%{l.red < 0 ? " ↑" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mono text-xs uppercase tracking-widest mt-5 mb-2" style={{ color: "#3A444E" }}>
            Custo anual de energia
          </h2>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dadosGrafico} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EC" vertical={false} />
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: "#5A6570" }} />
                <YAxis tick={{ fontSize: 10, fill: "#5A6570" }}
                  tickFormatter={(v) => fmt(v / 1000, 0) + "k"} width={44} />
                <Tooltip formatter={(v) => money(v, moeda)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Pré" fill={AZUL} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Pós" fill={VERDE} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>

      {/* ===== Modelo e premissas ===== */}
      <div className="max-w-5xl mx-auto px-5 pb-8">
        <button onClick={() => setMostrarModelo(!mostrarModelo)}
          className="mono text-xs uppercase tracking-widest underline underline-offset-4"
          style={{ color: "#3A444E" }}>
          {mostrarModelo ? "Ocultar" : "Ver"} modelo e premissas
        </button>
        {mostrarModelo && (
          <div className="mt-3 rounded-lg p-4 text-sm leading-relaxed"
            style={{ background: "#FFFFFF", border: "1px solid #E3E7E2", color: "#3A444E" }}>
            <p className="mb-2">
              <strong>Consolidação de servidores.</strong> A potência de cada host consolidado segue o
              curve fit documentado pela Schneider Electric:{" "}
              <span className="mono">P_host = P_servidor × N_VMs^0.38837</span>, derivado do benchmark
              SPEC.org power, do paper do Google (Power Provisioning for a Warehouse-sized Computer) e do
              estudo da Sine Nomine Associates. A raiz sublinear captura que um host com 10 VMs consome
              ~2,4× a potência de um servidor, e não 10×.
            </p>
            <p className="mb-2">
              <strong>Infraestrutura física.</strong> Modelo de componentes com perdas fixas
              (proporcionais à capacidade instalada) e proporcionais (à carga IT), cobrindo cadeia
              elétrica (UPS/PDU/distribuição), climatização e auxiliares. Coeficientes calibrados para
              reproduzir o caso de referência do WP 118 (1 MW, 50% de carga, PUE 2,28; pós-projeto
              PUE ≈ 1,72). É isto que produz o paradoxo do PUE: reduzir a carga IT sem right-sizing
              piora o PUE, pois as perdas fixas passam a pesar mais.
            </p>
            <p className="mb-2">
              <strong>Melhorias.</strong> Right-size CRAC/CRAH e UPS/PDU escalam as perdas fixas pela
              razão entre carga pós e pré. UPS de alta eficiência reduz perdas fixas (×0,42) e
              proporcionais (×0,40). Cooling em fileira reduz perdas fixas (×0,57) e proporcionais
              (×0,625) da climatização. Blanking panels aplicam −5% ao consumo total de climatização.
            </p>
            <p className="mb-2">
              <strong>Espaço.</strong> Racks estimados assumindo servidor médio de 2U em racks de 42U,
              limitados pela ocupação de U informada.
            </p>
            <p style={{ color: "#8A2C22" }}>
              <strong>Aviso.</strong> Ferramenta didática. Os coeficientes de infraestrutura são
              aproximações calibradas, não medições de campo. Para decisões de projeto, use auditoria
              com dados reais (ex.: metodologia FOMM ou ferramentas DOE/LBNL como DC Pro e o Electrical
              Power Chain Tool).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
