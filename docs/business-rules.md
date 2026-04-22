# Regras de Negócio — Domínio CoiLab

## Visão Geral

O domínio é organizado em três agregados principais: **Project**, **Task** e **SubTask**. Uma Task pertence a um Project; uma SubTask pertence a uma Task. O ciclo de vida de cada entidade segue regras de status que são aplicadas e validadas dentro das próprias classes de domínio.

---

## Project

### Status

| Valor | Descrição |
|---|---|
| `backlog` | Projeto criado, ainda não iniciado |
| `em execução` | Projeto em andamento |
| `concluído` | Projeto finalizado |
| `cancelado` | Projeto cancelado |

### Regras

- Todo projeto nasce com status `backlog`.
- A transição de status é livre — sem restrições automáticas no domínio.
- Uma Task só pode ser adicionada ao projeto se o `projectId` da Task corresponder ao `id` do Project.

---

## Task

### Status

| Valor | Descrição |
|---|---|
| `Backlog` | Task criada, nenhuma subtask iniciada |
| `Em Execução` | Ao menos uma subtask em progresso |
| `Checkout` | Todas as subtasks entregues ou aprovadas |
| `Desenvolvimento` | Em desenvolvimento técnico |
| `Testes` | Em fase de testes |
| `Concluído` | Finalizada |

### Regras de transição automática

**Backlog → Em Execução**
- Ocorre automaticamente ao adicionar uma subtask com status `Em progresso`, ou ao chamar `changeStatus(EM_EXECUCAO)`.

**Checkout — validação ao entrar no status**
- Se a Task não tiver subtasks: checkout permitido sem restrições.
- Se tiver subtasks, cada tipo de subtask (`Discovery`, `Design`, `Diagram`) é avaliado separadamente:
  - Todas as subtasks do tipo devem estar em `Aguardando Checkout`, `Aprovado` ou `Reprovado`.
  - Se alguma estiver `Reprovado`, deve existir outra do mesmo tipo em `Aguardando Checkout` (substituta).
  - Se qualquer uma das condições falhar, o status reverte automaticamente para `Em Execução`.

### Regra de adição de subtasks

- Só é possível adicionar uma segunda subtask do mesmo tipo se a anterior estiver com status `Reprovado`.
- Tentativa de adicionar subtask de tipo já existente e não reprovada lança erro.

### Regra de remoção (assertCanBeDeleted)

A Task só pode ser removida se **todas** as suas subtasks estiverem em um dos estados terminais sem trabalho ativo:

| Status permitido | Motivo |
|---|---|
| `Não iniciado` | Nenhum trabalho foi iniciado |
| `Reprovado` | Entrega rejeitada, sem continuidade |
| `Cancelado` | Trabalho abandonado explicitamente |

Se qualquer subtask estiver em `Em progresso`, `Aguardando Checkout` ou `Aprovado`, a remoção é bloqueada com erro.

---

## SubTask

Todas as subtasks compartilham a mesma base de campos e comportamentos.

### Campos base

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `SubTaskId` | Identificador único |
| `taskId` | `TaskId` | Task à qual pertence |
| `idUser` | `ApplicantId` | Usuário que criou a subtask |
| `status` | `SubTaskStatus` | Status atual |
| `type` | `SubTaskType` | `Discovery`, `Design` ou `Diagram` |
| `expectedDelivery` | `Date` | Data prevista de entrega |
| `createdAt` | `Date` | Data/hora de criação |
| `startDate` | `Date?` | Data/hora de início (preenchida ao chamar `start()`) |
| `completionDate` | `Date?` | Data/hora de conclusão (preenchida ao chamar `complete()`) |
| `reason` | `string?` | Motivo de reprovação ou cancelamento |

### Status

| Valor | Descrição |
|---|---|
| `Não iniciado` | Subtask criada, sem início |
| `Em progresso` | Trabalho em andamento |
| `Aguardando Checkout` | Entrega submetida para revisão |
| `Aprovado` | Entrega aprovada pelo revisor |
| `Reprovado` | Entrega rejeitada — motivo obrigatório |
| `Cancelado` | Abandonada — motivo obrigatório |

### Transições de status

```
Não iniciado → Em progresso        (start)
Em progresso → Aguardando Checkout (complete)
Aguardando Checkout → Aprovado     (approve)
Aguardando Checkout → Reprovado    (reject — motivo obrigatório)
Qualquer* → Cancelado              (cancel — motivo obrigatório)
```

> `cancel()` é bloqueado se a subtask já estiver `Aprovado`.

### Trava de edição (assertEditable)

Subtasks com status `Aguardando Checkout`, `Aprovado`, `Reprovado` ou `Cancelado` são **somente leitura**. Qualquer tentativa de modificar campos (ex: `updateForm`, `addDesign`) lança erro.

---

## DiscoverySubTask

Formulário estruturado de levantamento. Cada campo registra o **último** usuário que o preencheu e o timestamp.

### Campos do formulário

| Campo | Tipo do valor | Descrição |
|---|---|---|
| `complexity` | `Level` | Complexidade estimada (Alta / Média / Baixa) |
| `projectName` | `string` | Nome do projeto |
| `summary` | `string` | Resumo do problema |
| `painPoints` | `string` | Pontos de dor |
| `frequency` | `Frequency` | Frequência de ocorrência |
| `currentProcess` | `string` | Como o processo ocorre hoje |
| `inactionCost` | `string` | Custo de não resolver |
| `volume` | `string` | Volume de ocorrências |
| `avgTime` | `string` | Tempo médio por ocorrência |
| `humanDependency` | `Level` | Grau de dependência humana |
| `rework` | `string` | Existe retrabalho? |
| `previousAttempts` | `string` | Tentativas anteriores de solução |
| `benchmark` | `string` | Referências de mercado |
| `institutionalPriority` | `Level` | Prioridade institucional |
| `technicalOpinion` | `string` | Opinião técnica |

Cada campo é armazenado como:

```typescript
{
  value: T         // valor preenchido
  userId: ApplicantId  // quem preencheu
  filledAt: Date   // quando foi preenchido
}
```

### Enums de suporte

**Level**
- `Alta`, `Média`, `Baixa`

**Frequency**
- `Diária`, `Semanal`, `Mensal`, `Eventual`

### Regras

- `updateForm(data, userId)` — atualiza apenas os campos informados. Campos omitidos não são alterados.
- Bloqueado se a subtask não for editável (status travado).
- `complete()` — verifica se **todos** os 15 campos estão preenchidos antes de avançar para `Aguardando Checkout`. Campos faltantes são listados no erro.

---

## DesignSubTask

Gerencia imagens de design vinculadas à subtask.

### Rastreio por imagem

Cada `Design` armazena:

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `DesignId` | Identificador único |
| `title` | `string` | Título descritivo |
| `description` | `string` | Descrição da imagem |
| `urlImage` | `string` | URL da imagem (deve ser URL válida) |
| `user` | `ApplicantId` | Usuário que fez o upload |
| `dateUpload` | `Date` | Data/hora do upload |

### Regras

- `addDesign(design)` — bloqueado se subtask não for editável.
- `removeDesign(id)` — remove pelo ID; lança erro se não encontrado; bloqueado se não editável.

---

## DiagramSubTask

Gerencia diagramas (ex: fluxo, ER) vinculados à subtask.

### Rastreio por diagrama

Cada `Diagram` armazena:

| Campo | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Título do diagrama |
| `description` | `string` | Descrição |
| `urlDiagram` | `string` | URL do diagrama (deve ser URL válida) |
| `user` | `ApplicantId` | Usuário que fez o upload |
| `dateUpload` | `Date` | Data/hora do upload |

### Regras

- `addDiagram(diagram)` — bloqueado se subtask não for editável.
- `removeDiagram(title)` — remove pelo título; lança erro se não encontrado; bloqueado se não editável.

---

## Rastreio de autoria — resumo

| Entidade | Criador da subtask | Por item |
|---|---|---|
| `DiscoverySubTask` | `idUser` + `createdAt` | cada campo: `userId` + `filledAt` |
| `DesignSubTask` | `idUser` + `createdAt` | cada imagem: `user` + `dateUpload` |
| `DiagramSubTask` | `idUser` + `createdAt` | cada diagrama: `user` + `dateUpload` |

---

## Identificadores tipados

Todos os IDs são branded types — strings com tipo nominal em compile time, sem custo em runtime.

| Tipo | Fábrica |
|---|---|
| `ProjectId` | `ProjectId(uuid)` |
| `TaskId` | `TaskId(uuid)` |
| `SubTaskId` | `SubTaskId(uuid)` |
| `ApplicantId` | `ApplicantId(uuid)` |
| `FlowId` | `FlowId(uuid)` |
| `DesignId` | `DesignId(uuid)` |
