# Dump: C:\Users\Zero\Dropbox\MBA BRPÓS\PROJETOS DE AMBIENTES CRÍTICOS\Planejamento de Espaços Densidade e Crescimento\Density spec room pt v5 m2.xlsx

## Merged cells

G12:H12, B11:B21, B5:B9, B24:B31, B2:H2, B3:H3

## Células (ref | tipo | valor | fórmula)

| ref | valor | fórmula |
|---|---|---|
| B2 | Planilha de espaço e densidade: especificação de sala pequena (m2) |  |
| B3 | (valores de entrada nas células amarelas) |  |
| E4 | Gabinetes (TI) na sala |  |
| B5 | Parâmetros de densidade |  |
| D5 | Número de Gabinetes |  |
| E5 | 12 |  |
| D6 | Potência média desejada (projeto) por gabinete |  |
| E6 | 4 |  |
| F6 | kW |  |
| D7 | Potência de Pico (max.) por gabinete |  |
| E7 | 8 |  |
| F7 | kW |  |
| D8 | Incerteza de potência do gabinete +/- |  |
| E8 | 0.2 |  |
| F8 | (80% confidence) |  |
| D9 | Relação de potência gerenciada (TI) |  |
| E9 | 0.7 |  |
| B11 | Parâmetros de uso de espaço |  |
| D11 | Área por gabinete |  |
| E11 | 1.5 |  |
| F11 | m2 |  |
| E12 | Cabinets |  |
| F12 | m2 |  |
| G12 | subtotal    |  |
| D13 | Requisito de área de gabinete |  |
| E13 | 12 |  |
| F13 | 0 |  |
| G13 | 18 | =E13*$E$11+F13 |
| H13 | m2 |  |
| D14 | Espaço reservado para "staging" |  |
| E14 | 2 |  |
| F14 | 0 |  |
| G14 | 3 |  |
| H14 | m2 |  |
| D15 | Espaço sugerido para incerteza de densidade |  |
| E15 | 2 |  |
| G15 | 4.5 | =$E$24*$E$11/$E$6*($E$8/(1-$E$8)) |
| H15 | m2 |  |
| D16 | Espaço para incerteza de densidade |  |
| E16 | 2 |  |
| F16 | 0 |  |
| G16 | 3 |  |
| H16 | m2 |  |
| D17 | Espaço reservado para Energia |  |
| E17 | 2 |  |
| F17 | 0 |  |
| G17 | 3 |  |
| H17 | m2 |  |
| D18 | Espaço resenvado para Climatização |  |
| E18 | 2 |  |
| F18 | 0 |  |
| G18 | 3 |  |
| H18 | m2 |  |
| D19 | Espaço reservado para Sistema Auxiliares |  |
| E19 | 2 |  |
| F19 | 0 |  |
| G19 | 3 |  |
| H19 | m2 |  |
| D20 | Espaço reservado para "Storage" |  |
| F20 | 3 |  |
| G20 | 3 | =E20*$E$11+F20 |
| H20 | m2 |  |
| D21 | Espaço para saída, rampas e colunas |  |
| F21 | 3.7 |  |
| G21 | 3.7 |  |
| H21 | m2 |  |
| G22 | 39.700000000000003 | =SUM(G13:G14)+SUM(G16:G21) |
| H22 | m2 |  |
| B24 | Resumo do desempenho da sala |  |
| D24 | Potência nominal do sistema |  |
| E24 | 48 | =E5*E6 |
| F24 | kW |  |
| D25 | Potência operacional de TI esperada |  |
| E25 | 33.599999999999994 | =E24*E9 |
| F25 | kW |  |
| D26 | Potência nominal de pico por unidade |  |
| E26 | 8 | =E7 |
| F26 | kW |  |
| D27 | Potência nominal por gabinete |  |
| E27 | 4 | =E6 |
| F27 | kW |  |
| D28 | Potência média esperada por gabinete |  |
| E28 | 2.8 | =E6*E9 |
| F28 | kW |  |
| D29 | Tamanho da sala |  |
| E29 | 39.700000000000003 | =G22 |
| F29 | m2 |  |
| D30 | Espaço de TI não utilizado esperado |  |
| E30 | 0.15113350125944583 | =(G14+G16)/E29 |
| F30 | of total space |  |
| D31 | Densidade de potência da sala |  |
| E31 | 1209.0680100755667 | =1000*E24/G22 |
| F31 | W per m2 |  |
