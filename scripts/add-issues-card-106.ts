/**
 * One-off: registra as 5 issues do card #20260106 (MarIA — Conversas e
 * Assistidos) na subtarefa de Desenvolvimento, via AddIssueToSubTaskUseCase +
 * UpdateIssueInSubTaskUseCase (mesmas regras da API). Todas já concluídas no
 * GitHub — cria e marca status=true.
 *
 * Rodar: npx tsx scripts/add-issues-card-106.ts
 */
import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
loadEnv({ quiet: true });

const TASK_ID = 'e5bdffe4-88a3-4ae0-9f24-56d259387ffa'; // card #20260106
const SUBTASK_DEV = '4019eb9a-a0e2-4315-8919-24e310196aa7'; // typeId 4
const FLOW_INTERNO = 3;
const SPRINT = '1';

const ISSUES = [
  {
    title: '[TECH] back#30 — Schemas de resposta no openapi.yaml (conversas/assistidos/analytics/audit)',
    body: 'https://github.com/icaroeduardo-lab/maria-ia/issues/30 — entregue no PR maria-ia#33',
  },
  {
    title: '[BUG] back#31 — Lista de conversas expunha PII sem máscara',
    body: 'https://github.com/icaroeduardo-lab/maria-ia/issues/31 — entregue no PR maria-ia#32 (LGPD: select enxuto + teste de regressão)',
  },
  {
    title: '[FEATURE] front#50 — Página de conversas (filtros + paginação)',
    body: 'https://github.com/icaroeduardo-lab/maria-ia-front-end/issues/50 — pagina-conversas.tsx',
  },
  {
    title: '[FEATURE] front#51 — Detalhe da conversa (content blocks + revelar auditado)',
    body: 'https://github.com/icaroeduardo-lab/maria-ia-front-end/issues/51 — pagina-conversa-detalhe.tsx',
  },
  {
    title: '[FEATURE] front#52 — Página de assistidos (CRUD com máscara)',
    body: 'https://github.com/icaroeduardo-lab/maria-ia-front-end/issues/52 — pagina-assistidos.tsx',
  },
];

async function main() {
  const { NestFactory } = await import('@nestjs/core');
  const { AppModule } = await import('../src/app.module');
  const { AddIssueToSubTaskUseCase } = await import(
    '../src/application/use-cases/task/add-issue-to-subtask/AddIssueToSubTaskUseCase'
  );
  const { UpdateIssueInSubTaskUseCase } = await import(
    '../src/application/use-cases/task/update-issue-in-subtask/UpdateIssueInSubTaskUseCase'
  );

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const add = app.get(AddIssueToSubTaskUseCase);
  const update = app.get(UpdateIssueInSubTaskUseCase);
  const { GetTaskUseCase } = await import('../src/application/use-cases/task/get-task/GetTaskUseCase');
  const get = app.get(GetTaskUseCase);

  // idempotente: não recriar títulos que já existem na subtarefa
  const task = (await get.execute({ id: TASK_ID })) as any;
  const sub = (task.subTasks ?? []).find((s: any) => s.id === SUBTASK_DEV);
  const existentes: any[] = sub?.metadata?.issues ?? [];

  for (const i of ISSUES) {
    let issue = existentes.find((e) => e.title === i.title);
    if (!issue) {
      const { id } = await add.execute({
        taskId: TASK_ID,
        subTaskId: SUBTASK_DEV,
        title: i.title,
        body: i.body,
        flowId: FLOW_INTERNO,
        sprint: SPRINT,
      });
      issue = { id };
    }
    await update.execute({
      taskId: TASK_ID,
      subTaskId: SUBTASK_DEV,
      issueId: issue.id,
      sprint: SPRINT,
      status: true,
    });
    console.log('ok (concluída):', i.title.slice(0, 60));
  }
  await app.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
