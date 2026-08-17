# Aba 4: Power Meters — 538 células

| r | c | valor (cache/default) | fórmula |
|---|---|---|---|
| 0 | 28 | 0 | `[Power Meters!r5c1]` |
| 1 | 1 | 1000 |  |
| 2 | 1 | 200 |  |
| 2 | 28 | 0 | `[Power Meters!r27c12]` |
| 2 | 29 | 0 | `[Power Meters!r27c13]` |
| 2 | 30 | 0 | `[Power Meters!r27c14]` |
| 3 | 1 | 0 | `this.multiply([Power Meters!r1c1],[Power Meters!r5c1])` |
| 3 | 28 | 0 | `[Power Meters!r6c1]` |
| 4 | 28 | 0 | `this.vlookup([Power Meters!r0c28],this.gr(106,26,6,25,4),2)` |
| 5 | 1 | 0.5 |  |
| 5 | 3 | "∞" |  |
| 6 | 1 | 0 | `this.divide([Power Meters!r16c4],[Power Meters!r11c1])` |
| 6 | 25 | 0 |  |
| 6 | 26 | 1 |  |
| 6 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r6c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r6c25],2))),[Power Meters!r6c25]),0.01)` |
| 6 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r6c27])` |
| 7 | 1 | 23 |  |
| 7 | 25 | 0.01 |  |
| 7 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r7c27])` |
| 7 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r7c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r7c25],2))),[Power Meters!r7c25]),[Power Meters!r7c25])` |
| 7 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r7c27])` |
| 8 | 1 | 0 | `[Interface TXT!r44c2]` |
| 8 | 25 | 0.02 |  |
| 8 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r8c27])` |
| 8 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r8c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r8c25],2))),[Power Meters!r8c25]),[Power Meters!r8c25])` |
| 8 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r8c27])` |
| 9 | 25 | 0.03 |  |
| 9 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r9c27])` |
| 9 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r9c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r9c25],2))),[Power Meters!r9c25]),[Power Meters!r9c25])` |
| 9 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r9c27])` |
| 10 | 25 | 0.04 |  |
| 10 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r10c27])` |
| 10 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r10c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r10c25],2))),[Power Meters!r10c25]),[Power Meters!r10c25])` |
| 10 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r10c27])` |
| 11 | 1 | 0 | `this.If(this.equals([Power Meters!r3c1],"NA"),this.divide(this.multiply([Power Meters!r1c1],this.plus(this.minus(this.plus(1,[Power Meters!r14c13])),this.power(this.minus(this.multiply(this.plus(1,[Power Meters!r14c13]),this.plus(1,[Power Meters!r14c13])),this.multiply(this.multiply(4,this.plus([Power Meters!r14c14],[Power Meters!r17c14])),this.minus([Power Meters!r14c12],this.divide([Power Meters!r2c1],[Power Meters!r1c1])))),0.5))),this.multiply(2,this.plus([Power Meters!r14c14],[Power Meters!r17c14]))),[Power Meters!r3c1])` |
| 11 | 25 | 0.05 |  |
| 11 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r11c27])` |
| 11 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r11c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r11c25],2))),[Power Meters!r11c25]),[Power Meters!r11c25])` |
| 11 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r11c27])` |
| 12 | 25 | 0.06 |  |
| 12 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r12c27])` |
| 12 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r12c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r12c25],2))),[Power Meters!r12c25]),[Power Meters!r12c25])` |
| 12 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r12c27])` |
| 13 | 9 | 0 | `this.plus(this.plus(this.plus([Power Meters!r14c9],[Power Meters!r14c10]),[Power Meters!r17c10]),this.If(this.equals([Device Losses!r9c19],"Yes"),this.plus([Power Meters!r18c18],[Power Meters!r21c18]),0))` |
| 13 | 10 | 0 | `this.plus(this.plus([Power Meters!r13c12],this.multiply([Power Meters!r13c13],[Power Meters!r13c9])),this.multiply(this.multiply([Power Meters!r13c14],[Power Meters!r13c9]),[Power Meters!r13c9]))` |
| 13 | 11 | 0 | `this.divide(this.multiply([Power Meters!r13c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 13 | 12 | 0 | `[Device Losses!r19c17]` |
| 13 | 13 | 0 | `[Device Losses!r19c18]` |
| 13 | 14 | 0 | `[Device Losses!r19c19]` |
| 13 | 15 | 0 | `this.multiply([Power Meters!r13c13],this.plus(this.plus([Power Meters!r14c12],[Power Meters!r17c12]),this.If(this.equals([Device Losses!r9c19],"Yes"),[Power Meters!r18c12],0)))` |
| 13 | 16 | 0 | `this.multiply([Power Meters!r13c13],[Power Meters!r14c13])` |
| 13 | 25 | 0.07 |  |
| 13 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r13c27])` |
| 13 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r13c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r13c25],2))),[Power Meters!r13c25]),[Power Meters!r13c25])` |
| 13 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r13c27])` |
| 14 | 9 | 0 | `[Power Meters!r5c1]` |
| 14 | 10 | 0 | `this.plus(this.plus([Power Meters!r14c12],this.multiply([Power Meters!r14c13],[Power Meters!r14c9])),this.multiply(this.multiply([Power Meters!r14c14],[Power Meters!r14c9]),[Power Meters!r14c9]))` |
| 14 | 11 | 0 | `this.divide(this.multiply([Power Meters!r14c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 14 | 12 | 0 | `[Device Losses!r23c17]` |
| 14 | 13 | 0 | `[Device Losses!r23c18]` |
| 14 | 14 | 0 | `[Device Losses!r23c19]` |
| 14 | 15 | 0 |  |
| 14 | 16 | 0 |  |
| 14 | 25 | 0.08 |  |
| 14 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r14c27])` |
| 14 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r14c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r14c25],2))),[Power Meters!r14c25]),[Power Meters!r14c25])` |
| 14 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r14c27])` |
| 15 | 9 | 0 | `[Power Meters!r5c1]` |
| 15 | 10 | 0 | `this.plus(this.plus([Power Meters!r15c12],this.multiply([Power Meters!r15c13],[Power Meters!r15c9])),this.multiply(this.multiply([Power Meters!r15c14],[Power Meters!r15c9]),[Power Meters!r15c9]))` |
| 15 | 11 | 0 | `this.divide(this.multiply([Power Meters!r15c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 15 | 12 | 0 | `[Device Losses!r26c17]` |
| 15 | 13 | 0 | `[Device Losses!r26c18]` |
| 15 | 14 | 0 | `[Device Losses!r26c19]` |
| 15 | 15 | 0 |  |
| 15 | 16 | 0 |  |
| 15 | 25 | 0.09 |  |
| 15 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r15c27])` |
| 15 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r15c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r15c25],2))),[Power Meters!r15c25]),[Power Meters!r15c25])` |
| 15 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r15c27])` |
| 16 | 4 | 0 | `this.multiply(this.plus([Power Meters!r16c9],[Power Meters!r16c10]),[Power Meters!r1c1])` |
| 16 | 9 | 0 | `this.minus(this.plus(this.plus(this.plus(this.plus(this.plus(this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r13c9],[Power Meters!r13c10]),[Power Meters!r15c10]),[Power Meters!r18c10]),[Power Meters!r19c10]),[Power Meters!r20c10]),[Power Meters!r21c10]),[Power Meters!r22c10]),[Power Meters!r23c10]),[Power Meters!r24c10]),[Power Meters!r25c10]),this.If(this.equals([Device Losses!r9c19],"Yes"),this.plus([Power Meters!r18c18],[Power Meters!r21c18]),0))` |
| 16 | 10 | 0 | `this.plus(this.plus([Power Meters!r16c12],this.multiply([Power Meters!r16c13],[Power Meters!r16c9])),this.multiply(this.multiply([Power Meters!r16c14],[Power Meters!r16c9]),[Power Meters!r16c9]))` |
| 16 | 11 | 0 | `this.divide(this.multiply([Power Meters!r16c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 16 | 12 | 0 | `[Device Losses!r28c17]` |
| 16 | 13 | 0 | `[Device Losses!r28c18]` |
| 16 | 14 | 0 | `[Device Losses!r28c19]` |
| 16 | 15 | 0 |  |
| 16 | 16 | 0 |  |
| 16 | 25 | 0.1 |  |
| 16 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r16c27])` |
| 16 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r16c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r16c25],2))),[Power Meters!r16c25]),[Power Meters!r16c25])` |
| 16 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r16c27])` |
| 17 | 9 | 0 | `[Power Meters!r5c1]` |
| 17 | 10 | 0 | `this.plus(this.plus([Power Meters!r17c12],this.multiply([Power Meters!r17c13],[Power Meters!r17c9])),this.multiply(this.multiply([Power Meters!r17c14],[Power Meters!r17c9]),[Power Meters!r17c9]))` |
| 17 | 11 | 0 | `this.divide(this.multiply([Power Meters!r17c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 17 | 12 | 0 | `[Device Losses!r30c17]` |
| 17 | 13 | 0 | `[Device Losses!r30c18]` |
| 17 | 14 | 0 | `[Device Losses!r30c19]` |
| 17 | 15 | 0 |  |
| 17 | 16 | 0 |  |
| 17 | 25 | 0.11 |  |
| 17 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r17c27])` |
| 17 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r17c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r17c25],2))),[Power Meters!r17c25]),[Power Meters!r17c25])` |
| 17 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r17c27])` |
| 18 | 9 | 0 | `this.plus(this.plus(this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r5c1],[Power Meters!r13c10]),[Power Meters!r14c10]),[Power Meters!r17c10]),[Power Meters!r25c10]),[Power Meters!r24c10]),[Power Meters!r23c10]),this.divide([Power Meters!r27c4],[Power Meters!r1c1]))` |
| 18 | 10 | 0 | `this.plus(this.plus([Power Meters!r18c12],this.multiply([Power Meters!r18c13],[Power Meters!r18c9])),this.multiply(this.multiply([Power Meters!r18c14],[Power Meters!r18c9]),[Power Meters!r18c9]))` |
| 18 | 11 | 0 | `this.divide(this.multiply([Power Meters!r18c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 18 | 12 | 0 | `[Device Losses!r34c17]` |
| 18 | 13 | 0 | `[Device Losses!r34c18]` |
| 18 | 14 | 0 | `[Device Losses!r34c19]` |
| 18 | 15 | 0 | `this.multiply([Power Meters!r18c13],this.plus(this.plus(this.plus(this.plus([Power Meters!r13c12],[Power Meters!r14c12]),[Power Meters!r23c12]),[Power Meters!r24c12]),[Power Meters!r25c12]))` |
| 18 | 16 | 0 | `this.multiply([Power Meters!r18c13],this.plus(this.plus(this.plus(this.plus([Power Meters!r13c13],[Power Meters!r14c13]),[Power Meters!r24c13]),[Power Meters!r25c13]),[Power Meters!r23c13]))` |
| 18 | 17 | 0 | `this.plus(this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r5c1],this.plus([Power Meters!r13c12],[Power Meters!r14c12])),this.multiply(this.plus([Power Meters!r13c13],[Power Meters!r14c13]),[Power Meters!r5c1])),[Power Meters!r25c10]),[Power Meters!r24c10]),[Power Meters!r23c10]),this.divide([Power Meters!r27c4],[Power Meters!r1c1]))` |
| 18 | 18 | 0 | `this.plus(this.plus([Power Meters!r18c12],this.multiply([Power Meters!r18c13],[Power Meters!r18c17])),this.multiply(this.multiply([Power Meters!r18c14],[Power Meters!r18c17]),[Power Meters!r18c17]))` |
| 18 | 25 | 0.12 |  |
| 18 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r18c27])` |
| 18 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r18c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r18c25],2))),[Power Meters!r18c25]),[Power Meters!r18c25])` |
| 18 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r18c27])` |
| 19 | 9 | 0 | `this.plus(this.plus([Power Meters!r22c9],[Power Meters!r20c10]),[Power Meters!r22c10])` |
| 19 | 10 | 0 | `this.plus(this.plus([Power Meters!r19c12],this.multiply([Power Meters!r19c13],[Power Meters!r19c9])),this.multiply(this.multiply([Power Meters!r19c14],[Power Meters!r19c9]),[Power Meters!r19c9]))` |
| 19 | 11 | 0 | `this.divide(this.multiply([Power Meters!r19c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 19 | 12 | 0 | `[Device Losses!r42c17]` |
| 19 | 13 | 0 | `[Device Losses!r42c18]` |
| 19 | 14 | 0 | `[Device Losses!r42c19]` |
| 19 | 15 | 0 | `this.multiply([Power Meters!r19c13],this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r22c12],[Power Meters!r21c12]),[Power Meters!r20c12]),[Power Meters!r18c12]),[Power Meters!r14c12]),[Power Meters!r13c12]))` |
| 19 | 16 | 0 | `this.multiply([Power Meters!r19c13],this.plus(this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r22c13],[Power Meters!r23c13]),[Power Meters!r24c13]),[Power Meters!r25c13]),[Power Meters!r18c13]),[Power Meters!r13c13]),[Power Meters!r14c13]))` |
| 19 | 25 | 0.13 |  |
| 19 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r19c27])` |
| 19 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r19c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r19c25],2))),[Power Meters!r19c25]),[Power Meters!r19c25])` |
| 19 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r19c27])` |
| 20 | 9 | 0 | `this.plus([Power Meters!r22c9],[Power Meters!r22c10])` |
| 20 | 10 | 0 | `this.plus(this.plus([Power Meters!r20c12],this.multiply([Power Meters!r20c13],[Power Meters!r20c9])),this.multiply(this.multiply([Power Meters!r20c14],[Power Meters!r20c9]),[Power Meters!r20c9]))` |
| 20 | 11 | 0 | `this.divide(this.multiply([Power Meters!r20c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 20 | 12 | 0 | `[Device Losses!r49c17]` |
| 20 | 13 | 0 | `[Device Losses!r49c18]` |
| 20 | 14 | 0 | `[Device Losses!r49c19]` |
| 20 | 15 | 0 | `this.multiply([Power Meters!r20c13],this.plus(this.plus(this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r18c12],[Power Meters!r17c12]),[Power Meters!r14c12]),[Power Meters!r13c12]),[Power Meters!r21c12]),[Power Meters!r22c12]),[Power Meters!r24c12]),[Power Meters!r25c12]))` |
| 20 | 16 | 0 | `this.multiply([Power Meters!r20c13],this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r13c13],[Power Meters!r14c13]),[Power Meters!r18c13]),[Power Meters!r23c13]),[Power Meters!r24c13]),[Power Meters!r25c13]))` |
| 20 | 25 | 0.14 |  |
| 20 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r20c27])` |
| 20 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r20c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r20c25],2))),[Power Meters!r20c25]),[Power Meters!r20c25])` |
| 20 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r20c27])` |
| 21 | 9 | 0 | `this.plus([Power Meters!r18c9],[Power Meters!r18c10])` |
| 21 | 10 | 0 | `this.plus(this.plus([Power Meters!r21c12],this.multiply([Power Meters!r21c13],[Power Meters!r21c9])),this.multiply(this.multiply([Power Meters!r21c14],[Power Meters!r21c9]),[Power Meters!r21c9]))` |
| 21 | 11 | 0 | `this.divide(this.multiply([Power Meters!r21c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 21 | 12 | 0 | `[Device Losses!r46c17]` |
| 21 | 13 | 0 | `[Device Losses!r46c18]` |
| 21 | 14 | 0 | `[Device Losses!r46c19]` |
| 21 | 15 | 0 | `this.multiply([Power Meters!r21c13],this.plus(this.plus(this.plus([Power Meters!r18c12],[Power Meters!r17c12]),[Power Meters!r14c12]),[Power Meters!r13c12]))` |
| 21 | 16 | 0 | `this.multiply([Power Meters!r21c13],this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r13c13],[Power Meters!r14c13]),[Power Meters!r18c13]),[Power Meters!r23c13]),[Power Meters!r24c13]),[Power Meters!r25c13]))` |
| 21 | 17 | 0 | `[Power Meters!r18c17]` |
| 21 | 18 | 0 | `this.plus(this.plus([Power Meters!r21c12],this.multiply([Power Meters!r21c13],[Power Meters!r21c17])),this.multiply(this.multiply([Power Meters!r21c14],[Power Meters!r21c17]),[Power Meters!r21c17]))` |
| 21 | 25 | 0.15 |  |
| 21 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r21c27])` |
| 21 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r21c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r21c25],2))),[Power Meters!r21c25]),[Power Meters!r21c25])` |
| 21 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r21c27])` |
| 22 | 9 | 0 | `this.plus(this.plus([Power Meters!r18c9],[Power Meters!r18c10]),[Power Meters!r21c10])` |
| 22 | 10 | 0 | `this.plus(this.plus([Power Meters!r22c12],this.multiply([Power Meters!r22c13],[Power Meters!r22c9])),this.multiply(this.multiply([Power Meters!r22c14],[Power Meters!r22c9]),[Power Meters!r22c9]))` |
| 22 | 11 | 0 | `this.divide(this.multiply([Power Meters!r22c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 22 | 12 | 0 | `this.multiply([Device Losses!r52c17],this.minus(1,[Crystal Interface!r25c1]))` |
| 22 | 13 | 0 | `this.multiply([Device Losses!r52c18],this.minus(1,[Crystal Interface!r25c1]))` |
| 22 | 14 | 0 | `this.multiply([Device Losses!r52c19],this.minus(1,[Crystal Interface!r25c1]))` |
| 22 | 15 | 0 | `this.multiply([Power Meters!r22c13],this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r13c12],[Power Meters!r14c12]),[Power Meters!r18c12]),[Power Meters!r23c12]),[Power Meters!r24c12]),[Power Meters!r25c12]))` |
| 22 | 16 | 0 | `this.multiply([Power Meters!r22c13],this.plus(this.plus(this.plus(this.plus(this.plus(this.plus([Power Meters!r13c13],[Power Meters!r14c13]),[Power Meters!r18c13]),[Power Meters!r20c13]),[Power Meters!r23c13]),[Power Meters!r24c13]),[Power Meters!r25c13]))` |
| 22 | 25 | 0.16 |  |
| 22 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r22c27])` |
| 22 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r22c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r22c25],2))),[Power Meters!r22c25]),[Power Meters!r22c25])` |
| 22 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r22c27])` |
| 23 | 9 | 0 | `[Power Meters!r5c1]` |
| 23 | 10 | 0 | `this.plus(this.plus([Power Meters!r23c12],this.multiply([Power Meters!r23c13],[Power Meters!r23c9])),this.multiply(this.multiply([Power Meters!r23c14],[Power Meters!r23c9]),[Power Meters!r23c9]))` |
| 23 | 11 | 0 | `this.divide(this.multiply([Power Meters!r23c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 23 | 12 | 0 | `[Device Losses!r58c17]` |
| 23 | 13 | 0 | `[Device Losses!r58c18]` |
| 23 | 14 | 0 | `[Device Losses!r58c19]` |
| 23 | 15 | 0 |  |
| 23 | 16 | 0 |  |
| 23 | 25 | 0.17 |  |
| 23 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r23c27])` |
| 23 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r23c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r23c25],2))),[Power Meters!r23c25]),[Power Meters!r23c25])` |
| 23 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r23c27])` |
| 24 | 9 | 0 | `[Power Meters!r5c1]` |
| 24 | 10 | 0 | `this.plus(this.plus([Power Meters!r24c12],this.multiply([Power Meters!r24c13],[Power Meters!r24c9])),this.multiply(this.multiply([Power Meters!r24c14],[Power Meters!r24c9]),[Power Meters!r24c9]))` |
| 24 | 11 | 0 | `this.divide(this.multiply([Power Meters!r24c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 24 | 12 | 0 | `[Device Losses!r64c17]` |
| 24 | 13 | 0 |  |
| 24 | 14 | 0 |  |
| 24 | 15 | 0 |  |
| 24 | 16 | 0 |  |
| 24 | 25 | 0.18 |  |
| 24 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r24c27])` |
| 24 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r24c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r24c25],2))),[Power Meters!r24c25]),[Power Meters!r24c25])` |
| 24 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r24c27])` |
| 25 | 9 | 0 | `[Power Meters!r5c1]` |
| 25 | 10 | 0 | `this.plus(this.plus([Power Meters!r25c12],this.multiply([Power Meters!r25c13],[Power Meters!r25c9])),this.multiply(this.multiply([Power Meters!r25c14],[Power Meters!r25c9]),[Power Meters!r25c9]))` |
| 25 | 11 | 0 | `this.divide(this.multiply([Power Meters!r25c10],[Power Meters!r1c1]),[Power Meters!r11c1])` |
| 25 | 12 | 0 | `[Device Losses!r65c17]` |
| 25 | 13 | 0 |  |
| 25 | 14 | 0 |  |
| 25 | 15 | 0 |  |
| 25 | 16 | 0 |  |
| 25 | 25 | 0.19 |  |
| 25 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r25c27])` |
| 25 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r25c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r25c25],2))),[Power Meters!r25c25]),[Power Meters!r25c25])` |
| 25 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r25c27])` |
| 26 | 12 | 0 | `this.sum(this.gr(25,12,13,12,4))` |
| 26 | 13 | 0 | `this.sum(this.gr(25,13,13,13,4))` |
| 26 | 14 | 0 | `this.sum(this.gr(25,14,13,14,4))` |
| 26 | 15 | 0 | `this.sum(this.gr(25,15,13,15,4))` |
| 26 | 16 | 0 | `this.sum(this.gr(25,16,13,16,4))` |
| 26 | 25 | 0.2 |  |
| 26 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r26c27])` |
| 26 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r26c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r26c25],2))),[Power Meters!r26c25]),[Power Meters!r26c25])` |
| 26 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r26c27])` |
| 27 | 4 | 0 | `this.multiply(this.multiply([Power Meters!r1c1],[Device Losses!r61c2]),this.minus([Power Meters!r7c1],[Power Meters!r32c1]))` |
| 27 | 12 | 0 | `this.plus([Power Meters!r26c12],[Power Meters!r26c15])` |
| 27 | 13 | 0 | `this.plus([Power Meters!r26c13],[Power Meters!r26c16])` |
| 27 | 14 | 0 | `[Power Meters!r26c14]` |
| 27 | 25 | 0.21 |  |
| 27 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r27c27])` |
| 27 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r27c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r27c25],2))),[Power Meters!r27c25]),[Power Meters!r27c25])` |
| 27 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r27c27])` |
| 28 | 25 | 0.22 |  |
| 28 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r28c27])` |
| 28 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r28c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r28c25],2))),[Power Meters!r28c25]),[Power Meters!r28c25])` |
| 28 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r28c27])` |
| 29 | 25 | 0.23 |  |
| 29 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r29c27])` |
| 29 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r29c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r29c25],2))),[Power Meters!r29c25]),[Power Meters!r29c25])` |
| 29 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r29c27])` |
| 30 | 25 | 0.24 |  |
| 30 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r30c27])` |
| 30 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r30c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r30c25],2))),[Power Meters!r30c25]),[Power Meters!r30c25])` |
| 30 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r30c27])` |
| 31 | 25 | 0.25 |  |
| 31 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r31c27])` |
| 31 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r31c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r31c25],2))),[Power Meters!r31c25]),[Power Meters!r31c25])` |
| 31 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r31c27])` |
| 32 | 1 | 23 |  |
| 32 | 25 | 0.26 |  |
| 32 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r32c27])` |
| 32 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r32c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r32c25],2))),[Power Meters!r32c25]),[Power Meters!r32c25])` |
| 32 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r32c27])` |
| 33 | 25 | 0.27 |  |
| 33 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r33c27])` |
| 33 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r33c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r33c25],2))),[Power Meters!r33c25]),[Power Meters!r33c25])` |
| 33 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r33c27])` |
| 34 | 25 | 0.28 |  |
| 34 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r34c27])` |
| 34 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r34c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r34c25],2))),[Power Meters!r34c25]),[Power Meters!r34c25])` |
| 34 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r34c27])` |
| 35 | 25 | 0.29 |  |
| 35 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r35c27])` |
| 35 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r35c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r35c25],2))),[Power Meters!r35c25]),[Power Meters!r35c25])` |
| 35 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r35c27])` |
| 36 | 25 | 0.3 |  |
| 36 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r36c27])` |
| 36 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r36c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r36c25],2))),[Power Meters!r36c25]),[Power Meters!r36c25])` |
| 36 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r36c27])` |
| 37 | 25 | 0.31 |  |
| 37 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r37c27])` |
| 37 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r37c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r37c25],2))),[Power Meters!r37c25]),[Power Meters!r37c25])` |
| 37 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r37c27])` |
| 38 | 25 | 0.32 |  |
| 38 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r38c27])` |
| 38 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r38c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r38c25],2))),[Power Meters!r38c25]),[Power Meters!r38c25])` |
| 38 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r38c27])` |
| 39 | 25 | 0.33 |  |
| 39 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r39c27])` |
| 39 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r39c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r39c25],2))),[Power Meters!r39c25]),[Power Meters!r39c25])` |
| 39 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r39c27])` |
| 40 | 25 | 0.34 |  |
| 40 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r40c27])` |
| 40 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r40c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r40c25],2))),[Power Meters!r40c25]),[Power Meters!r40c25])` |
| 40 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r40c27])` |
| 41 | 25 | 0.35 |  |
| 41 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r41c27])` |
| 41 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r41c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r41c25],2))),[Power Meters!r41c25]),[Power Meters!r41c25])` |
| 41 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r41c27])` |
| 42 | 25 | 0.36 |  |
| 42 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r42c27])` |
| 42 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r42c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r42c25],2))),[Power Meters!r42c25]),[Power Meters!r42c25])` |
| 42 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r42c27])` |
| 43 | 25 | 0.37 |  |
| 43 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r43c27])` |
| 43 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r43c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r43c25],2))),[Power Meters!r43c25]),[Power Meters!r43c25])` |
| 43 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r43c27])` |
| 44 | 25 | 0.38 |  |
| 44 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r44c27])` |
| 44 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r44c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r44c25],2))),[Power Meters!r44c25]),[Power Meters!r44c25])` |
| 44 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r44c27])` |
| 45 | 25 | 0.39 |  |
| 45 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r45c27])` |
| 45 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r45c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r45c25],2))),[Power Meters!r45c25]),[Power Meters!r45c25])` |
| 45 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r45c27])` |
| 46 | 25 | 0.4 |  |
| 46 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r46c27])` |
| 46 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r46c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r46c25],2))),[Power Meters!r46c25]),[Power Meters!r46c25])` |
| 46 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r46c27])` |
| 47 | 25 | 0.41 |  |
| 47 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r47c27])` |
| 47 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r47c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r47c25],2))),[Power Meters!r47c25]),[Power Meters!r47c25])` |
| 47 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r47c27])` |
| 48 | 25 | 0.42 |  |
| 48 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r48c27])` |
| 48 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r48c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r48c25],2))),[Power Meters!r48c25]),[Power Meters!r48c25])` |
| 48 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r48c27])` |
| 49 | 25 | 0.43 |  |
| 49 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r49c27])` |
| 49 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r49c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r49c25],2))),[Power Meters!r49c25]),[Power Meters!r49c25])` |
| 49 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r49c27])` |
| 50 | 25 | 0.44 |  |
| 50 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r50c27])` |
| 50 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r50c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r50c25],2))),[Power Meters!r50c25]),[Power Meters!r50c25])` |
| 50 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r50c27])` |
| 51 | 25 | 0.45 |  |
| 51 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r51c27])` |
| 51 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r51c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r51c25],2))),[Power Meters!r51c25]),[Power Meters!r51c25])` |
| 51 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r51c27])` |
| 52 | 25 | 0.46 |  |
| 52 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r52c27])` |
| 52 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r52c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r52c25],2))),[Power Meters!r52c25]),[Power Meters!r52c25])` |
| 52 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r52c27])` |
| 53 | 25 | 0.47 |  |
| 53 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r53c27])` |
| 53 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r53c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r53c25],2))),[Power Meters!r53c25]),[Power Meters!r53c25])` |
| 53 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r53c27])` |
| 54 | 25 | 0.48 |  |
| 54 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r54c27])` |
| 54 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r54c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r54c25],2))),[Power Meters!r54c25]),[Power Meters!r54c25])` |
| 54 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r54c27])` |
| 55 | 25 | 0.49 |  |
| 55 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r55c27])` |
| 55 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r55c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r55c25],2))),[Power Meters!r55c25]),[Power Meters!r55c25])` |
| 55 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r55c27])` |
| 56 | 25 | 0.5 |  |
| 56 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r56c27])` |
| 56 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r56c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r56c25],2))),[Power Meters!r56c25]),[Power Meters!r56c25])` |
| 56 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r56c27])` |
| 57 | 25 | 0.51 |  |
| 57 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r57c27])` |
| 57 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r57c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r57c25],2))),[Power Meters!r57c25]),[Power Meters!r57c25])` |
| 57 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r57c27])` |
| 58 | 25 | 0.52 |  |
| 58 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r58c27])` |
| 58 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r58c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r58c25],2))),[Power Meters!r58c25]),[Power Meters!r58c25])` |
| 58 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r58c27])` |
| 59 | 25 | 0.53 |  |
| 59 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r59c27])` |
| 59 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r59c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r59c25],2))),[Power Meters!r59c25]),[Power Meters!r59c25])` |
| 59 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r59c27])` |
| 60 | 25 | 0.54 |  |
| 60 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r60c27])` |
| 60 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r60c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r60c25],2))),[Power Meters!r60c25]),[Power Meters!r60c25])` |
| 60 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r60c27])` |
| 61 | 25 | 0.55 |  |
| 61 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r61c27])` |
| 61 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r61c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r61c25],2))),[Power Meters!r61c25]),[Power Meters!r61c25])` |
| 61 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r61c27])` |
| 62 | 25 | 0.56 |  |
| 62 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r62c27])` |
| 62 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r62c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r62c25],2))),[Power Meters!r62c25]),[Power Meters!r62c25])` |
| 62 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r62c27])` |
| 63 | 25 | 0.57 |  |
| 63 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r63c27])` |
| 63 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r63c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r63c25],2))),[Power Meters!r63c25]),[Power Meters!r63c25])` |
| 63 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r63c27])` |
| 64 | 25 | 0.58 |  |
| 64 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r64c27])` |
| 64 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r64c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r64c25],2))),[Power Meters!r64c25]),[Power Meters!r64c25])` |
| 64 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r64c27])` |
| 65 | 25 | 0.59 |  |
| 65 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r65c27])` |
| 65 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r65c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r65c25],2))),[Power Meters!r65c25]),[Power Meters!r65c25])` |
| 65 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r65c27])` |
| 66 | 25 | 0.6 |  |
| 66 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r66c27])` |
| 66 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r66c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r66c25],2))),[Power Meters!r66c25]),[Power Meters!r66c25])` |
| 66 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r66c27])` |
| 67 | 25 | 0.61 |  |
| 67 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r67c27])` |
| 67 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r67c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r67c25],2))),[Power Meters!r67c25]),[Power Meters!r67c25])` |
| 67 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r67c27])` |
| 68 | 25 | 0.62 |  |
| 68 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r68c27])` |
| 68 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r68c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r68c25],2))),[Power Meters!r68c25]),[Power Meters!r68c25])` |
| 68 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r68c27])` |
| 69 | 25 | 0.63 |  |
| 69 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r69c27])` |
| 69 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r69c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r69c25],2))),[Power Meters!r69c25]),[Power Meters!r69c25])` |
| 69 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r69c27])` |
| 70 | 25 | 0.64 |  |
| 70 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r70c27])` |
| 70 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r70c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r70c25],2))),[Power Meters!r70c25]),[Power Meters!r70c25])` |
| 70 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r70c27])` |
| 71 | 25 | 0.65 |  |
| 71 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r71c27])` |
| 71 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r71c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r71c25],2))),[Power Meters!r71c25]),[Power Meters!r71c25])` |
| 71 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r71c27])` |
| 72 | 25 | 0.66 |  |
| 72 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r72c27])` |
| 72 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r72c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r72c25],2))),[Power Meters!r72c25]),[Power Meters!r72c25])` |
| 72 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r72c27])` |
| 73 | 25 | 0.67 |  |
| 73 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r73c27])` |
| 73 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r73c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r73c25],2))),[Power Meters!r73c25]),[Power Meters!r73c25])` |
| 73 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r73c27])` |
| 74 | 25 | 0.68 |  |
| 74 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r74c27])` |
| 74 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r74c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r74c25],2))),[Power Meters!r74c25]),[Power Meters!r74c25])` |
| 74 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r74c27])` |
| 75 | 25 | 0.69 |  |
| 75 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r75c27])` |
| 75 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r75c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r75c25],2))),[Power Meters!r75c25]),[Power Meters!r75c25])` |
| 75 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r75c27])` |
| 76 | 25 | 0.7 |  |
| 76 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r76c27])` |
| 76 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r76c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r76c25],2))),[Power Meters!r76c25]),[Power Meters!r76c25])` |
| 76 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r76c27])` |
| 77 | 25 | 0.71 |  |
| 77 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r77c27])` |
| 77 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r77c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r77c25],2))),[Power Meters!r77c25]),[Power Meters!r77c25])` |
| 77 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r77c27])` |
| 78 | 25 | 0.72 |  |
| 78 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r78c27])` |
| 78 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r78c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r78c25],2))),[Power Meters!r78c25]),[Power Meters!r78c25])` |
| 78 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r78c27])` |
| 79 | 25 | 0.73 |  |
| 79 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r79c27])` |
| 79 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r79c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r79c25],2))),[Power Meters!r79c25]),[Power Meters!r79c25])` |
| 79 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r79c27])` |
| 80 | 25 | 0.74 |  |
| 80 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r80c27])` |
| 80 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r80c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r80c25],2))),[Power Meters!r80c25]),[Power Meters!r80c25])` |
| 80 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r80c27])` |
| 81 | 25 | 0.75 |  |
| 81 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r81c27])` |
| 81 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r81c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r81c25],2))),[Power Meters!r81c25]),[Power Meters!r81c25])` |
| 81 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r81c27])` |
| 82 | 25 | 0.76 |  |
| 82 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r82c27])` |
| 82 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r82c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r82c25],2))),[Power Meters!r82c25]),[Power Meters!r82c25])` |
| 82 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r82c27])` |
| 83 | 25 | 0.77 |  |
| 83 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r83c27])` |
| 83 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r83c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r83c25],2))),[Power Meters!r83c25]),[Power Meters!r83c25])` |
| 83 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r83c27])` |
| 84 | 25 | 0.78 |  |
| 84 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r84c27])` |
| 84 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r84c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r84c25],2))),[Power Meters!r84c25]),[Power Meters!r84c25])` |
| 84 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r84c27])` |
| 85 | 25 | 0.79 |  |
| 85 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r85c27])` |
| 85 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r85c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r85c25],2))),[Power Meters!r85c25]),[Power Meters!r85c25])` |
| 85 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r85c27])` |
| 86 | 25 | 0.8 |  |
| 86 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r86c27])` |
| 86 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r86c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r86c25],2))),[Power Meters!r86c25]),[Power Meters!r86c25])` |
| 86 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r86c27])` |
| 87 | 25 | 0.81 |  |
| 87 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r87c27])` |
| 87 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r87c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r87c25],2))),[Power Meters!r87c25]),[Power Meters!r87c25])` |
| 87 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r87c27])` |
| 88 | 25 | 0.82 |  |
| 88 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r88c27])` |
| 88 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r88c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r88c25],2))),[Power Meters!r88c25]),[Power Meters!r88c25])` |
| 88 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r88c27])` |
| 89 | 25 | 0.83 |  |
| 89 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r89c27])` |
| 89 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r89c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r89c25],2))),[Power Meters!r89c25]),[Power Meters!r89c25])` |
| 89 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r89c27])` |
| 90 | 25 | 0.84 |  |
| 90 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r90c27])` |
| 90 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r90c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r90c25],2))),[Power Meters!r90c25]),[Power Meters!r90c25])` |
| 90 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r90c27])` |
| 91 | 25 | 0.85 |  |
| 91 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r91c27])` |
| 91 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r91c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r91c25],2))),[Power Meters!r91c25]),[Power Meters!r91c25])` |
| 91 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r91c27])` |
| 92 | 25 | 0.86 |  |
| 92 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r92c27])` |
| 92 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r92c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r92c25],2))),[Power Meters!r92c25]),[Power Meters!r92c25])` |
| 92 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r92c27])` |
| 93 | 25 | 0.87 |  |
| 93 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r93c27])` |
| 93 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r93c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r93c25],2))),[Power Meters!r93c25]),[Power Meters!r93c25])` |
| 93 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r93c27])` |
| 94 | 25 | 0.88 |  |
| 94 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r94c27])` |
| 94 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r94c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r94c25],2))),[Power Meters!r94c25]),[Power Meters!r94c25])` |
| 94 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r94c27])` |
| 95 | 25 | 0.89 |  |
| 95 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r95c27])` |
| 95 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r95c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r95c25],2))),[Power Meters!r95c25]),[Power Meters!r95c25])` |
| 95 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r95c27])` |
| 96 | 25 | 0.9 |  |
| 96 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r96c27])` |
| 96 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r96c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r96c25],2))),[Power Meters!r96c25]),[Power Meters!r96c25])` |
| 96 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r96c27])` |
| 97 | 25 | 0.91 |  |
| 97 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r97c27])` |
| 97 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r97c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r97c25],2))),[Power Meters!r97c25]),[Power Meters!r97c25])` |
| 97 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r97c27])` |
| 98 | 25 | 0.92 |  |
| 98 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r98c27])` |
| 98 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r98c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r98c25],2))),[Power Meters!r98c25]),[Power Meters!r98c25])` |
| 98 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r98c27])` |
| 99 | 25 | 0.93 |  |
| 99 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r99c27])` |
| 99 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r99c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r99c25],2))),[Power Meters!r99c25]),[Power Meters!r99c25])` |
| 99 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r99c27])` |
| 100 | 25 | 0.94 |  |
| 100 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r100c27])` |
| 100 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r100c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r100c25],2))),[Power Meters!r100c25]),[Power Meters!r100c25])` |
| 100 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r100c27])` |
| 101 | 25 | 0.95 |  |
| 101 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r101c27])` |
| 101 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r101c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r101c25],2))),[Power Meters!r101c25]),[Power Meters!r101c25])` |
| 101 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r101c27])` |
| 102 | 25 | 0.96 |  |
| 102 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r102c27])` |
| 102 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r102c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r102c25],2))),[Power Meters!r102c25]),[Power Meters!r102c25])` |
| 102 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r102c27])` |
| 103 | 25 | 0.97 |  |
| 103 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r103c27])` |
| 103 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r103c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r103c25],2))),[Power Meters!r103c25]),[Power Meters!r103c25])` |
| 103 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r103c27])` |
| 104 | 25 | 0.98 |  |
| 104 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r104c27])` |
| 104 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r104c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r104c25],2))),[Power Meters!r104c25]),[Power Meters!r104c25])` |
| 104 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r104c27])` |
| 105 | 25 | 0.99 |  |
| 105 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r105c27])` |
| 105 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r105c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r105c25],2))),[Power Meters!r105c25]),[Power Meters!r105c25])` |
| 105 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r105c27])` |
| 106 | 25 | 1 |  |
| 106 | 26 | 0 | `this.divide([Power Meters!r3c28],[Power Meters!r106c27])` |
| 106 | 27 | 0 | `this.divide(this.plus(this.plus(this.plus([Power Meters!r2c28],this.multiply([Power Meters!r2c29],[Power Meters!r106c25])),this.multiply([Power Meters!r2c30],this.power([Power Meters!r106c25],2))),[Power Meters!r106c25]),[Power Meters!r106c25])` |
| 106 | 28 | 0 | `this.multiply([Power Meters!r4c28],[Power Meters!r106c27])` |
