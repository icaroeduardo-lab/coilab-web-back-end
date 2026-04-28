# Use Cases — Camada de Aplicação

Todos os use cases seguem arquitetura hexagonal: recebem input simples (DTO), operam via interfaces de repositório (ports), e retornam output simples ou `void`.

Use cases de listagem retornam `PaginatedOutput<T>` com `{ data, total, page, limit }`. Defaults: page=1, limit=20, máximo 100.

---

## User

### UpsertUserFromCognitoUseCase

Cria ou atualiza usuário a partir do token Cognito. Chamado no login/refresh.

| Input | Tipo | Descrição |
|---|---|---|
| `cognitoSub` | `string` | UUID do Cognito — usado diretamente como `UserId` |
| `name` | `string` | |
| `imageUrl` | `string?` | |

- Existente: chama `syncProfile()` e salva.
- Novo: cria `User` e salva.

**Deps**: `IUserRepository`

---

### GetUserUseCase

| Input | Output |
|---|---|
| `id: string` | entidade `User` |

**Erros**: `User not found`  
**Deps**: `IUserRepository`

---

## Applicant

### CreateApplicantUseCase

| Input | Output |
|---|---|
| `name: string` | `{ id, name }` |

Gera UUID, cria e salva `Applicant`.  
**Deps**: `IApplicantRepository`

---

### UpdateApplicantUseCase

| Input | Descrição |
|---|---|
| `id: string` | |
| `name: string` | Novo nome |

**Erros**: `Applicant not found`  
**Deps**: `IApplicantRepository`

---

### DeleteApplicantUseCase

| Input |
|---|
| `id: string` |

**Erros**: `Applicant not found`  
**Deps**: `IApplicantRepository`

---

### GetApplicantUseCase

| Input | Output |
|---|---|
| `id: string` | `{ id, name }` |

**Erros**: `Applicant not found`  
**Deps**: `IApplicantRepository`

---

### ListApplicantsUseCase

| Input (opcional) | Output |
|---|---|
| `page?, limit?` | `PaginatedOutput<{ id, name }>` |

**Deps**: `IApplicantRepository`

---

## Flow

### CreateFlowUseCase

| Input | Output |
|---|---|
| `name: string` | `{ id, name }` |

**Deps**: `IFlowRepository`

---

### DeleteFlowUseCase

| Input |
|---|
| `id: string` |

**Erros**: `Flow not found`  
**Deps**: `IFlowRepository`

---

### ListFlowsUseCase

| Input (opcional) | Output |
|---|---|
| `page?, limit?` | `PaginatedOutput<{ id, name }>` |

**Deps**: `IFlowRepository`

---

## Project

### CreateProjectUseCase

| Input | Tipo |
|---|---|
| `name` | `string` |
| `description` | `string` |
| `urlDocument` | `string?` |

Gera `projectNumber` sequencial (`#YYYYnnnn`) e salva.  
**Deps**: `IProjectRepository`

---

### UpdateProjectUseCase

| Input | Tipo |
|---|---|
| `id` | `string` |
| `name` | `string?` |
| `description` | `string?` |
| `urlDocument` | `string?` |

Apenas campos fornecidos são alterados.  
**Erros**: `Project not found`  
**Deps**: `IProjectRepository`

---

### ChangeProjectStatusUseCase

| Input | Tipo |
|---|---|
| `id` | `string` |
| `status` | `ProjectStatus` |

**Erros**: `Project not found`  
**Deps**: `IProjectRepository`

---

### ListProjectsUseCase

Retorna todos os projetos sem `urlDocument`.

**Output**: `ProjectListOutput[]`

```typescript
{ id, projectNumber, name, description, status, createdAt }
```

**Deps**: `IProjectRepository`

---

### GetProjectUseCase

| Input | Output |
|---|---|
| `id: string` | `ProjectOutput` (inclui `urlDocument`) |

**Erros**: `Project not found`  
**Deps**: `IProjectRepository`

---

### GetDocumentUploadUrlUseCase

Gera URL pré-assinada S3 para upload de documento do projeto.

| Input | Tipo |
|---|---|
| `projectId` | `string` |
| `filename` | `string` |

**Output**: `{ uploadUrl, fileUrl, key }`

- Key: `{projectNumber}/{uuid}{ext}`
- Bucket: env `BUCKET_PROJECTS_DOCUMENTS`

**Erros**: `Project not found`  
**Deps**: `IProjectRepository`, `S3StorageService`

---

## Task

### CreateTaskUseCase

| Input | Tipo | Descrição |
|---|---|---|
| `projectId` | `string` | |
| `name` | `string` | |
| `description` | `string` | |
| `priority` | `TaskPriority` | |
| `applicantId` | `string` | Setor solicitante |
| `creatorId` | `string` | Usuário criador |
| `flowIds` | `string[]?` | |
| `subTasks` | `CreateTaskSubTaskInput[]?` | |

**CreateTaskSubTaskInput**: `{ type: SubTaskType, idUser: string, expectedDelivery: Date }`

Gera `taskNumber` sequencial. Subtasks criadas com status `Não iniciado`. Task nasce com status `Backlog`.  
**Deps**: `ITaskRepository`

---

### UpdateTaskUseCase

| Input | Tipo | Descrição |
|---|---|---|
| `id` | `string` | |
| `name` | `string?` | |
| `description` | `string?` | |
| `priority` | `TaskPriority?` | |
| `projectId` | `string?` | Muda o projeto da task |
| `applicantId` | `string?` | Muda o setor |
| `flowIdsToAdd` | `string[]?` | Flows a adicionar |
| `flowIdsToRemove` | `string[]?` | Flows a remover |
| `subTaskIdsToRemove` | `string[]?` | Subtasks a remover |

Regras: `taskNumber` imutável; `addFlowId` lança erro se duplicado; `removeSubTask` bloqueia se subtask ativa.

**Erros**: `Task not found`  
**Deps**: `ITaskRepository`

---

### ChangeTaskStatusUseCase

| Input | Tipo |
|---|---|
| `id` | `string` |
| `status` | `TaskStatus` |

Aplica regras de validação de Checkout.  
**Erros**: `Task not found`  
**Deps**: `ITaskRepository`

---

### DeleteTaskUseCase

| Input |
|---|
| `id: string` |

Chama `assertCanBeDeleted()` — bloqueia se qualquer subtask estiver em `Em progresso`, `Aguardando Checkout` ou `Aprovado`.

**Erros**: `Task not found`, `Task não pode ser removida pois possui subtasks ativas`  
**Deps**: `ITaskRepository`

---

### GetTaskUseCase

Retorna detalhes completos com join de creator, applicant, project, flows e usuários dos campos Discovery.

| Input |
|---|
| `id: string` |

**Output**: `TaskDetailOutput`

```typescript
{
  id, name, taskNumber, priority, status, description,
  project: { id, name },
  applicant: { id, name },
  creator: { id, name, imageUrl? },
  flows: { id, name }[],
  subTasks: SubTaskOutput[],  // inclui designs e discoveryForm com dados de usuário
  createdAt
}
```

Joins executados em `Promise.all` único. `userId` de cada campo Discovery também resolvido em paralelo.

**Erros**: `Task not found`, `Creator not found`, `Applicant not found`, `Project not found`  
**Deps**: `ITaskRepository`, `IUserRepository`, `IApplicantRepository`, `IFlowRepository`, `IProjectRepository`

---

### ListTasksByProjectUseCase

Lista tasks de um projeto — output slim, sem joins.

| Input | Output |
|---|---|
| `projectId: string` | `TaskOutput[]` |

```typescript
{ id, projectId, name, taskNumber, priority, status }
```

**Deps**: `ITaskRepository`

---

### ListAllTasksUseCase

Lista todas as tasks com join de applicant e project, subtasks deduplicadas por tipo e paginação.

| Input (opcional) | Output |
|---|---|
| `page?, limit?` | `PaginatedOutput<TaskListOutput>` |

```typescript
interface TaskListOutput {
  id, name, taskNumber, priority, status, description,
  project: { id, name },
  applicant: { id, name },
  subTasks: { type, status }[],  // um por tipo, o mais recente
  createdAt
}
```

**Deduplicação de subtasks**: quando existem múltiplas subtasks do mesmo tipo (ex: dois `Discovery` — o primeiro reprovado, segundo ativo), apenas a com `createdAt` mais recente é incluída.

**Join em batch**: coleta IDs únicos de applicants e projects → `findByIds` em paralelo → maps para lookup O(1).

**Erros**: `Applicant not found`, `Project not found`  
**Deps**: `ITaskRepository`, `IApplicantRepository`, `IProjectRepository`

---

### AddSubTaskToTaskUseCase

| Input | Tipo |
|---|---|
| `taskId` | `string` |
| `type` | `SubTaskType` |
| `idUser` | `string` |
| `expectedDelivery` | `Date` |

Não é possível adicionar subtask do mesmo tipo se a anterior não estiver `Reprovado`.

**Erros**: `Task not found`, erro de tipo duplicado  
**Deps**: `ITaskRepository`

---

### ChangeSubTaskStatusUseCase

Muda o status de uma subtask via action.

| Input | Tipo |
|---|---|
| `taskId` | `string` |
| `subTaskId` | `string` |
| `action` | `'start' \| 'complete' \| 'approve' \| 'reject' \| 'cancel'` |
| `reason` | `string?` (obrigatório para `reject` e `cancel`) |

Após a mudança, re-avalia o status da Task chamando `task.changeStatus(task.getStatus())`.

**Erros**: `Task not found`, `SubTask not found`, `reason is required for reject/cancel`  
**Deps**: `ITaskRepository`

---

### UpdateDiscoveryFormUseCase

Atualiza campos do formulário de uma `DiscoverySubTask`.

| Input | Tipo |
|---|---|
| `taskId` | `string` |
| `subTaskId` | `string` |
| `userId` | `string` |
| `fields` | `Partial<DiscoveryFormInput>` |

Apenas campos informados são alterados. Bloqueado se subtask não for editável. Subtask deve ser do tipo `Discovery`.

**Erros**: `Task not found`, `SubTask not found`, `SubTask is not a Discovery type`  
**Deps**: `ITaskRepository`

---

### AddDesignToSubTaskUseCase

Adiciona imagem de design a uma `DesignSubTask`.

| Input | Tipo |
|---|---|
| `taskId` | `string` |
| `subTaskId` | `string` |
| `userId` | `string` |
| `title` | `string` |
| `description` | `string` |
| `urlImage` | `string` (URL S3 — obtida via `GetDesignUploadUrlUseCase`) |

**Output**: `{ id: string }` (id do Design criado)

Subtask deve ser do tipo `Design` e editável.

**Erros**: `Task not found`, `SubTask not found`, `SubTask is not a Design type`  
**Deps**: `ITaskRepository`

---

### RemoveDesignFromSubTaskUseCase

Remove imagem de design de uma `DesignSubTask`.

| Input | Tipo |
|---|---|
| `taskId` | `string` |
| `subTaskId` | `string` |
| `designId` | `string` |

Subtask deve ser do tipo `Design` e editável.

**Erros**: `Task not found`, `SubTask not found`, `SubTask is not a Design type`, design não encontrado  
**Deps**: `ITaskRepository`

---

### GetDesignUploadUrlUseCase

Gera URL pré-assinada S3 para upload de imagem de design.

| Input | Tipo |
|---|---|
| `taskId` | `string` |
| `filename` | `string` |

**Output**: `{ uploadUrl, fileUrl, key }`

- Key: `{taskNumber}/{uuid}{ext}`
- Bucket: env `BUCKET_DESIGN`

**Erros**: `Task not found`  
**Deps**: `ITaskRepository`, `S3StorageService`
