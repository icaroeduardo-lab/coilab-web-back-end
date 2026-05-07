# Regras de Negócio — Domínio CoiLab

## Visão Geral

O domínio é organizado em quatro agregados principais: **Project**, **Task**, **SubTask** e **User**, além das entidades de suporte **Applicant** e **Flow**. Uma Task pertence a um Project; uma SubTask pertence a uma Task. O ciclo de vida de cada entidade segue regras de status aplicadas e validadas dentro das próprias classes de domínio.

Flows são referenciados apenas por ID dentro da Task — o join com nome/dados é feito na camada de use cases quando necessário.

---

## Numeração sequencial

Projects e Tasks recebem um número sequencial gerado automaticamente no formato `#YYYYnnnn`:

- `YYYY` = ano atual
- `nnnn` = contador sequencial zero-padded (0001, 0002, …)

O número é **imutável** após a criação. Exemplos: `#20260001`, `#20260002`.

---

## Paginação

Use cases de listagem retornam `PaginatedOutput<T>`:

```typescript
interface PaginatedOutput<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

Defaults: `page = 1`, `limit = 20`, máximo `limit = 100`.

---

## Applicant

Representa o setor ou departamento solicitante de uma Task.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `ApplicantId` | Identificador único (UUID) |
| `name` | `string` | Nome do setor/departamento |

### Regras

- `changeName(name)` — atualiza o nome.
- Applicant pode ser deletado sem restrições de negócio no domínio.

---

## Flow

Representa um fluxo de trabalho que pode ser associado a Tasks.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `FlowId` | Identificador único (UUID) |
| `name` | `string` | Nome do fluxo |

### Regras

- Flow pode ser deletado sem restrições de negócio no domínio.
- Tasks armazenam apenas `FlowId[]` — o nome é resolvido via join no use case.
- Não é possível adicionar o mesmo `FlowId` duas vezes a uma Task (`addFlowId` lança erro se duplicado).

---

## User

Representa um usuário do sistema autenticado via AWS Cognito (SSO Google).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `UserId` | UUID igual ao `sub` do Cognito |
| `name` | `string` | Nome do usuário |
| `imageUrl` | `string?` | URL do avatar (opcional) |

### Regras

- O `id` é diretamente o `cognitoSub` — não há campo separado de provedor OAuth.
- `syncProfile(name, imageUrl?)` — atualiza nome e avatar. Chamado no login/refresh do token Cognito.

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
- `projectNumber` é imutável após a criação.
- `urlDocument` é opcional; pode ser atualizado a qualquer momento.
- Upload de documento via URL pré-assinada S3 (bucket: `BUCKET_PROJECTS_DOCUMENTS`). Key: `{projectNumber}/{uuid}{ext}`.

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

### Campos principais

| Campo | Tipo | Imutável? | Descrição |
|---|---|---|---|
| `taskNumber` | `string` | Sim | Número sequencial (`#YYYYnnnn`), gerado na criação |
| `projectId` | `ProjectId` | Não | Projeto ao qual a task pertence |
| `applicantId` | `ApplicantId` | Não | Setor solicitante |
| `creatorId` | `UserId` | Sim | Usuário que criou a task |
| `flowIds` | `FlowId[]` | Não | IDs dos flows associados (sem dados de join) |

### Regras de transição automática

**Backlog → Em Execução**
Ocorre ao chamar `changeStatus(EM_EXECUCAO)`.

**Checkout — validação ao entrar no status**
- Se a Task não tiver subtasks: checkout permitido sem restrições.
- Se tiver subtasks, cada tipo (`Discovery`, `Design`, `Diagram`) é avaliado separadamente:
  - Todas as subtasks do tipo devem estar em `Aguardando Checkout`, `Aprovado` ou `Reprovado`.
  - Se alguma estiver `Reprovado`, deve existir outra do mesmo tipo em `Aguardando Checkout` (substituta).
  - Se qualquer condição falhar, o status reverte automaticamente para `Em Execução`.

> Após qualquer mudança de status de uma SubTask, o use case chama `task.changeStatus(task.getStatus())` para re-avaliar as regras de Checkout.

**Desenvolvimento — validação ao entrar no status**
- Se a Task não tiver subtasks: transição permitida sem restrições.
- Se tiver subtasks:
  - Nenhuma subtask pode estar em `Em Progresso`, `Não Iniciado` ou `Aguardando Checkout`.
  - Para cada tipo, deve existir ao menos uma subtask `Aprovada` (ignorando as `Canceladas`).
  - Se alguma estiver `Reprovada`, deve existir outra do mesmo tipo com status `Aprovado` (substituta aprovada).
  - Violação lança erro — não há reversão automática.

### Regra de adição de subtasks

- Só é possível adicionar segunda subtask do mesmo tipo se a anterior estiver com status `Reprovado`.
- Tentativa de adicionar subtask de tipo já existente e não reprovada lança erro.

### Regra de remoção de subtask individual (removeSubTask)

Subtask pode ser removida da Task apenas se estiver em:

| Status permitido |
|---|
| `Não iniciado` |
| `Reprovado` |
| `Cancelado` |

Status bloqueantes: `Em progresso`, `Aguardando Checkout`, `Aprovado`.

### Regra de deleção da Task (assertCanBeDeleted)

Task só pode ser deletada se **todas** as subtasks estiverem em status terminal sem trabalho ativo:

| Status permitido |
|---|
| `Não iniciado` |
| `Reprovado` |
| `Cancelado` |

### Regra de flows

- Não é possível adicionar o mesmo `FlowId` duas vezes (`addFlowId` lança erro se duplicado).
- `removeFlowId` lança erro se o ID não existir na lista.

### Upload de designs

Uploads de imagens de Design são feitos via URL pré-assinada S3 (bucket: `BUCKET_DESIGN`). Key: `{taskNumber}/{uuid}{ext}`.

---

## SubTask

### Campos base

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `SubTaskId` | Identificador único |
| `taskId` | `TaskId` | Task à qual pertence |
| `idUser` | `UserId` | Usuário que criou a subtask |
| `status` | `SubTaskStatus` | Status atual |
| `type` | `SubTaskType` | `Discovery`, `Design` ou `Diagram` |
| `expectedDelivery` | `Date` | Data prevista de entrega |
| `createdAt` | `Date` | Data/hora de criação |
| `startDate` | `Date?` | Preenchida ao chamar `start()` |
| `completionDate` | `Date?` | Preenchida ao chamar `complete()` |
| `reason` | `string?` | Motivo de reprovação ou cancelamento |

### Status

| Valor | Descrição |
|---|---|
| `Não iniciado` | Subtask criada, sem início |
| `Em progresso` | Trabalho em andamento |
| `Aguardando Checkout` | Entrega submetida para revisão |
| `Aprovado` | Entrega aprovada |
| `Reprovado` | Entrega rejeitada — motivo obrigatório |
| `Cancelado` | Abandonada — motivo obrigatório |

### Transições de status (actions)

| Action | Transição | Requer `reason` |
|---|---|---|
| `start` | Não iniciado → Em progresso | Não |
| `complete` | Em progresso → Aguardando Checkout | Não |
| `approve` | Aguardando Checkout → Aprovado | Não |
| `reject` | Aguardando Checkout → Reprovado | Sim |
| `cancel` | Qualquer → Cancelado | Sim |

> `cancel` é bloqueado se a subtask já estiver `Aprovado`.

### Trava de edição (assertEditable)

Subtasks com status `Aguardando Checkout`, `Aprovado`, `Reprovado` ou `Cancelado` são **somente leitura**. Tentativas de modificar campos lançam erro.

---

## DiscoverySubTask

Formulário estruturado de levantamento. Cada campo registra o **último** usuário que o preencheu e o timestamp.

```typescript
interface DiscoveryFieldEntry<T> {
  value: T;
  userId: UserId;   // join com User feito no GetTaskUseCase
  filledAt: Date;
}
```

### Campos do formulário

| Campo | Tipo do valor |
|---|---|
| `complexity` | `Level` (Alta / Média / Baixa) |
| `projectName` | `string` |
| `summary` | `string` |
| `painPoints` | `string` |
| `frequency` | `Frequency` (Diária / Semanal / Mensal / Eventual) |
| `currentProcess` | `string` |
| `inactionCost` | `string` |
| `volume` | `string` |
| `avgTime` | `string` |
| `humanDependency` | `Level` |
| `rework` | `string` |
| `previousAttempts` | `string` |
| `benchmark` | `string` |
| `institutionalPriority` | `Level` |
| `technicalOpinion` | `string` |

### Regras

- `updateForm(data, userId)` — atualiza apenas os campos informados. Bloqueado se subtask não for editável.
- `complete()` — verifica se **todos** os 15 campos estão preenchidos antes de avançar. Campos faltantes são listados no erro.
- No `GetTaskUseCase`, todos os `userId` dos campos preenchidos são coletados e resolvidos em paralelo via `IUserRepository`.

---

## DesignSubTask

Gerencia imagens de design vinculadas à subtask.

Cada `Design` armazena:

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `DesignId` | Identificador único |
| `title` | `string` | Título descritivo |
| `description` | `string` | Descrição |
| `urlImage` | `string` | URL da imagem (S3) |
| `user` | `ApplicantId` | Usuário que fez o upload |
| `dateUpload` | `Date` | Data/hora do upload |

### Regras

- `addDesign(design)` — bloqueado se subtask não for editável.
- `removeDesign(id)` — remove pelo ID; lança erro se não encontrado; bloqueado se não editável.

---

## DiagramSubTask

Gerencia diagramas vinculados à subtask.

Cada `Diagram` armazena:

| Campo | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Título do diagrama |
| `description` | `string` | Descrição |
| `urlDiagram` | `string` | URL do diagrama |
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
| `UserId` | `UserId(uuid)` |
| `ApplicantId` | `ApplicantId(uuid)` |
| `FlowId` | `FlowId(uuid)` |
| `DesignId` | `DesignId(uuid)` |
