# -*- coding: utf-8 -*-
"""Goal-loop GL2/GL3 — compara observado (runtime vivo) vs esperado (engine).

Uso: python comparar.py observado.txt
Critérios:
  - match exato: |Δ| relativo <= 1e-6 (mesmo número, ruído de float)
  - correspondência p/ meta 98%: |Δ| relativo <= 1e-4 (0,01%)
  - divergência: acima disso — listada para justificativa individual
"""
import json, sys, os

base = os.path.dirname(os.path.abspath(__file__))
amostra = json.load(open(os.path.join(base, 'amostra.json'), encoding='utf-8'))
esperado = {c['id']: c['esperado'] for c in amostra['cenarios']}

obs_raw = open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(base, 'observado.txt'), encoding='utf-8').read()
obs = {}
for linha in obs_raw.replace('\n', ';').split(';'):
    linha = linha.strip()
    if not linha or '|' not in linha:
        continue
    cid, vals = linha.split('|')
    nums = vals.split(',')
    obs[cid] = {f'l{l}': (float(v) if v != 'NaN' else float('nan')) for l, v in zip([10, 25, 50, 75, 100], nums)}

pontos = 0
exatos = 0
corresp = 0
divergentes = []
faltando = []
for cid, esp in esperado.items():
    if cid not in obs:
        faltando.append(cid)
        continue
    for k, e in esp.items():
        o = obs[cid][k]
        pontos += 1
        if e != e or o != o:  # NaN
            divergentes.append((cid, k, e, o, 'NaN'))
            continue
        rel = abs(o - e) / max(1e-12, abs(e))
        if rel <= 1e-6:
            exatos += 1
            corresp += 1
        elif rel <= 1e-4:
            corresp += 1
        else:
            divergentes.append((cid, k, e, o, f'{rel:.2e}'))

print(f'cenários comparados: {len(obs)}/{len(esperado)} | pontos: {pontos}')
print(f'match EXATO (<=1e-6 rel): {exatos} ({100*exatos/max(1,pontos):.2f}%)')
print(f'correspondência (<=1e-4 rel): {corresp} ({100*corresp/max(1,pontos):.2f}%)')
print(f'divergentes: {len(divergentes)}')
for d in divergentes[:20]:
    print('  DIV', d)
if faltando:
    print('faltando:', faltando[:10])
meta = 100 * corresp / max(1, pontos)
print('META >=98%:', 'PASS' if meta >= 98 else 'FAIL', f'({meta:.2f}%)')
