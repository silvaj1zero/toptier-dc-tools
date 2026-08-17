/**
 * Avaliador do modelo transpilado da SE PUE Calculator (grafo de células com
 * memoização). Semântica Excel/Xcelsius pragmática — validada contra o estado
 * default da ferramenta viva (PUE 2,18 @50%, alocação 11,3/40,4/46,0/2,4%).
 *
 * Procedência: docs/research/2026-08-17-pue-calculator/ (captura + transpilação).
 */
import { FORMULAS, LITERAIS, type CellVal, type Fns, type Getter, type Ranger } from './modelo-se.gen';

const num = (v: unknown): number => {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const flat = (a: unknown[]): unknown[] =>
  a.flatMap((x) => (Array.isArray(x) ? flat(x) : [x]));

export const F: Fns = {
  If: (c, a, b) => (c === true || num(c) !== 0 ? a : b),
  Int: (v) => Math.floor(num(v)),
  abs: (v) => Math.abs(num(v)),
  and: (...a) => a.every((x) => x === true || num(x) !== 0),
  ceiling: (v, s = 1) => Math.ceil(num(v) / num(s || 1)) * num(s || 1),
  concatenate: (...a) => a.map((x) => (x === null || x === undefined ? '' : String(x))).join(''),
  divide: (a, b) => num(a) / num(b),
  equals: (a, b) => {
    if (typeof a === 'string' || typeof b === 'string') {
      const na = Number(a);
      const nb = Number(b);
      if (
        Number.isFinite(na) &&
        Number.isFinite(nb) &&
        String(a).trim() !== '' &&
        String(b).trim() !== ''
      ) {
        return na === nb;
      }
      return String(a ?? '') === String(b ?? '');
    }
    return num(a) === num(b);
  },
  floor: (v, s = 1) => Math.floor(num(v) / num(s || 1)) * num(s || 1),
  ge: (a, b) => num(a) >= num(b),
  gt: (a, b) => num(a) > num(b),
  log10: (v) => Math.log10(num(v)),
  lt: (a, b) => num(a) < num(b),
  max: (...a) => Math.max(...flat(a).map(num)),
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
  sum: (...a) => flat(a).reduce((acc: number, x) => acc + num(x), 0),
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
  vlookup: (val, table: CellVal[][], col) => {
    const v = num(val);
    let res: CellVal | undefined;
    for (const row of table) {
      if (num(row[0]) <= v) res = row[Number(col) - 1];
      else break;
    }
    return res !== undefined ? res : table[0] ? table[0][Number(col) - 1] : 0;
  },
};

export class ModeloCelulas {
  private lit = new Map<string, CellVal>();
  private fx = new Map<string, (F: Fns, G: Getter, R: Ranger) => CellVal>();
  private memo = new Map<string, CellVal>();
  private stack = new Set<string>();

  constructor() {
    for (const [s, r, c, v] of LITERAIS) this.lit.set(`${s}:${r}:${c}`, v);
    for (const [s, r, c, f] of FORMULAS) this.fx.set(`${s}:${r}:${c}`, f);
  }

  set(s: number, r: number, c: number, v: CellVal): void {
    this.lit.set(`${s}:${r}:${c}`, v);
    this.memo.clear();
  }

  get(s: number, r: number, c: number): CellVal {
    const k = `${s}:${r}:${c}`;
    if (this.memo.has(k)) return this.memo.get(k)!;
    const fn = this.fx.get(k);
    let v: CellVal;
    if (fn) {
      if (this.stack.has(k)) return this.lit.get(k) ?? 0;
      this.stack.add(k);
      const G: Getter = (s2, r2, c2) => this.get(s2, r2, c2);
      const R: Ranger = (s2, r1, c1, r2, c2) => {
        const rows: CellVal[][] = [];
        for (let rr = Math.min(r1, r2); rr <= Math.max(r1, r2); rr++) {
          const row: CellVal[] = [];
          for (let cc = Math.min(c1, c2); cc <= Math.max(c1, c2); cc++) row.push(this.get(s2, rr, cc));
          rows.push(row);
        }
        return rows;
      };
      try {
        v = fn(F, G, R);
      } catch {
        v = null;
      }
      this.stack.delete(k);
    } else {
      v = this.lit.has(k) ? this.lit.get(k)! : null;
    }
    this.memo.set(k, v);
    return v;
  }
}
