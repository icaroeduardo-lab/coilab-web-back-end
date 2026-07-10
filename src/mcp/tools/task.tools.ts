import { z } from 'zod';
import type { INestApplicationContext } from '@nestjs/common';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TaskPriority, TaskStatus } from '../../domain/entities/task.entity';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task/CreateTaskUseCase';
import { GetTaskUseCase } from '../../application/use-cases/task/get-task/GetTaskUseCase';
import { ListAllTasksUseCase } from '../../application/use-cases/task/list-all-tasks/ListAllTasksUseCase';
import { ListTasksByProjectUseCase } from '../../application/use-cases/task/list-tasks-by-project/ListTasksByProjectUseCase';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task/UpdateTaskUseCase';
import { ChangeTaskStatusUseCase } from '../../application/use-cases/task/change-task-status/ChangeTaskStatusUseCase';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task/DeleteTaskUseCase';
import { AddSubTaskToTaskUseCase } from '../../application/use-cases/task/add-subtask-to-task/AddSubTaskToTaskUseCase';
import { ChangeSubTaskStatusUseCase } from '../../application/use-cases/task/change-subtask-status/ChangeSubTaskStatusUseCase';
import { UpdateDiscoveryFormUseCase } from '../../application/use-cases/task/update-discovery-form/UpdateDiscoveryFormUseCase';
import { ListTaskToolsUseCase } from '../../application/use-cases/task/list-task-tools/ListTaskToolsUseCase';
import { AddChecklistItemUseCase } from '../../application/use-cases/task/add-checklist-item/AddChecklistItemUseCase';
import { RemoveChecklistItemUseCase } from '../../application/use-cases/task/remove-checklist-item/RemoveChecklistItemUseCase';
import { ToggleChecklistItemUseCase } from '../../application/use-cases/task/toggle-checklist-item/ToggleChecklistItemUseCase';
import { ReorderChecklistItemUseCase } from '../../application/use-cases/task/reorder-checklist-item/ReorderChecklistItemUseCase';
import { run, requireUserId } from '../helpers';

const subTaskSchema = z.object({
  typeId: z.number().int().min(1).describe('ID do tipo de subtarefa (TaskToolId)'),
  expectedDelivery: z
    .string()
    .describe('Data esperada de entrega no formato ISO 8601, ex.: 2026-12-31'),
});

export function registerTaskTools(server: McpServer, app: INestApplicationContext): void {
  const get = <T>(token: Parameters<INestApplicationContext['get']>[0]): T =>
    app.get<T>(token, { strict: false });

  server.registerTool(
    'list_task_tools',
    {
      title: 'Listar tipos de subtarefa',
      description:
        'Lista os tipos de subtarefa (task tools) disponíveis, com id e nome. Use antes de criar tarefas com subtarefas.',
      inputSchema: {},
    },
    () => run(() => get<ListTaskToolsUseCase>(ListTaskToolsUseCase).execute()),
  );

  server.registerTool(
    'create_task',
    {
      title: 'Criar tarefa',
      description:
        'Cria uma tarefa em um projeto, opcionalmente já com subtarefas. Requer MCP_USER_ID no ambiente (autor da tarefa).',
      inputSchema: {
        projectId: z.string().uuid().describe('UUID do projeto'),
        name: z.string().min(1),
        description: z.string().min(1),
        priority: z.nativeEnum(TaskPriority),
        typeId: z.number().int().min(1).describe('1 = feature, 2 = bug'),
        applicantId: z.number().int().min(1).describe('ID inteiro do setor solicitante'),
        flowIds: z.array(z.number().int().min(1)).optional(),
        subTasks: z.array(subTaskSchema).optional(),
      },
    },
    (input) =>
      run(() => {
        const userId = requireUserId();
        return get<CreateTaskUseCase>(CreateTaskUseCase).execute({
          ...input,
          creatorId: userId,
          subTasks: input.subTasks?.map((s) => ({
            ...s,
            idUser: userId,
            expectedDelivery: new Date(s.expectedDelivery),
          })),
        });
      }),
  );

  server.registerTool(
    'get_task',
    {
      title: 'Buscar tarefa',
      description: 'Busca uma tarefa por ID, com subtarefas, checklist e metadados.',
      inputSchema: { id: z.string().uuid().describe('UUID da tarefa') },
    },
    ({ id }) => run(() => get<GetTaskUseCase>(GetTaskUseCase).execute({ id })),
  );

  server.registerTool(
    'list_tasks',
    {
      title: 'Listar tarefas',
      description: 'Lista todas as tarefas, paginado.',
      inputSchema: {
        page: z.number().int().min(1).optional().describe('Página (default 1)'),
        limit: z.number().int().min(1).optional().describe('Itens por página (default 20)'),
      },
    },
    ({ page, limit }) =>
      run(() =>
        get<ListAllTasksUseCase>(ListAllTasksUseCase).execute({
          page: Number(page),
          limit: Number(limit),
        }),
      ),
  );

  server.registerTool(
    'list_tasks_by_project',
    {
      title: 'Listar tarefas por projeto',
      description: 'Lista as tarefas de um projeto.',
      inputSchema: { projectId: z.string().uuid().describe('UUID do projeto') },
    },
    ({ projectId }) =>
      run(() => get<ListTasksByProjectUseCase>(ListTasksByProjectUseCase).execute({ projectId })),
  );

  server.registerTool(
    'update_task',
    {
      title: 'Atualizar tarefa',
      description:
        'Atualiza dados da tarefa: nome, descrição, prioridade, tipo, projeto, solicitante, flows e remoção de subtarefas.',
      inputSchema: {
        id: z.string().uuid().describe('UUID da tarefa'),
        name: z.string().optional(),
        description: z.string().optional(),
        priority: z.nativeEnum(TaskPriority).optional(),
        typeId: z.number().int().min(1).optional().describe('1 = feature, 2 = bug'),
        projectId: z.string().uuid().optional(),
        applicantId: z.number().int().min(1).optional(),
        flowIdsToAdd: z.array(z.number().int().min(1)).optional(),
        flowIdsToRemove: z.array(z.number().int().min(1)).optional(),
        subTaskIdsToRemove: z.array(z.string().uuid()).optional(),
      },
    },
    (input) => run(() => get<UpdateTaskUseCase>(UpdateTaskUseCase).execute(input)),
  );

  server.registerTool(
    'change_task_status',
    {
      title: 'Alterar status da tarefa',
      description: 'Altera o status da tarefa respeitando as transições válidas do domínio.',
      inputSchema: {
        id: z.string().uuid().describe('UUID da tarefa'),
        status: z.nativeEnum(TaskStatus),
      },
    },
    ({ id, status }) =>
      run(() => get<ChangeTaskStatusUseCase>(ChangeTaskStatusUseCase).execute({ id, status })),
  );

  server.registerTool(
    'delete_task',
    {
      title: 'Remover tarefa',
      description: 'Remove uma tarefa. Falha se o estado atual não permitir remoção.',
      inputSchema: { id: z.string().uuid().describe('UUID da tarefa') },
    },
    ({ id }) => run(() => get<DeleteTaskUseCase>(DeleteTaskUseCase).execute({ id })),
  );

  server.registerTool(
    'add_subtask',
    {
      title: 'Adicionar subtarefa',
      description:
        'Adiciona uma subtarefa a uma tarefa existente. Requer MCP_USER_ID no ambiente (responsável).',
      inputSchema: {
        taskId: z.string().uuid().describe('UUID da tarefa'),
        typeId: z.number().int().min(1).describe('ID do tipo de subtarefa (TaskToolId)'),
        expectedDelivery: z.string().describe('Data esperada de entrega (ISO 8601)'),
      },
    },
    ({ taskId, typeId, expectedDelivery }) =>
      run(() =>
        get<AddSubTaskToTaskUseCase>(AddSubTaskToTaskUseCase).execute({
          taskId,
          typeId,
          idUser: requireUserId(),
          expectedDelivery: new Date(expectedDelivery),
        }),
      ),
  );

  server.registerTool(
    'change_subtask_status',
    {
      title: 'Alterar status da subtarefa',
      description:
        'Executa uma ação de status na subtarefa: start, complete, approve, reject, cancel ou reopen.',
      inputSchema: {
        taskId: z.string().uuid().describe('UUID da tarefa'),
        subTaskId: z.string().uuid().describe('UUID da subtarefa'),
        action: z.enum(['start', 'complete', 'approve', 'reject', 'cancel', 'reopen']),
        reason: z.string().optional().describe('Motivo (usado em reject/cancel)'),
      },
    },
    (input) =>
      run(() => get<ChangeSubTaskStatusUseCase>(ChangeSubTaskStatusUseCase).execute(input)),
  );

  server.registerTool(
    'update_discovery_form',
    {
      title: 'Atualizar formulário de Discovery',
      description:
        'Preenche/atualiza campos do formulário de Discovery de uma subtarefa. Requer MCP_USER_ID no ambiente.',
      inputSchema: {
        taskId: z.string().uuid().describe('UUID da tarefa'),
        subTaskId: z.string().uuid().describe('UUID da subtarefa Discovery'),
        fields: z.record(z.unknown()).describe('Mapa campo → valor do formulário'),
      },
    },
    ({ taskId, subTaskId, fields }) =>
      run(() =>
        get<UpdateDiscoveryFormUseCase>(UpdateDiscoveryFormUseCase).execute({
          taskId,
          subTaskId,
          userId: requireUserId(),
          fields: fields ?? {},
        }),
      ),
  );

  server.registerTool(
    'add_checklist_item',
    {
      title: 'Adicionar item ao checklist',
      description: 'Adiciona um item ao checklist da tarefa.',
      inputSchema: {
        taskId: z.string().uuid().describe('UUID da tarefa'),
        label: z.string().min(1),
      },
    },
    ({ taskId, label }) =>
      run(() => get<AddChecklistItemUseCase>(AddChecklistItemUseCase).execute({ taskId, label })),
  );

  server.registerTool(
    'remove_checklist_item',
    {
      title: 'Remover item do checklist',
      description: 'Remove um item do checklist da tarefa.',
      inputSchema: {
        taskId: z.string().uuid().describe('UUID da tarefa'),
        itemId: z.string().uuid().describe('UUID do item de checklist'),
      },
    },
    ({ taskId, itemId }) =>
      run(() =>
        get<RemoveChecklistItemUseCase>(RemoveChecklistItemUseCase).execute({ taskId, itemId }),
      ),
  );

  server.registerTool(
    'toggle_checklist_item',
    {
      title: 'Alternar item do checklist',
      description: 'Alterna o estado checked de um item do checklist.',
      inputSchema: {
        taskId: z.string().uuid().describe('UUID da tarefa'),
        itemId: z.string().uuid().describe('UUID do item de checklist'),
      },
    },
    ({ taskId, itemId }) =>
      run(() =>
        get<ToggleChecklistItemUseCase>(ToggleChecklistItemUseCase).execute({ taskId, itemId }),
      ),
  );

  server.registerTool(
    'reorder_checklist_item',
    {
      title: 'Reordenar item do checklist',
      description: 'Move um item do checklist para uma nova posição.',
      inputSchema: {
        taskId: z.string().uuid().describe('UUID da tarefa'),
        itemId: z.string().uuid().describe('UUID do item de checklist'),
        order: z.number().int().min(0).describe('Nova posição do item (inteiro >= 0)'),
      },
    },
    ({ taskId, itemId, order }) =>
      run(() =>
        get<ReorderChecklistItemUseCase>(ReorderChecklistItemUseCase).execute({
          taskId,
          itemId,
          order,
        }),
      ),
  );
}
