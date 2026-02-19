# FSRS (Free Spaced Repetition Scheduler)

O **FSRS (Free Spaced Repetition Scheduler)** é um algoritmo moderno de
repetição espaçada baseado em modelagem probabilística da memória.\
Ele busca maximizar retenção com o menor número possível de revisões.

Diferente do SM-2 (usado no Anki tradicional), o FSRS modela
explicitamente:

- **Dificuldade (D)**
- **Estabilidade (S)**
- **Retenção (R)**
- **Probabilidade de esquecimento**

---

# 1. Modelo Matemático da Memória

O FSRS assume que a memória segue um **decaimento exponencial**.

A probabilidade de lembrar um item após `t` dias é:

R(t) = e\^(-t/S)

Onde:

- `t` = tempo desde a última revisão\
- `S` = estabilidade da memória (em dias)\
- `R(t)` = probabilidade de lembrar

---

# 2. Cálculo do Próximo Intervalo

O sistema define uma **retenção desejada** (ex: 90%).

Queremos encontrar `t` tal que:

R_target = e\^(-t/S)

Aplicando logaritmo natural:

t = -S \* ln(R_target)

Essa é a fórmula usada para calcular o próximo intervalo.

---

# 3. Atualização da Estabilidade

Após cada revisão, a estabilidade é atualizada.

Se o usuário acertar:

S' = S \* (1 + e\^(w1) \* D\^(w2) \* S\^(w3) \* (1 - R)\^(w4))

Onde:

- `w1...w4` são parâmetros treináveis
- `D` é a dificuldade
- `R` é a retenção estimada no momento da revisão

Se o usuário errar:

S' = S_relearn

---

# 4. Atualização da Dificuldade

D' = D + w5 \* (grade - expected)

- Se o item foi difícil → dificuldade aumenta\
- Se foi fácil → dificuldade diminui

---

# 5. Estrutura Completa de um Card

Cada card mantém:

D → dificuldade\
S → estabilidade\
R → retenção estimada

Fluxo:

1.  Calcular R(t)
2.  Usuário responde
3.  Atualizar S
4.  Atualizar D
5.  Calcular próximo intervalo

---

# 6. Intuição Matemática

O FSRS assume:

- A memória decai exponencialmente
- Cada revisão aumenta a constante de tempo do decaimento
- O ganho é proporcional à surpresa (1 − R)

Se você revisa muito cedo → pouco ganho\
Se revisa perto de esquecer → grande ganho

---

# 7. Conclusão

O FSRS transforma repetição espaçada em um problema de:

- Modelagem probabilística
- Otimização de parâmetros
- Maximização de retenção com custo mínimo
