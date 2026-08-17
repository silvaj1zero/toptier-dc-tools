# -*- coding: utf-8 -*-
"""Extrai a planilha do dashboard Xcelsius (cells_1.js) da SE PUE Calculator.

Formato-fonte: new _C(row, col, valorCache[, function(){return <formula>;}])
agrupado por aba via marcadores _xg_cs=N. Saída: um .md por aba em ./extraido/,
com valor cacheado e fórmula traduzida (this.gc(r,c,s) -> Sheet!R{r}C{c}).
"""
import os, re, json

SRC = os.path.join(os.path.dirname(__file__), 'cells_1.js')
OUT = os.path.join(os.path.dirname(__file__), 'extraido')
os.makedirs(OUT, exist_ok=True)

code = open(SRC, encoding='utf-8').read()

m = re.search(r'_xg_all_sheets=(\[[^\]]+\])', code)
SHEETS = json.loads(m.group(1))

def parse_cells(code):
    """Varre o código rastreando o índice de aba corrente (_xg_cs=N) e cada new _C(...)."""
    cells = {i: [] for i in range(len(SHEETS))}
    sheet = 0
    i = 0
    n = len(code)
    while i < n:
        ms = re.compile(r'_xg_cs=(\d+)').match(code, i)
        if ms:
            sheet = int(ms.group(1)); i = ms.end(); continue
        if code.startswith('new _C(', i):
            j = i + len('new _C(')
            depth = 1; instr = None; esc = False
            while j < n and depth > 0:
                ch = code[j]
                if esc: esc = False
                elif instr:
                    if ch == '\\': esc = True
                    elif ch == instr: instr = None
                elif ch in '"\'': instr = ch
                elif ch == '(': depth += 1
                elif ch == ')': depth -= 1
                j += 1
            args_src = code[i+len('new _C('):j-1]
            cells[sheet].append(args_src)
            i = j; continue
        i += 1
    return cells

def split_args(s):
    """Divide os args de nível 0 (row, col, valor[, fn])."""
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

def fmt_formula(fn_src):
    body = re.sub(r'^function\(\)\{return\s*', '', fn_src)
    body = re.sub(r';\}$', '', body)
    def gc(m):
        r, c, s = int(m.group(1)), int(m.group(2)), int(m.group(3))
        name = SHEETS[s] if 0 <= s < len(SHEETS) else f'S{s}'
        return f"[{name}!r{r}c{c}]"
    body = re.sub(r'this\.gc\((\d+),(\d+),(\d+)\)', gc, body)
    body = body.replace('this._doc.', '').replace('doc.', '')
    return body

cells = parse_cells(code)
resumo = {}
for si, lst in cells.items():
    name = SHEETS[si]
    resumo[name] = len(lst)
    safe = re.sub(r'\W+', '-', name)
    with open(os.path.join(OUT, f'{si:02d}-{safe}.md'), 'w', encoding='utf-8') as f:
        f.write(f'# Aba {si}: {name} — {len(lst)} células\n\n')
        f.write('| r | c | valor (cache/default) | fórmula |\n|---|---|---|---|\n')
        for src in lst:
            a = split_args(src)
            r, c = a[0], a[1]
            val = a[2] if len(a) > 2 else ''
            fn = fmt_formula(a[3]) if len(a) > 3 and a[3].startswith('function') else ''
            val = val.replace('|', '\\|').replace('\n', ' ')[:160]
            fn = fn.replace('|', '\\|').replace('\n', ' ')
            f.write(f'| {r} | {c} | {val} | `{fn}` |\n' if fn else f'| {r} | {c} | {val} |  |\n')
print(json.dumps(resumo, ensure_ascii=False, indent=1))
