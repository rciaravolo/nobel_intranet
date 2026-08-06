---
name: skill-contract
description: Contrato canônico de 10 campos que todo skill deste sistema deve respeitar — template, definições e checklist de validação
type: padrao
version: 1
---

## Canonical
Meta-skill que define o contrato estrutural de todos os skills do INTRA. Um skill sem todos os 10 campos é considerado incompleto e não deve ser invocado como autoridade.

## Entry Point
**Invocar quando:**
- criar um skill novo
- revisar se um skill existente está completo
- "qual o formato de um skill?"
- validar um skill antes de considerá-lo pronto

**NÃO invocar para:**
- usar um skill existente (consultar o skill diretamente)
- entender o conteúdo de domínio (ver skills em `dominio/`)

## Source of Truth
Este arquivo. Nenhuma outra fonte define o contrato de skills.

## Scope Resolver
**DENTRO:** template de skill, definições dos 10 campos, checklist de validação, anti-padrões

**FORA:** conteúdo de domínio, templates de código, regras de negócio

## Evidence Gates
- Todo skill novo deve ter todos os 10 campos preenchidos (não "TBD", não vazios)
- `entry point` deve ter ≥3 exemplos de frases que disparam e ≥1 que não dispara
- `scope resolver` deve ter ≥1 item "FORA"
- `output contract` deve ser determinístico

## Mutation Boundary
**PODE:** atualizar as definições dos campos se o time aprender algo novo sobre o que funciona
**NUNCA:** remover campos do contrato; reduzir os requisitos de validação

## Verification Protocol
1. Aplicar checklist de validação abaixo no skill em revisão
2. Todos os 7 critérios passam? → skill é válido
3. Qualquer critério falha? → skill está incompleto, não publicar

## Output Contract
Consultado; não produz output direto. Skills criados com base neste contrato produzem seus próprios outputs.

## Companion Reference
- `AGENTS.md` — índice de todos os skills
- Todos os outros skills deste sistema são instâncias deste contrato

## Feedback Loop
Quando um anti-padrão novo for descoberto na prática, adicionar à tabela de anti-padrões abaixo.

---

## Template de Skill

```markdown
---
name: <nome-do-skill>
description: <uma linha — usada para decisão de relevância, seja específico>
type: dominio | workflow | padrao
version: 1
---

## Canonical
<!-- O que este skill é. Uma definição inequívoca de propósito. Sem ambiguidade. -->

## Entry Point
<!-- Frases exatas ou condições que disparam este skill.
     Inclua exemplos positivos (invocar) e negativos (não invocar). -->

## Source of Truth
<!-- Onde vivem os dados/configurações que este skill usa.
     File paths, URLs, ou sistemas externos com localização exata. -->

## Scope Resolver
<!-- O que está DENTRO do escopo deste skill.
     O que está FORA — explicitamente. -->

## Evidence Gates
<!-- Pré-condições que DEVEM ser verificadas antes de qualquer ação.
     Se uma gate falhar, o skill para e reporta. -->

## Mutation Boundary
<!-- O que este skill PODE escrever/modificar.
     O que este skill NUNCA toca. -->

## Verification Protocol
<!-- Passos para confirmar que a saída está correta.
     Deve ser verificável sem assumir que o skill funcionou. -->

## Output Contract
<!-- O que este skill produz: formato, localização, side effects.
     Deve ser determinístico — mesma entrada → mesma saída.
     Skills de referência: "Skill de referência — não produz output." -->

## Companion Reference
<!-- Skills relacionados, agentes que complementam, docs canônicos.
     Pelo menos 1 referência obrigatória. -->

## Feedback Loop
<!-- Como este skill captura aprendizados.
     Onde registrar quando o skill falhou ou precisou de ajuste. -->
```

---

## Definições dos 10 Campos

### `canonical`
Nome único no sistema. Nenhum outro skill pode ter propósito sobreposto sem fronteira explícita. Se dois skills cobrem áreas similares, o `scope resolver` de cada um deve citar o outro e definir a fronteira.

### `entry point`
Não é só "quando usar" — é a frase literal que o usuário digita (ou a condição do sistema) que dispara este skill. Sem entry point claro, o skill fica invisível ou é invocado errado.

### `source of truth`
Um skill não inventa dados. Ele lê de um lugar específico. Se a fonte mudou, o skill deve falhar ruidosamente, não silenciosamente.

### `scope resolver`
A fronteira do "fora do escopo" é tão importante quanto o "dentro". Um skill sem escopo negativo expresso vai vazar para territórios de outros skills.

### `evidence gates`
Gates são asserções que devem passar antes de qualquer mutation. Exemplos: "o arquivo X existe", "o branch não é main", "o campo Y existe na tabela". Se uma gate falha, o skill para — não tenta compensar.

### `mutation boundary`
Lista explícita de o que o skill pode tocar (arquivos, tabelas, APIs). Tudo fora desta lista é proibido. Protege contra efeitos colaterais não documentados.

### `verification protocol`
Após executar, como saber que funcionou? O protocolo deve ser independente do skill — verificável por um agente diferente ou pelo usuário.

### `output contract`
Formato exato da saída. Se o skill é referência: declarar explicitamente "não produz output". Se gera artefato: qual é o path, qual é o formato? Determinismo é obrigatório.

### `companion reference`
Skills não vivem em isolamento. Esta seção aponta para o ecossistema: qual agente executa este skill, quais skills devem rodar antes/depois, onde está a doc de referência.

### `feedback loop`
O skill deve ter um mecanismo para capturar quando falhou ou foi ajustado. Pode ser um `## Histórico de Mudanças` no final, uma nota em MEMORY.md, ou um link para onde registrar. Sem feedback loop, o skill não evolui.

---

## Checklist de Validação

Um skill é **válido** quando:
- [ ] Todos os 10 campos estão presentes e preenchidos (não vazios, não "TBD")
- [ ] O `entry point` tem ≥3 exemplos de frases que disparam e ≥1 que NÃO dispara
- [ ] O `scope resolver` lista ≥1 item "FORA"
- [ ] O `evidence gates` tem ≥1 gate verificável
- [ ] O `mutation boundary` declara o que **não** pode ser tocado
- [ ] O `output contract` é determinístico (sem "pode gerar X ou Y")
- [ ] O `companion reference` cita ≥1 outro skill ou agente

---

## Anti-padrões

| Anti-padrão | Por que falha |
|-------------|---------------|
| Skill sem `evidence gates` | Age sem verificar precondições — falha silenciosa |
| `output contract` vago ("gera um relatório") | Não é verificável, não é reproduzível |
| `scope resolver` só com "dentro" | Vaza para outros domínios |
| `source of truth` apontando para memória do agente | Memória é volátil; a fonte deve ser um arquivo ou sistema externo |
| `entry point` com apenas "quando o usuário pedir X" | Ambíguo — não define quando NÃO invocar |
| `mutation boundary` sem lista de proibições | Permite side effects não documentados |
| Skill sem `companion reference` | Ilha de conhecimento — não se conecta ao ecossistema |
