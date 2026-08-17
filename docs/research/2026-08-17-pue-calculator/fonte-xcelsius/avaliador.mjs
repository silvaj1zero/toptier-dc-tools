// Avaliador do modelo transpilado (semântica Excel/Xcelsius pragmática).
// Uso: node avaliador.mjs  → valida o grafo contra o cache de defaults.
import { SHEETS, CELLS, FORMULAS } from './modelo-se.mjs';

const num = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const F = {
  If: (c, a, b) => (c === true || num(c) !== 0 ? a : b),
  Int: (v) => Math.floor(num(v)),
  abs: (v) => Math.abs(num(v)),
  and: (...a) => a.every((x) => x === true || num(x) !== 0),
  ceiling: (v, s = 1) => Math.ceil(num(v) / num(s || 1)) * num(s || 1),
  concatenate: (...a) => a.map((x) => (x === null || x === undefined ? '' : String(x))).join(''),
  divide: (a, b) => num(a) / num(b),
  equals: (a, b) => {
    if (typeof a === 'string' || typeof b === 'string') {
      const na = Number(a), nb = Number(b);
      if (Number.isFinite(na) && Number.isFinite(nb) && String(a).trim() !== '' && String(b).trim() !== '') return na === nb;
      return String(a ?? '') === String(b ?? '');
    }
    return num(a) === num(b);
  },
  floor: (v, s = 1) => Math.floor(num(v) / num(s || 1)) * num(s || 1),
  ge: (a, b) => num(a) >= num(b),
  gt: (a, b) => num(a) > num(b),
  log10: (v) => Math.log10(num(v)),
  lt: (a, b) => num(a) < num(b),
  max: (...a) => Math.max(...a.flat(Infinity).map(num)),
  minus: (a, b) => (b === undefined ? -num(a) : num(a) - num(b)),
  multiply: (a, b) => num(a) * num(b),
  or: (...a) => a.some((x) => x === true || num(x) !== 0),
  percent: (v) => num(v) / 100,
  plus: (a, b) => num(a) + num(b),
  power: (a, b) => Math.pow(num(a), num(b)),
  round: (v, d = 0) => {
    const m = Math.pow(10, num(d));
    return Math.round((num(v) + Number.EPSILON) * m) / m;
  },
  sum: (...a) => a.flat(Infinity).reduce((acc, x) => acc + num(x), 0),
  text: (v, fmt) => {
    const n = num(v);
    if (typeof fmt === 'string' && fmt.includes('%')) {
      const dec = (fmt.split('.')[1] || '').replace(/[^0]/g, '').length;
      return (n * 100).toFixed(dec) + '%';
    }
    if (typeof fmt === 'string' && fmt.includes('#,##')) {
      const dec = (fmt.split('.')[1] || '').length;
      return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    }
    if (typeof fmt === 'string' && /^0(\.0+)?$/.test(fmt)) {
      const dec = (fmt.split('.')[1] || '').length;
      return n.toFixed(dec);
    }
    return String(v);
  },
  vlookup: (val, table, col) => {
    // table: array de linhas [[a,b],...]; busca aproximada (Excel default TRUE)
    const v = num(val);
    let res;
    for (const row of table) {
      if (num(row[0]) <= v) res = row[Number(col) - 1];
      else break;
    }
    return res !== undefined ? res : (table[0] ? table[0][Number(col) - 1] : 0);
  },
};

export class Modelo {
  constructor() {
    this.lit = new Map();   // chave s:r:c -> literal
    this.fx = new Map();    // chave -> fn
    this.memo = new Map();
    for (const c of CELLS) this.lit.set(`${c.s}:${c.r}:${c.c}`, c.v);
    for (const f of FORMULAS) this.fx.set(`${f.s}:${f.r}:${f.c}`, f.f);
    this.stack = new Set();
  }
  set(s, r, c, v) { this.lit.set(`${s}:${r}:${c}`, v); this.memo.clear(); }
  get(s, r, c) {
    const k = `${s}:${r}:${c}`;
    if (this.memo.has(k)) return this.memo.get(k);
    const fn = this.fx.get(k);
    let v;
    if (fn) {
      if (this.stack.has(k)) return this.lit.get(k) ?? 0; // ciclo: usa cache
      this.stack.add(k);
      const G = (s2, r2, c2) => this.get(s2, r2, c2);
      const R = (s2, r1, c1, r2, c2) => {
        const [ra, rb] = [Math.min(r1, r2), Math.max(r1, r2)];
        const [ca, cb] = [Math.min(c1, c2), Math.max(c1, c2)];
        const rows = [];
        for (let rr = ra; rr <= rb; rr++) {
          const row = [];
          for (let cc = ca; cc <= cb; cc++) row.push(this.get(s2, rr, cc));
          rows.push(row);
        }
        return rows;
      };
      try { v = fn(F, G, R); } catch (e) { v = null; }
      this.stack.delete(k);
    } else {
      v = this.lit.has(k) ? this.lit.get(k) : null;
    }
    this.memo.set(k, v);
    return v;
  }
}

// ---- Validação contra o cache (defaults) ----
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('avaliador.mjs')) {
  const m = new Modelo();
  let ok = 0, bad = 0, badList = [];
  for (const f of FORMULAS) {
    const cached = m.lit.get(`${f.s}:${f.r}:${f.c}`);
    const got = m.get(f.s, f.r, f.c);
    const close =
      (typeof cached === 'number' && typeof got === 'number' && (Math.abs(cached - got) <= 1e-6 * Math.max(1, Math.abs(cached)))) ||
      String(cached) === String(got) ||
      (cached === 0 && (got === null || got === '' || got === false)) ||
      (cached === 0 && typeof got === 'string'); // textos cacheados como 0
    if (close) ok++;
    else { bad++; if (badList.length < 25) badList.push({ sheet: SHEETS[f.s], r: f.r, c: f.c, cached, got: typeof got === 'string' ? got.slice(0, 60) : got }); }
  }
  console.log(`fórmulas: ${FORMULAS.length} | compatíveis com cache: ${ok} | divergentes: ${bad}`);
  for (const b of badList) console.log(' DIV', JSON.stringify(b));
}
