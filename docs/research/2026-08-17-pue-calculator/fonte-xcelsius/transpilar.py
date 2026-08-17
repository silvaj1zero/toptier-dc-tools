# -*- coding: utf-8 -*-
"""Transpila cells_1.js (Xcelsius) para um módulo ES executável (modelo exato).

Gera modelo-se.mjs com:
  - SHEETS: nomes das abas
  - CELLS: lista de {s, r, c, v}  (literais/cache)
  - FORMULAS: lista de {s, r, c, src}  onde src é expressão JS usando F.*, G(s,r,c), R(s,r1,c1,r2,c2)
O avaliador (avaliador.mjs) resolve o grafo com memoização.
"""
import os, re, json

BASE = os.path.dirname(__file__)
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
            cells.append((sheet, code[i+7:j-1]))
            i = j; continue
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

lits, formulas = [], []
for sheet, args_src in scan(code):
    a = split_args(args_src)
    r, c = int(a[0]), int(a[1])
    val_src = a[2] if len(a) > 2 else 'null'
    fn_src = a[3] if len(a) > 3 else None
    # literal (cache/default)
    try:
        v = json.loads(val_src)
    except Exception:
        v = val_src  # expressão rara; guarda como string crua
    lits.append({'s': sheet, 'r': r, 'c': c, 'v': v})
    if fn_src and fn_src.startswith('function'):
        body = re.sub(r'^function\(\)\{return\s*', '', fn_src)
        body = re.sub(r';\}$', '', body)
        body = re.sub(r'this\.gc\((\d+),(\d+),(\d+)\)', r'G(\3,\1,\2)', body)
        body = re.sub(r'this\.gr\((\d+),(\d+),(\d+),(\d+),(\d+)\)', r'R(\5,\3,\4,\1,\2)', body)
        body = re.sub(r'this\.(\w+)\(', r'F.\1(', body)
        formulas.append({'s': sheet, 'r': r, 'c': c, 'src': body})

out = os.path.join(BASE, 'modelo-se.mjs')
with open(out, 'w', encoding='utf-8') as f:
    f.write('// GERADO por transpilar.py a partir de cells_1.js (SE PUE Calculator, Xcelsius HTML5).\n')
    f.write('// NÃO EDITAR À MÃO. Fonte: se-pue-calculator-fonte-xcelsius.txt (captura 2026-08-17).\n')
    f.write(f'export const SHEETS = {json.dumps(SHEETS)};\n')
    f.write(f'export const CELLS = {json.dumps(lits)};\n')
    f.write('export const FORMULAS = [\n')
    for fo in formulas:
        f.write(f'  {{s:{fo["s"]},r:{fo["r"]},c:{fo["c"]},f:(F,G,R)=>{fo["src"]}}},\n')
    f.write('];\n')
print('literais:', len(lits), '| fórmulas:', len(formulas), '->', out)
