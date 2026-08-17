# -*- coding: utf-8 -*-
"""Gera src/lib/pue-model/modelo-se.gen.ts: modelo transpilado PODADO à clausura
de dependências das saídas usadas pela ferramenta Top Tier.

Poda: BFS reverso a partir das células de saída, seguindo G(s,r,c) e R(s,r1,c1,r2,c2).
"""
import os, re, json

BASE = os.path.dirname(__file__)
REPO = os.path.normpath(os.path.join(BASE, '..', '..', '..', '..'))
OUT = os.path.join(REPO, 'src', 'lib', 'pue-model', 'modelo-se.gen.ts')

import importlib.util
spec = importlib.util.spec_from_file_location('t', os.path.join(BASE, 'transpilar.py'))
# reusar o scan/split do transpilar sem executá-lo: reimplementa (simples)
code = open(os.path.join(BASE, 'cells_1.js'), encoding='utf-8').read()
SHEETS = json.loads(re.search(r'_xg_all_sheets=(\[[^\]]+\])', code).group(1))

def scan(code):
    cells, sheet, i, n = [], 0, 0, len(code)
    while i < n:
        ms = re.compile(r'_xg_cs=(\d+)').match(code, i)
        if ms:
            sheet = int(ms.group(1)); i = ms.end(); continue
        if code.startswith('new _C(', i):
            j = i + 7; depth = 1; instr = None; esc = False
            while j < n and depth:
                ch = code[j]
                if esc: esc = False
                elif instr:
                    if ch == '\\': esc = True
                    elif ch == instr: instr = None
                elif ch in '"\'': instr = ch
                elif ch == '(': depth += 1
                elif ch == ')': depth -= 1
                j += 1
            cells.append((sheet, code[i+7:j-1])); i = j; continue
        i += 1
    return cells

def split_args(s):
    out, depth, instr, esc, cur = [], 0, None, False, []
    for ch in s:
        if esc: esc = False; cur.append(ch); continue
        if instr:
            if ch == '\\': esc = True
            elif ch == instr: instr = None
            cur.append(ch); continue
        if ch in '"\'': instr = ch; cur.append(ch); continue
        if ch in '([{': depth += 1
        elif ch in ')]}': depth -= 1
        if ch == ',' and depth == 0:
            out.append(''.join(cur).strip()); cur = []
        else:
            cur.append(ch)
    out.append(''.join(cur).strip())
    return out

lits, fx = {}, {}
for sheet, args_src in scan(code):
    a = split_args(args_src)
    r, c = int(a[0]), int(a[1])
    key = (sheet, r, c)
    try:
        lits[key] = json.loads(a[2]) if len(a) > 2 else None
    except Exception:
        lits[key] = 0
    if len(a) > 3 and a[3].startswith('function'):
        body = re.sub(r'^function\(\)\{return\s*', '', a[3])
        body = re.sub(r';\}$', '', body)
        body = re.sub(r'this\.gc\((\d+),(\d+),(\d+)\)', r'G(\3,\1,\2)', body)
        body = re.sub(r'this\.gr\((\d+),(\d+),(\d+),(\d+),(\d+)\)', r'R(\5,\3,\4,\1,\2)', body)
        body = re.sub(r'this\.(\w+)\(', r'F.\1(', body)
        fx[key] = body

# --- Saídas necessárias ---
CI, PM, DL, TXT = 3, 4, 5, 2
targets = set()
for r in range(3, 104):
    targets.add((CI, r, 40)); targets.add((CI, r, 42))            # curva PUE + labels
for r in range(100, 104):
    for c in (0, 1, 4): targets.add((CI, r, c))                   # alocação 4-cat (energia/custo)
for r in range(55, 60):
    for c in (0, 1, 4, 6): targets.add((CI, r, c))                # breakdown elétrico
for r in range(60, 66):
    for c in (0, 1, 6): targets.add((CI, r, c))                   # breakdown cooling
for r in range(74, 104):
    for c in range(0, 5): targets.add((DL, r, c))                 # tabela de assumptions
targets.add((TXT, 219, 1)); targets.add((TXT, 109, 1))            # textos de resultado

# --- clausura ---
ref_g = re.compile(r'G\((\d+),(\d+),(\d+)\)')
ref_r = re.compile(r'R\((\d+),(\d+),(\d+),(\d+),(\d+)\)')
need = set(); fila = list(targets)
while fila:
    k = fila.pop()
    if k in need: continue
    need.add(k)
    src = fx.get(k)
    if not src: continue
    for m in ref_g.finditer(src):
        fila.append((int(m.group(1)), int(m.group(2)), int(m.group(3))))
    for m in ref_r.finditer(src):
        s = int(m.group(1)); r1, c1, r2, c2 = map(int, m.group(2, 3, 4, 5))
        for rr in range(min(r1, r2), max(r1, r2) + 1):
            for cc in range(min(c1, c2), max(c1, c2) + 1):
                fila.append((s, rr, cc))

lit_need = {k: v for k, v in lits.items() if k in need and k not in fx}
fx_need = {k: v for k, v in fx.items() if k in need}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('// GERADO — NÃO EDITAR. Fonte: planilha Xcelsius da "Data Center Efficiency and\n')
    f.write('// PUE Calculator" (Schneider Electric, se.com — TradeOff Tool), capturada em\n')
    f.write('// 2026-08-17 e transpilada por docs/research/2026-08-17-pue-calculator/fonte-xcelsius/gerar-ts.py.\n')
    f.write('// Podada à clausura de dependências das saídas (curva PUE, alocações, assumptions).\n')
    f.write('/* eslint-disable */\n')
    f.write(f'export const SHEETS = {json.dumps(SHEETS)} as const;\n')
    f.write('export type CellVal = number | string | boolean | null;\n')
    f.write('export interface Fns { [k: string]: (...a: any[]) => any }\n')
    f.write('export type Getter = (s: number, r: number, c: number) => CellVal;\n')
    f.write('export type Ranger = (s: number, r1: number, c1: number, r2: number, c2: number) => CellVal[][];\n')
    f.write('export const LITERAIS: Array<[number, number, number, CellVal]> = [\n')
    for (s, r, c), v in sorted(lit_need.items()):
        f.write(f'  [{s},{r},{c},{json.dumps(v)}],\n')
    f.write('];\n')
    f.write('export const FORMULAS: Array<[number, number, number, (F: Fns, G: Getter, R: Ranger) => CellVal]> = [\n')
    for (s, r, c), src in sorted(fx_need.items()):
        f.write(f'  [{s},{r},{c},(F,G,R)=>{src}],\n')
    f.write('];\n')
print(f'clausura: {len(need)} células | literais: {len(lit_need)} | fórmulas: {len(fx_need)}')
print('->', OUT)
