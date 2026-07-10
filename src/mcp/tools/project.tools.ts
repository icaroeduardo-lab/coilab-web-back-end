import { z } from 'zod';
import type { INestApplicationContext } from '@nestjs/common';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ProjectStatus } from '../../domain/entities/project.entity';
import { CreateProjectUseCase } from '../../application/use-cases/project/create-project/CreateProjectUseCase';
import { GetProjectUseCase } from '../../application/use-cases/project/get-project/GetProjectUseCase';
import { ListProjectsUseCase } from '../../application/use-cases/project/list-projects/ListProjectsUseCase';
import { UpdateProjectUseCase } from '../../application/use-cases/project/update-project/UpdateProjectUseCase';
import { ChangeProjectStatusUseCase } from '../../application/use-cases/project/change-project-status/ChangeProjectStatusUseCase';
import { run } from '../helpers';

const canvasSchema = z
  .object({
    problem: z.string().optional(),
    target: z.array(z.string()).optional(),
    objective: z.array(z.string()).optional(),
    impact: z
      .object({
        description: z.string().optional(),
        labels: z.array(z.string()).optional(),
      })
      .optional(),
    parts: z
      .array(z.object({ name: z.string().optional(), role: z.string().optional() }))
      .optional(),
    resources: z
      .array(z.object({ type: z.string().optional(), description: z.array(z.string()).optional() }))
      .optional(),
    risksAndMitigations: z
      .array(z.object({ risk: z.string().optional(), mitigation: z.string().optional() }))
      .optional(),
  })
  .passthrough()
  .describe('Canvas do projeto (problema, público, objetivos, impacto, partes, recursos, riscos)');

export function registerProjectTools(server: McpServer, app: INestApplicationContext): void {
  const get = <T>(token: Parameters<INestApplicationContext['get']>[0]): T =>
    app.get<T>(token, { strict: false });

  server.registerTool(
    'create_project',
    {
      title: 'Criar projeto',
      description: 'Cria um projeto com nome, descrição e canvas opcional.',
      inputSchema: {
        name: z.string().min(1),
        description: z.string().min(1),
        canvas: canvasSchema.optional(),
      },
    },
    (input) => run(() => get<CreateProjectUseCase>(CreateProjectUseCase).execute(input)),
  );

  server.registerTool(
    'get_project',
    {
      title: 'Buscar projeto',
      description: 'Busca um projeto por ID.',
      inputSchema: { id: z.string().uuid().describe('UUID do projeto') },
    },
    ({ id }) => run(() => get<GetProjectUseCase>(GetProjectUseCase).execute({ id })),
  );

  server.registerTool(
    'list_projects',
    {
      title: 'Listar projetos',
      description: 'Lista projetos, paginado.',
      inputSchema: {
        page: z.number().int().min(1).optional().describe('Página (default 1)'),
        limit: z.number().int().min(1).optional().describe('Itens por página (default 20)'),
      },
    },
    ({ page, limit }) =>
      run(() =>
        get<ListProjectsUseCase>(ListProjectsUseCase).execute({
          page: Number(page),
          limit: Number(limit),
        }),
      ),
  );

  server.registerTool(
    'update_project',
    {
      title: 'Atualizar projeto',
      description: 'Atualiza nome, descrição e/ou canvas do projeto.',
      inputSchema: {
        id: z.string().uuid().describe('UUID do projeto'),
        name: z.string().optional(),
        description: z.string().optional(),
        canvas: canvasSchema.optional(),
      },
    },
    (input) => run(() => get<UpdateProjectUseCase>(UpdateProjectUseCase).execute(input)),
  );

  server.registerTool(
    'change_project_status',
    {
      title: 'Alterar status do projeto',
      description: 'Altera o status do projeto respeitando as transições válidas do domínio.',
      inputSchema: {
        id: z.string().uuid().describe('UUID do projeto'),
        status: z.nativeEnum(ProjectStatus),
      },
    },
    ({ id, status }) =>
      run(() =>
        get<ChangeProjectStatusUseCase>(ChangeProjectStatusUseCase).execute({ id, status }),
      ),
  );
}
