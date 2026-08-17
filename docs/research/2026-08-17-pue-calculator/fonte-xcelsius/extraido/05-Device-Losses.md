# Aba 5: Device Losses — 422 células

| r | c | valor (cache/default) | fórmula |
|---|---|---|---|
| 3 | 13 | "No" |  |
| 3 | 19 | 1 |  |
| 3 | 25 | "No" |  |
| 3 | 29 | 1 |  |
| 4 | 13 | "No" |  |
| 4 | 19 | "No" |  |
| 4 | 25 | "No" |  |
| 4 | 29 | 2 |  |
| 5 | 13 | 1 |  |
| 5 | 19 | 1 |  |
| 5 | 25 | "No" |  |
| 5 | 29 | 3 |  |
| 6 | 13 | 1 |  |
| 6 | 25 | "No" |  |
| 7 | 13 | "No" |  |
| 7 | 19 | "No" |  |
| 7 | 25 | "No" |  |
| 8 | 13 | "No" |  |
| 8 | 19 | "No" |  |
| 8 | 25 | "No" |  |
| 8 | 29 | 1 |  |
| 9 | 13 | "No" |  |
| 9 | 19 | "No" |  |
| 9 | 29 | 2 |  |
| 10 | 13 | "No" |  |
| 10 | 29 | 3 |  |
| 11 | 19 | 0 |  |
| 11 | 29 | 4 |  |
| 12 | 13 | 1 |  |
| 19 | 2 | 0.04 |  |
| 19 | 3 | 0 | `this.If(this.equals([Device Losses!r7c19],"No"),0.045,0.005)` |
| 19 | 4 | 0 | `this.If(this.equals([Device Losses!r7c19],"No"),0.04,0.005)` |
| 19 | 5 | 1.4 |  |
| 19 | 11 | 0 | `this.If(this.equals([Device Losses!r3c19],1),this.If(this.equals([Device Losses!r3c13],"Yes"),2,1),0)` |
| 19 | 12 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c19],"Yes"),1.2,1),[Device Losses!r19c11]),[Device Losses!r19c5])` |
| 19 | 17 | 0 | `this.plus(this.plus(this.multiply([Device Losses!r19c12],[Device Losses!r19c2]),this.multiply([Device Losses!r20c12],[Device Losses!r20c2])),this.multiply([Device Losses!r21c12],[Device Losses!r21c2]))` |
| 19 | 18 | 0 | `this.plus(this.plus(this.If(this.equals([Device Losses!r19c11],0),0,[Device Losses!r19c3]),this.If(this.equals([Device Losses!r20c11],0),0,[Device Losses!r20c3])),this.If(this.equals([Device Losses!r21c11],0),0,[Device Losses!r21c3]))` |
| 19 | 19 | 0 | `this.plus(this.plus(this.If(this.equals([Device Losses!r19c11],0),0,this.divide([Device Losses!r19c4],[Device Losses!r19c12])),this.If(this.equals([Device Losses!r20c11],0),0,this.divide([Device Losses!r20c4],[Device Losses!r20c12]))),this.If(this.equals([Device Losses!r21c11],0),0,this.divide([Device Losses!r21c4],[Device Losses!r21c12])))` |
| 20 | 2 | 0.028 |  |
| 20 | 3 | 0 | `this.If(this.equals([Device Losses!r7c19],"No"),0.035,0.005)` |
| 20 | 4 | 0 | `this.If(this.equals([Device Losses!r7c19],"No"),0.02,0.005)` |
| 20 | 5 | 1.3 |  |
| 20 | 11 | 0 | `this.If(this.equals([Device Losses!r3c19],2),this.If(this.equals([Device Losses!r3c13],"Yes"),2,1),0)` |
| 20 | 12 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c19],"Yes"),1.2,1),[Device Losses!r20c11]),[Device Losses!r20c5])` |
| 21 | 2 | 0.0072 |  |
| 21 | 3 | 0 | `this.If(this.equals([Device Losses!r7c19],"No"),0.013,0.005)` |
| 21 | 4 | 0 | `this.If(this.equals([Device Losses!r7c19],"No"),0.0238,0.005)` |
| 21 | 5 | 1.3 |  |
| 21 | 11 | 0 | `this.If(this.equals([Device Losses!r3c19],3),this.If(this.equals([Device Losses!r3c13],"Yes"),2,1),0)` |
| 21 | 12 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c19],"Yes"),1.2,1),[Device Losses!r21c11]),[Device Losses!r21c5])` |
| 23 | 2 | 0.011 |  |
| 23 | 3 | 0.009 |  |
| 23 | 4 | 0.005 |  |
| 23 | 5 | 2.5 |  |
| 23 | 11 | 0 | `this.If(this.equals([Device Losses!r4c19],"Yes"),0,this.If(this.equals([Device Losses!r8c19],"Yes"),this.If(this.equals([Device Losses!r3c13],"Yes"),2,1),0))` |
| 23 | 12 | 0 | `this.multiply([Device Losses!r23c11],[Device Losses!r23c5])` |
| 23 | 17 | 0 | `this.plus(this.multiply([Device Losses!r23c12],[Device Losses!r23c2]),this.multiply([Device Losses!r24c12],[Device Losses!r24c2]))` |
| 23 | 18 | 0 | `this.plus(this.If(this.equals([Device Losses!r23c11],0),0,[Device Losses!r23c3]),this.If(this.equals([Device Losses!r24c11],0),0,[Device Losses!r24c3]))` |
| 23 | 19 | 0 | `this.plus(this.If(this.equals([Device Losses!r23c11],0),0,this.divide([Device Losses!r23c4],[Device Losses!r23c12])),this.If(this.equals([Device Losses!r24c11],0),0,this.divide([Device Losses!r24c4],[Device Losses!r24c12])))` |
| 24 | 2 | 0.011 |  |
| 24 | 3 | 0 |  |
| 24 | 4 | 0.005 |  |
| 24 | 5 | 2.5 |  |
| 24 | 11 | 0 | `this.If(this.equals([Device Losses!r4c19],"Yes"),0,this.If(this.equals([Device Losses!r8c19],"No"),this.If(this.equals([Device Losses!r3c13],"Yes"),2,1),0))` |
| 24 | 12 | 0 | `this.multiply([Device Losses!r24c11],[Device Losses!r24c5])` |
| 26 | 2 | 0.003 |  |
| 26 | 3 | 0 |  |
| 26 | 4 | 0 |  |
| 26 | 5 | 2.5 |  |
| 26 | 11 | 0 | `this.If(this.equals([Device Losses!r4c13],"Yes"),1,0)` |
| 26 | 12 | 0 | `this.multiply([Device Losses!r26c11],[Device Losses!r26c5])` |
| 26 | 17 | 0 | `this.multiply([Device Losses!r26c12],[Device Losses!r26c2])` |
| 26 | 18 | 0 | `this.If(this.equals([Device Losses!r26c11],0),0,[Device Losses!r26c3])` |
| 26 | 19 | 0 | `this.If(this.equals([Device Losses!r26c11],0),0,this.divide([Device Losses!r26c4],[Device Losses!r26c12]))` |
| 28 | 2 | 0 |  |
| 28 | 3 | 0 |  |
| 28 | 4 | 0.01 |  |
| 28 | 5 | 2 |  |
| 28 | 11 | 1 |  |
| 28 | 12 | 0 | `this.multiply([Device Losses!r28c11],[Device Losses!r28c5])` |
| 28 | 17 | 0 | `this.multiply([Device Losses!r28c12],[Device Losses!r28c2])` |
| 28 | 18 | 0 | `this.If(this.equals([Device Losses!r28c11],0),0,[Device Losses!r28c3])` |
| 28 | 19 | 0 | `this.If(this.equals([Device Losses!r28c11],0),0,this.divide([Device Losses!r28c4],[Device Losses!r28c12]))` |
| 30 | 2 | 0 |  |
| 30 | 3 | 0 |  |
| 30 | 4 | 0.01 |  |
| 30 | 5 | 3 |  |
| 30 | 11 | 0 | `this.If(this.equals([Device Losses!r3c13],"Yes"),2,1)` |
| 30 | 12 | 0 | `this.multiply([Device Losses!r30c11],[Device Losses!r30c5])` |
| 30 | 17 | 0 | `this.multiply([Device Losses!r30c12],[Device Losses!r30c2])` |
| 30 | 18 | 0 | `this.If(this.equals([Device Losses!r30c11],0),0,[Device Losses!r30c3])` |
| 30 | 19 | 0 | `this.If(this.equals([Device Losses!r30c11],0),0,this.divide([Device Losses!r30c4],[Device Losses!r30c12]))` |
| 34 | 2 | 0.08 |  |
| 34 | 3 | 0 |  |
| 34 | 4 | 0 |  |
| 34 | 5 | 1.2 |  |
| 34 | 8 | 0 | `this.If(this.equals([Device Losses!r5c25],"Yes"),0,0.2)` |
| 34 | 10 | 0 | `this.plus(this.plus(this.plus(this.plus(this.If(this.equals([Device Losses!r4c25],"Yes"),0,0.03),this.If(this.equals([Device Losses!r3c25],"Yes"),0,0.08)),this.If(this.equals([Device Losses!r6c25],"Yes"),0,0.1)),this.If(this.equals([Device Losses!r7c25],"Yes"),0,0.1)),this.If(this.equals([Device Losses!r8c25],"Yes"),0,0.1))` |
| 34 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r6c13],2),1.4,this.If(this.equals([Device Losses!r6c13],3),2,this.If(this.equals([Device Losses!r6c13],4),2.8,1))),this.If(this.equals([Device Losses!r5c13],1),1,0)),this.If(this.equals([Device Losses!r7c13],"No"),1,0))` |
| 34 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r34c11],[Device Losses!r34c5]),this.plus(1,[Device Losses!r34c10]))` |
| 34 | 17 | 0 | `this.plus(this.plus(this.plus(this.plus(this.plus(this.plus(this.multiply(this.multiply([Device Losses!r34c12],[Device Losses!r34c2]),this.plus(1,[Device Losses!r34c8])),this.multiply(this.multiply([Device Losses!r35c12],[Device Losses!r35c2]),this.plus(1,[Device Losses!r35c8]))),this.multiply(this.multiply([Device Losses!r36c12],[Device Losses!r36c2]),this.plus(1,[Device Losses!r36c8]))),this.multiply(this.multiply([Device Losses!r37c12],[Device Losses!r37c2]),this.plus(1,[Device Losses!r37c8]))),this.multiply(this.multiply([Device Losses!r38c12],[Device Losses!r38c2]),this.plus(1,[Device Losses!r38c8]))),this.multiply(this.multiply([Device Losses!r39c12],[Device Losses!r39c2]),this.plus(1,[Device Losses!r39c8]))),this.multiply(this.multiply([Device Losses!r40c12],[Device Losses!r40c2]),this.plus(1,[Device Losses!r40c8])))` |
| 34 | 18 | 0 | `this.plus(this.plus(this.plus(this.plus(this.plus(this.If(this.equals([Device Losses!r34c11],0),0,this.multiply([Device Losses!r34c3],this.plus(1,[Device Losses!r34c9]))),this.If(this.equals([Device Losses!r35c11],0),0,this.multiply([Device Losses!r35c3],this.plus(1,[Device Losses!r35c9])))),this.If(this.equals([Device Losses!r36c11],0),0,this.multiply([Device Losses!r36c3],this.plus(1,[Device Losses!r36c9])))),this.If(this.equals([Device Losses!r37c11],0),0,this.multiply([Device Losses!r37c3],this.plus(1,[Device Losses!r37c9])))),this.If(this.equals([Device Losses!r38c11],0),0,this.multiply([Device Losses!r38c3],this.plus(1,[Device Losses!r38c9])))),this.If(this.equals([Device Losses!r39c11],0),0,this.multiply([Device Losses!r39c3],this.plus(1,[Device Losses!r39c9]))))` |
| 34 | 19 | 0 | `this.plus(this.plus(this.plus(this.plus(this.plus(this.If(this.equals([Device Losses!r34c11],0),0,this.divide([Device Losses!r34c4],[Device Losses!r34c12])),this.If(this.equals([Device Losses!r35c11],0),0,this.divide([Device Losses!r35c4],[Device Losses!r35c12]))),this.If(this.equals([Device Losses!r36c11],0),0,this.divide([Device Losses!r36c4],[Device Losses!r36c12]))),this.If(this.equals([Device Losses!r37c11],0),0,this.divide([Device Losses!r37c4],[Device Losses!r37c12]))),this.If(this.equals([Device Losses!r38c11],0),0,this.divide([Device Losses!r38c4],[Device Losses!r38c12]))),this.If(this.equals([Device Losses!r39c11],0),0,this.divide([Device Losses!r39c4],[Device Losses!r39c12])))` |
| 35 | 2 | 0.0195 |  |
| 35 | 3 | -0.045 |  |
| 35 | 4 | 0.0907 |  |
| 35 | 5 | 1.4 |  |
| 35 | 10 | 0 | `this.If(this.and(this.gt([Power Meters!r5c1],0.651),this.equals([Device Losses!r6c13],1)),this.If(this.equals([Device Losses!r4c25],"Yes"),0,this.minus(0.1)),this.If(this.equals([Device Losses!r4c25],"Yes"),0,0.1))` |
| 35 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r6c13],2),1.5,this.If(this.equals([Device Losses!r6c13],3),2,this.If(this.equals([Device Losses!r6c13],4),3,1))),this.If(this.equals([Device Losses!r5c13],1),1,0)),this.If(this.equals([Device Losses!r7c13],"Yes"),1,0))` |
| 35 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r35c11],[Device Losses!r35c5]),this.plus(1,[Device Losses!r35c10]))` |
| 36 | 2 | 0.28 |  |
| 36 | 3 | 0.15 |  |
| 36 | 4 | 0 |  |
| 36 | 5 | 1.2 |  |
| 36 | 8 | 0 | `this.If(this.equals([Device Losses!r5c25],"Yes"),0,0.2)` |
| 36 | 10 | 0 | `this.plus(this.plus(this.plus(this.plus(this.If(this.equals([Device Losses!r4c25],"Yes"),0,0.03),this.If(this.equals([Device Losses!r3c25],"Yes"),0,0.08)),this.If(this.equals([Device Losses!r6c25],"Yes"),0,0.1)),this.If(this.equals([Device Losses!r7c25],"Yes"),0,0.1)),this.If(this.equals([Device Losses!r8c25],"Yes"),0,0.1))` |
| 36 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r6c13],2),1.5,this.If(this.equals([Device Losses!r6c13],3),2,this.If(this.equals([Device Losses!r6c13],4),3,1))),this.If(this.equals([Device Losses!r5c13],2),1,0)),this.If(this.equals([Device Losses!r7c13],"No"),1,0))` |
| 36 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r36c11],[Device Losses!r36c5]),this.plus(1,[Device Losses!r36c10]))` |
| 37 | 2 | 0.15 |  |
| 37 | 3 | 0.1 |  |
| 37 | 4 | 0.04 |  |
| 37 | 5 | 1.4 |  |
| 37 | 10 | 0 | `this.If(this.equals([Device Losses!r4c25],"Yes"),0,0.1)` |
| 37 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r6c13],2),1.5,this.If(this.equals([Device Losses!r6c13],3),2,this.If(this.equals([Device Losses!r6c13],4),3,1))),this.If(this.equals([Device Losses!r5c13],2),1,0)),this.If(this.equals([Device Losses!r7c13],"Yes"),1,0))` |
| 37 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r37c11],[Device Losses!r37c5]),this.plus(1,[Device Losses!r37c10]))` |
| 38 | 2 | 0.2 |  |
| 38 | 3 | 0.15 |  |
| 38 | 4 | 0.02 |  |
| 38 | 5 | 1.2 |  |
| 38 | 8 | 0 | `this.If(this.equals([Device Losses!r5c25],"Yes"),0,0.2)` |
| 38 | 10 | 0 | `this.plus(this.plus(this.plus(this.plus(this.If(this.equals([Device Losses!r4c25],"Yes"),0,0.03),this.If(this.equals([Device Losses!r3c25],"Yes"),0,0.08)),this.If(this.equals([Device Losses!r6c25],"Yes"),0,0.1)),this.If(this.equals([Device Losses!r7c25],"Yes"),0,0.1)),this.If(this.equals([Device Losses!r8c25],"Yes"),0,0.1))` |
| 38 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r6c13],2),1.5,this.If(this.equals([Device Losses!r6c13],3),2,this.If(this.equals([Device Losses!r6c13],4),3,1))),this.If(this.equals([Device Losses!r5c13],3),1,0)),this.If(this.equals([Device Losses!r7c13],"No"),1,0))` |
| 38 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r38c11],[Device Losses!r38c5]),this.plus(1,[Device Losses!r38c10]))` |
| 39 | 2 | 0.15 |  |
| 39 | 3 | 0.15 |  |
| 39 | 4 | 0.02 |  |
| 39 | 5 | 1.4 |  |
| 39 | 10 | 0 | `this.If(this.equals([Device Losses!r4c25],"Yes"),0,0.1)` |
| 39 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r6c13],2),1.5,this.If(this.equals([Device Losses!r6c13],3),2,this.If(this.equals([Device Losses!r6c13],4),3,1))),this.If(this.equals([Device Losses!r5c13],3),1,0)),this.If(this.equals([Device Losses!r7c13],"Yes"),1,0))` |
| 39 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r39c11],[Device Losses!r39c5]),this.plus(1,[Device Losses!r39c10]))` |
| 40 | 2 | 0.05 |  |
| 40 | 5 | 1.2 |  |
| 40 | 11 | 0 | `this.divide(this.multiply([Device Losses!r11c19],10),[Power Meters!r1c1])` |
| 40 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r40c11],[Device Losses!r40c5]),this.plus(1,[Device Losses!r40c10]))` |
| 42 | 2 | 0.003 |  |
| 42 | 3 | 0.007 |  |
| 42 | 4 | 0 |  |
| 42 | 5 | 2.5 |  |
| 42 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c13],"Yes"),2,1),this.If(this.or(this.equals([Device Losses!r6c13],2),this.equals([Device Losses!r6c13],4)),1.5,1)),this.If(this.equals(this.plus([Device Losses!r52c11],[Device Losses!r53c11]),0),0,1))` |
| 42 | 12 | 0 | `this.If(this.equals([Device Losses!r7c13],"No"),this.multiply(this.multiply([Device Losses!r42c11],[Device Losses!r42c5]),this.plus(1,[Device Losses!r34c10])),this.multiply(this.multiply([Device Losses!r42c11],[Device Losses!r42c5]),this.plus(1,[Device Losses!r35c10])))` |
| 42 | 17 | 0 | `this.plus(this.plus(this.multiply([Device Losses!r42c12],[Device Losses!r42c2]),this.multiply([Device Losses!r43c12],[Device Losses!r43c2])),this.multiply([Device Losses!r44c12],[Device Losses!r44c2]))` |
| 42 | 18 | 0 | `this.plus(this.plus(this.If(this.equals([Device Losses!r42c11],0),0,[Device Losses!r42c3]),this.If(this.equals([Device Losses!r43c11],0),0,[Device Losses!r43c3])),this.If(this.equals([Device Losses!r44c11],0),0,[Device Losses!r44c3]))` |
| 42 | 19 | 0 | `this.plus(this.plus(this.If(this.equals([Device Losses!r42c11],0),0,this.divide([Device Losses!r42c4],[Device Losses!r42c12])),this.If(this.equals([Device Losses!r43c11],0),0,this.divide([Device Losses!r43c4],[Device Losses!r43c12]))),this.If(this.equals([Device Losses!r44c11],0),0,this.divide([Device Losses!r44c4],[Device Losses!r44c12])))` |
| 43 | 2 | 0.003 |  |
| 43 | 3 | 0.007 |  |
| 43 | 4 | 0 |  |
| 43 | 5 | 2.5 |  |
| 43 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c13],"Yes"),2,1),this.If(this.or(this.equals([Device Losses!r6c13],2),this.equals([Device Losses!r6c13],4)),1.5,1)),this.If(this.equals(this.plus(this.plus(this.plus([Device Losses!r36c11],[Device Losses!r37c11]),[Device Losses!r54c11]),[Device Losses!r55c11]),0),0,1))` |
| 43 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r43c11],[Device Losses!r43c5]),this.plus(1,[Device Losses!r43c10]))` |
| 44 | 2 | 0.005 |  |
| 44 | 3 | 0.005 |  |
| 44 | 4 | 0 |  |
| 44 | 5 | 2 |  |
| 44 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c13],"Yes"),2,1),this.If(this.or(this.equals([Device Losses!r6c13],2),this.equals([Device Losses!r6c13],4)),1.5,1)),this.If(this.equals([Device Losses!r5c13],3),1,0))` |
| 44 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r44c11],[Device Losses!r44c5]),this.plus(1,[Device Losses!r44c10]))` |
| 46 | 2 | 0 | `this.divide(0.02,2)` |
| 46 | 3 | 0 |  |
| 46 | 4 | 0 |  |
| 46 | 5 | 1.7 |  |
| 46 | 10 | 0 | `this.If(this.equals([Device Losses!r7c13],"Yes"),0,this.If(this.equals([Device Losses!r7c25],"Yes"),0,0.1))` |
| 46 | 11 | 0 | `this.multiply(this.multiply(this.If(this.gt([Device Losses!r6c13],2),2,1),this.If(this.equals(this.plus([Device Losses!r34c11],[Device Losses!r35c11]),0),0,1)),this.If(this.equals([Device Losses!r8c13],"Yes"),0,1))` |
| 46 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r46c11],[Device Losses!r46c5]),this.plus(1,[Device Losses!r46c10]))` |
| 46 | 17 | 0 | `this.plus(this.multiply(this.multiply([Device Losses!r46c12],[Device Losses!r46c2]),this.plus(1,[Device Losses!r46c8])),this.multiply(this.multiply([Device Losses!r47c12],[Device Losses!r47c2]),this.plus(1,[Device Losses!r47c8])))` |
| 46 | 18 | 0 | `this.plus(this.If(this.equals([Device Losses!r46c11],0),0,this.multiply([Device Losses!r46c3],this.plus(1,[Device Losses!r46c9]))),this.If(this.equals([Device Losses!r47c11],0),0,this.multiply([Device Losses!r47c3],this.plus(1,[Device Losses!r47c9]))))` |
| 46 | 19 | 0 | `this.plus(this.If(this.equals([Device Losses!r46c11],0),0,this.divide([Device Losses!r46c4],[Device Losses!r46c12])),this.If(this.equals([Device Losses!r47c11],0),0,this.divide([Device Losses!r47c4],[Device Losses!r47c12])))` |
| 47 | 2 | 0 | `this.divide(0.005,2)` |
| 47 | 3 | 0 | `this.divide(0.015,2)` |
| 47 | 4 | 0 |  |
| 47 | 5 | 1.7 |  |
| 47 | 9 | 0 | `this.If(this.equals([Device Losses!r7c13],"Yes"),0,this.If(this.equals([Device Losses!r7c25],"Yes"),0,0.1))` |
| 47 | 11 | 0 | `this.multiply(this.multiply(this.If(this.gt([Device Losses!r6c13],2),2,1),this.If(this.equals(this.plus([Device Losses!r34c11],[Device Losses!r35c11]),0),0,1)),this.If(this.equals([Device Losses!r8c13],"Yes"),1,0))` |
| 47 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r47c11],[Device Losses!r47c5]),this.plus(1,[Device Losses!r47c10]))` |
| 49 | 2 | 0 | `this.divide(0.02,2)` |
| 49 | 3 | 0 |  |
| 49 | 4 | 0 |  |
| 49 | 5 | 1.8 |  |
| 49 | 11 | 0 | `this.multiply(this.multiply(this.If(this.gt([Device Losses!r6c13],2),2,1),this.If(this.equals(this.plus([Device Losses!r42c11],[Device Losses!r43c11]),0),0,1)),this.If(this.equals([Device Losses!r10c13],"Yes"),0,1))` |
| 49 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r49c11],[Device Losses!r49c5]),this.plus(1,[Device Losses!r49c10]))` |
| 49 | 17 | 0 | `this.plus(this.multiply(this.multiply([Device Losses!r49c12],[Device Losses!r49c2]),this.plus(1,[Device Losses!r49c8])),this.multiply(this.multiply([Device Losses!r50c12],[Device Losses!r50c2]),this.plus(1,[Device Losses!r50c8])))` |
| 49 | 18 | 0 | `this.plus(this.If(this.equals([Device Losses!r49c11],0),0,this.multiply([Device Losses!r49c3],this.plus(1,[Device Losses!r49c9]))),this.If(this.equals([Device Losses!r50c11],0),0,this.multiply([Device Losses!r50c3],this.plus(1,[Device Losses!r50c9]))))` |
| 49 | 19 | 0 | `this.plus(this.If(this.equals([Device Losses!r49c11],0),0,this.divide([Device Losses!r49c4],[Device Losses!r49c12])),this.If(this.equals([Device Losses!r50c11],0),0,this.divide([Device Losses!r50c4],[Device Losses!r50c12])))` |
| 50 | 2 | 0 | `this.divide(0.005,2)` |
| 50 | 3 | 0 | `this.divide(0.01,2)` |
| 50 | 4 | 0 |  |
| 50 | 5 | 1.8 |  |
| 50 | 6 | 0.02 |  |
| 50 | 9 | 0 | `this.multiply(this.minus([Power Meters!r7c1],[Power Meters!r32c1]),[Device Losses!r50c6])` |
| 50 | 11 | 0 | `this.multiply(this.multiply(this.If(this.gt([Device Losses!r6c13],2),2,1),this.If(this.equals(this.plus([Device Losses!r42c11],[Device Losses!r43c11]),0),0,1)),this.If(this.equals([Device Losses!r10c13],"Yes"),1,0))` |
| 50 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r50c11],[Device Losses!r50c5]),this.plus(1,[Device Losses!r50c10]))` |
| 52 | 2 | 0.05 |  |
| 52 | 3 | 0.12 |  |
| 52 | 4 | 0 |  |
| 52 | 5 | 1.8 |  |
| 52 | 6 | 0.02 |  |
| 52 | 8 | 0 |  |
| 52 | 9 | 0 | `this.multiply(this.minus([Power Meters!r7c1],[Power Meters!r32c1]),[Device Losses!r52c6])` |
| 52 | 10 | 0 | `this.If(this.equals([Device Losses!r7c13],"Yes"),this.minus(0.1),0)` |
| 52 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c13],"Yes"),2,1),this.If(this.equals(this.plus([Device Losses!r34c11],[Device Losses!r35c11]),0),0,1)),this.If(this.equals([Device Losses!r12c13],1),1,0))` |
| 52 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r52c11],[Device Losses!r52c5]),this.plus(1,[Device Losses!r52c10]))` |
| 52 | 17 | 0 | `this.plus(this.plus(this.plus(this.plus(this.multiply(this.multiply([Device Losses!r52c12],[Device Losses!r52c2]),this.plus(1,[Device Losses!r52c8])),this.multiply(this.multiply([Device Losses!r53c12],[Device Losses!r53c2]),this.plus(1,[Device Losses!r53c8]))),this.multiply(this.multiply([Device Losses!r54c12],[Device Losses!r54c2]),this.plus(1,[Device Losses!r54c8]))),this.multiply(this.multiply([Device Losses!r55c12],[Device Losses!r55c2]),this.plus(1,[Device Losses!r55c8]))),this.multiply(this.multiply([Device Losses!r56c12],[Device Losses!r56c2]),this.plus(1,[Device Losses!r56c8])))` |
| 52 | 18 | 0 | `this.plus(this.plus(this.plus(this.plus(this.If(this.equals([Device Losses!r52c11],0),0,this.multiply([Device Losses!r52c3],this.plus(1,[Device Losses!r52c9]))),this.If(this.equals([Device Losses!r53c11],0),0,this.multiply([Device Losses!r53c3],this.plus(1,[Device Losses!r53c9])))),this.If(this.equals([Device Losses!r54c11],0),0,this.multiply([Device Losses!r54c3],this.plus(1,[Device Losses!r54c9])))),this.If(this.equals([Device Losses!r55c11],0),0,this.multiply([Device Losses!r55c3],this.plus(1,[Device Losses!r55c9])))),this.If(this.equals([Device Losses!r56c11],0),0,this.multiply([Device Losses!r56c3],this.plus(1,[Device Losses!r56c9]))))` |
| 52 | 19 | 0 | `this.plus(this.plus(this.plus(this.plus(this.If(this.equals([Device Losses!r52c11],0),0,this.divide([Device Losses!r52c4],[Device Losses!r52c12])),this.If(this.equals([Device Losses!r53c11],0),0,this.divide([Device Losses!r53c4],[Device Losses!r53c12]))),this.If(this.equals([Device Losses!r54c11],0),0,this.divide([Device Losses!r54c4],[Device Losses!r54c12]))),this.If(this.equals([Device Losses!r55c11],0),0,this.divide([Device Losses!r55c4],[Device Losses!r55c12]))),this.If(this.equals([Device Losses!r56c11],0),0,this.divide([Device Losses!r56c4],[Device Losses!r56c12])))` |
| 53 | 2 | 0.005 |  |
| 53 | 3 | 0.12 |  |
| 53 | 4 | 0.02 |  |
| 53 | 5 | 1.5 |  |
| 53 | 6 | 0.02 |  |
| 53 | 8 | 0 |  |
| 53 | 9 | 0 | `this.multiply(this.minus([Power Meters!r7c1],[Power Meters!r32c1]),[Device Losses!r53c6])` |
| 53 | 10 | 0 | `this.If(this.equals([Device Losses!r7c13],"Yes"),this.minus(0.1),0)` |
| 53 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c13],"Yes"),2,1),this.If(this.equals(this.plus([Device Losses!r34c11],[Device Losses!r35c11]),0),0,1)),this.If(this.equals([Device Losses!r12c13],2),1,0))` |
| 53 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r53c11],[Device Losses!r53c5]),this.plus(1,[Device Losses!r53c10]))` |
| 54 | 2 | 0.055 |  |
| 54 | 3 | 0.15 |  |
| 54 | 4 | 0 |  |
| 54 | 5 | 1.8 |  |
| 54 | 6 | 0.02 |  |
| 54 | 8 | 0 |  |
| 54 | 9 | 0 | `this.multiply(this.minus([Power Meters!r7c1],[Power Meters!r32c1]),[Device Losses!r54c6])` |
| 54 | 10 | 0 | `this.If(this.equals([Device Losses!r7c13],"Yes"),this.minus(0.1),0)` |
| 54 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c13],"Yes"),2,1),this.If(this.equals(this.plus([Device Losses!r34c11],[Device Losses!r35c11]),0),0,1)),this.If(this.equals([Device Losses!r12c13],3),1,0))` |
| 54 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r54c11],[Device Losses!r54c5]),this.plus(1,[Device Losses!r54c10]))` |
| 55 | 2 | 0.01 |  |
| 55 | 3 | 0.14 |  |
| 55 | 4 | 0.02 |  |
| 55 | 5 | 1.8 |  |
| 55 | 6 | 0.02 |  |
| 55 | 8 | 0 |  |
| 55 | 9 | 0 | `this.multiply(this.minus([Power Meters!r7c1],[Power Meters!r32c1]),[Device Losses!r55c6])` |
| 55 | 10 | 0 | `this.If(this.equals([Device Losses!r7c13],"Yes"),this.minus(0.1),0)` |
| 55 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c13],"Yes"),2,1),this.If(this.equals(this.plus([Device Losses!r34c11],[Device Losses!r35c11]),0),0,1)),this.If(this.equals([Device Losses!r12c13],4),1,0))` |
| 55 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r55c11],[Device Losses!r55c5]),this.plus(1,[Device Losses!r55c10]))` |
| 56 | 2 | 0.06 |  |
| 56 | 3 | 0.16 |  |
| 56 | 4 | 0 |  |
| 56 | 5 | 1.8 |  |
| 56 | 6 | 0.02 |  |
| 56 | 8 | 0 |  |
| 56 | 9 | 0 | `this.multiply(this.minus([Power Meters!r7c1],[Power Meters!r32c1]),[Device Losses!r56c6])` |
| 56 | 10 | 0 | `this.If(this.equals([Device Losses!r7c13],"Yes"),this.minus(0.1),0)` |
| 56 | 11 | 0 | `this.multiply(this.multiply(this.If(this.equals([Device Losses!r9c13],"Yes"),2,1),this.If(this.equals(this.plus([Device Losses!r34c11],[Device Losses!r35c11]),0),0,1)),this.If(this.equals([Device Losses!r12c13],5),1,0))` |
| 56 | 12 | 0 | `this.multiply(this.multiply([Device Losses!r56c11],[Device Losses!r56c5]),this.plus(1,[Device Losses!r56c10]))` |
| 58 | 2 | 0.01 |  |
| 58 | 3 | 0.04 |  |
| 58 | 4 | 0 |  |
| 58 | 5 | 1 |  |
| 58 | 11 | 0 | `this.multiply(this.If(this.equals([Device Losses!r6c13],2),1.5,this.If(this.equals([Device Losses!r6c13],3),2,this.If(this.equals([Device Losses!r6c13],4),3,1))),this.If(this.equals([Device Losses!r7c13],"Yes"),0,1))` |
| 58 | 12 | 0 | `this.multiply([Device Losses!r58c11],[Device Losses!r58c5])` |
| 58 | 17 | 0 | `this.plus(this.multiply([Device Losses!r58c12],[Device Losses!r58c2]),this.multiply([Device Losses!r59c12],[Device Losses!r59c2]))` |
| 58 | 18 | 0 | `this.plus(this.If(this.equals([Device Losses!r58c11],0),0,[Device Losses!r58c3]),this.If(this.equals([Device Losses!r59c11],0),0,[Device Losses!r59c3]))` |
| 58 | 19 | 0 | `this.plus(this.If(this.equals([Device Losses!r58c11],0),0,this.divide([Device Losses!r58c4],[Device Losses!r58c12])),this.If(this.equals([Device Losses!r59c11],0),0,this.divide([Device Losses!r59c4],[Device Losses!r59c12])))` |
| 59 | 2 | 0.001 |  |
| 59 | 3 | 0.01 |  |
| 59 | 4 | 0 |  |
| 59 | 5 | 1 |  |
| 59 | 11 | 0 | `this.multiply(this.If(this.equals([Device Losses!r6c13],2),1.5,this.If(this.equals([Device Losses!r6c13],3),2,this.If(this.equals([Device Losses!r6c13],4),3,1))),this.If(this.equals([Device Losses!r7c13],"Yes"),1,0))` |
| 59 | 12 | 0 | `this.multiply([Device Losses!r59c11],[Device Losses!r59c5])` |
| 61 | 2 | 0.002 |  |
| 64 | 2 | 0.01 |  |
| 64 | 17 | 0 | `this.If(this.equals([Device Losses!r5c19],2),this.multiply(0.5,[Device Losses!r64c2]),[Device Losses!r64c2])` |
| 65 | 2 | 0.0159 |  |
| 65 | 17 | 0 | `[Device Losses!r65c2]` |
| 74 | 0 | 0 | `[Interface TXT!r269c2]` |
| 74 | 1 | 0 | `[Interface TXT!r270c2]` |
| 74 | 2 | 0 | `[Interface TXT!r271c2]` |
| 74 | 3 | 0 | `[Interface TXT!r272c2]` |
| 74 | 4 | 0 | `[Interface TXT!r273c2]` |
| 75 | 0 | 0 | `[Interface TXT!r275c2]` |
| 75 | 1 | 1.4 |  |
| 75 | 2 | 0 | `0.04` |
| 75 | 3 | 0 | `0.045` |
| 75 | 4 | 0.04 |  |
| 76 | 0 | 0 | `[Interface TXT!r276c2]` |
| 76 | 1 | 1.3 |  |
| 76 | 2 | 0 | `0.02` |
| 76 | 3 | 0 | `0.035` |
| 76 | 4 | 0.028 |  |
| 77 | 0 | 0 | `[Interface TXT!r277c2]` |
| 77 | 1 | 1.3 |  |
| 77 | 2 | 0 | `0.0238` |
| 77 | 3 | 0 | `0.013` |
| 77 | 4 | 0.0072 |  |
| 78 | 0 | 0 | `[Interface TXT!r278c2]` |
| 78 | 1 | 2.5 |  |
| 78 | 2 | 0.005 |  |
| 78 | 3 | 0.009 |  |
| 78 | 4 | 0.011 |  |
| 79 | 0 | 0 | `[Interface TXT!r279c2]` |
| 79 | 1 | 2.5 |  |
| 79 | 2 | 0.005 |  |
| 79 | 3 | 0 |  |
| 79 | 4 | 0.011 |  |
| 80 | 0 | 0 | `[Interface TXT!r280c2]` |
| 80 | 1 | 2.5 |  |
| 80 | 2 | 0 |  |
| 80 | 3 | 0 |  |
| 80 | 4 | 0.003 |  |
| 81 | 0 | 0 | `[Interface TXT!r281c2]` |
| 81 | 1 | 2 |  |
| 81 | 2 | 0.01 |  |
| 81 | 3 | 0 |  |
| 81 | 4 | 0 |  |
| 82 | 0 | 0 | `[Interface TXT!r282c2]` |
| 82 | 1 | 3 |  |
| 82 | 2 | 0.01 |  |
| 82 | 3 | 0 |  |
| 82 | 4 | 0 |  |
| 83 | 0 | 0 | `[Interface TXT!r283c2]` |
| 83 | 1 | 1.2 |  |
| 83 | 2 | 0 |  |
| 83 | 3 | 0 |  |
| 83 | 4 | 0.08 |  |
| 84 | 0 | 0 | `[Interface TXT!r284c2]` |
| 84 | 1 | 1.4 |  |
| 84 | 2 | 0.0907 |  |
| 84 | 3 | -0.045 |  |
| 84 | 4 | 0.0195 |  |
| 85 | 0 | 0 | `[Interface TXT!r285c2]` |
| 85 | 1 | 1.2 |  |
| 85 | 2 | 0 |  |
| 85 | 3 | 0.15 |  |
| 85 | 4 | 0.28 |  |
| 86 | 0 | 0 | `[Interface TXT!r286c2]` |
| 86 | 1 | 1.4 |  |
| 86 | 2 | 0.04 |  |
| 86 | 3 | 0.1 |  |
| 86 | 4 | 0.15 |  |
| 87 | 0 | 0 | `[Interface TXT!r287c2]` |
| 87 | 1 | 1.2 |  |
| 87 | 2 | 0.02 |  |
| 87 | 3 | 0.15 |  |
| 87 | 4 | 0.2 |  |
| 88 | 0 | 0 | `[Interface TXT!r288c2]` |
| 88 | 1 | 1.4 |  |
| 88 | 2 | 0.02 |  |
| 88 | 3 | 0.15 |  |
| 88 | 4 | 0.15 |  |
| 89 | 0 | 0 | `[Interface TXT!r289c2]` |
| 89 | 1 | 2.5 |  |
| 89 | 2 | 0 |  |
| 89 | 3 | 0.007 |  |
| 89 | 4 | 0.003 |  |
| 90 | 0 | 0 | `[Interface TXT!r290c2]` |
| 90 | 1 | 2.5 |  |
| 90 | 2 | 0 |  |
| 90 | 3 | 0.007 |  |
| 90 | 4 | 0.003 |  |
| 91 | 0 | 0 | `[Interface TXT!r291c2]` |
| 91 | 1 | 2 |  |
| 91 | 2 | 0 |  |
| 91 | 3 | 0.005 |  |
| 91 | 4 | 0.005 |  |
| 92 | 0 | 0 | `[Interface TXT!r292c2]` |
| 92 | 1 | 1.7 |  |
| 92 | 2 | 0 |  |
| 92 | 3 | 0 |  |
| 92 | 4 | 0 | `this.divide(0.02,2)` |
| 93 | 0 | 0 | `[Interface TXT!r293c2]` |
| 93 | 1 | 1.7 |  |
| 93 | 2 | 0 |  |
| 93 | 3 | 0 | `this.divide(0.015,2)` |
| 93 | 4 | 0 | `this.divide(0.005,2)` |
| 94 | 0 | 0 | `[Interface TXT!r294c2]` |
| 94 | 1 | 1.8 |  |
| 94 | 2 | 0 |  |
| 94 | 3 | 0 |  |
| 94 | 4 | 0 | `this.divide(0.02,2)` |
| 95 | 0 | 0 | `[Interface TXT!r295c2]` |
| 95 | 1 | 1.8 |  |
| 95 | 2 | 0 |  |
| 95 | 3 | 0 | `this.divide(0.01,2)` |
| 95 | 4 | 0 | `this.divide(0.005,2)` |
| 96 | 0 | 0 | `[Interface TXT!r296c2]` |
| 96 | 1 | 1.8 |  |
| 96 | 2 | 0 |  |
| 96 | 3 | 0.12 |  |
| 96 | 4 | 0.05 |  |
| 97 | 0 | 0 | `[Interface TXT!r297c2]` |
| 97 | 1 | 1.5 |  |
| 97 | 2 | 0.02 |  |
| 97 | 3 | 0.12 |  |
| 97 | 4 | 0.005 |  |
| 98 | 0 | 0 | `[Interface TXT!r298c2]` |
| 98 | 1 | 1.8 |  |
| 98 | 2 | 0 |  |
| 98 | 3 | 0.15 |  |
| 98 | 4 | 0.055 |  |
| 99 | 0 | 0 | `[Interface TXT!r299c2]` |
| 99 | 1 | 1.8 |  |
| 99 | 2 | 0.02 |  |
| 99 | 3 | 0.14 |  |
| 99 | 4 | 0.01 |  |
| 100 | 0 | 0 | `[Interface TXT!r300c2]` |
| 100 | 1 | 1.8 |  |
| 100 | 2 | 0 |  |
| 100 | 3 | 0.16 |  |
| 100 | 4 | 0.06 |  |
| 101 | 0 | 0 | `[Interface TXT!r301c2]` |
| 101 | 1 | 1 |  |
| 101 | 2 | 0 |  |
| 101 | 3 | 0.04 |  |
| 101 | 4 | 0.01 |  |
| 102 | 0 | 0 | `[Interface TXT!r302c2]` |
| 102 | 1 | 1 |  |
| 102 | 2 | 0 |  |
| 102 | 3 | 0 |  |
| 102 | 4 | 0.01 |  |
| 103 | 0 | 0 | `[Interface TXT!r303c2]` |
| 103 | 1 | 1 |  |
| 103 | 2 | 0 |  |
| 103 | 3 | 0 |  |
| 103 | 4 | 0.0159 |  |
