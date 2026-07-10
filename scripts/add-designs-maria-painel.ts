/**
 * One-off: registra os wireframes do Painel Admin MarIA nas subtarefas de
 * Design (cards #20260101–#20260108) via AddDesignToSubTaskUseCase — o MESMO
 * use case da rota POST /tasks/:taskId/subtasks/:subTaskId/designs, então
 * respeita as regras de negócio (task editável, subtask existente, metadata).
 * Assina com o usuário do MCP_USER_ID (igual às demais ações do MCP).
 *
 * Rodar: npx tsx scripts/add-designs-maria-painel.ts
 */
import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
loadEnv({ quiet: true });

const BASE = 'https://coilab-tasks-design-dev.s3.us-east-1.amazonaws.com';

const DESIGNS = [
  {
    taskId: '6bb27e0f-d731-41c0-ad19-5d89e3a2ecfe',
    subTaskId: '82596169-9f35-4c38-8498-b733bf0d12fd',
    title: 'Wireframe — Layout geral + navegação',
    description:
      'Estrutura persistente do painel: nav lateral fixa (Fluxos/Conversas/Assistidos/Config/Dashboard), badge de ambiente (painel fala com PRODUÇÃO) e área de conteúdo. Sem tela de login (token por env).',
    urlImage: `${BASE}/20260101/5f097ec3-63e2-4216-a7b4-16eeb269a221.png`,
  },
  {
    taskId: 'f8f250b2-9c28-4f35-b00f-08889e1bcd1c',
    subTaskId: 'e61352ae-96fc-43fc-94b2-a6f0ce7c05f5',
    title: 'Wireframe — Lista de Fluxos',
    description:
      'Tabela de fluxos (GET /admin/flows): nome, badge ATIVO (só um por vez), atualizado em, ações por linha (builder/testar/histórico). Botão "+ novo fluxo". Ativar exige confirmação com resultado do /validar — troca produção em runtime.',
    urlImage: `${BASE}/20260102/0823f7a4-a4ec-4282-ae62-b9ac30fc0193.png`,
  },
  {
    taskId: '962ca912-c77b-4a89-8dbd-5f422a308d13',
    subTaskId: '5010325a-8c80-4c07-8876-42fd6b61766d',
    title: 'Wireframe — Builder visual (canvas)',
    description:
      'Três zonas: paleta com os 9 tipos de nó, canvas React Flow (ids estáveis, position preservado, edges com label — sim/não sugere true/false), painel de propriedades por tipo (autocomplete {{chave}}, semReescrita, upload de imagem). Barra: validar/testar/histórico/salvar (lock otimista, 409 = recarregue). Barra inferior de validação destaca nós com problema.',
    urlImage: `${BASE}/20260103/ad3b8c23-446d-4943-8e27-86d06f1235f3.png`,
  },
  {
    taskId: '8f90401d-557e-4547-a5c0-ab8f86c833ff',
    subTaskId: '4092155b-d3a3-4325-8c0f-bc09fd3be649',
    title: 'Wireframe — Chat de teste (drawer)',
    description:
      'Drawer sobre o builder: conversa multi-turn real via POST /admin/test-chat (1ª chamada sem message; reiniciar = novo sessionId). Renderiza os 5 content blocks (boolean responde pelo id true/false; options pelo texto). Painel de debug com dadosColetados ao vivo + indicador done; flow inválido → 422.',
    urlImage: `${BASE}/20260104/d8eb4d01-316c-4579-89c3-9b302c0af564.png`,
  },
  {
    taskId: 'c2518ea1-b398-46f5-8963-7491408759b8',
    subTaskId: '74c4cf4b-3b55-47ef-9849-e8d31f2e10a2',
    title: 'Wireframe — Histórico de versões + restaurar',
    description:
      'Painel lateral no builder: lista de versões (autor + data, GET /versoes), preview read-only no canvas com banner (GET /versoes/{n}) e restaurar (POST /restaurar) com confirmação reforçada em fluxo ATIVO — operação reversível (estado atual vira versão antes).',
    urlImage: `${BASE}/20260105/04e3191f-29dc-46cd-a4e6-56f5c5d35678.png`,
  },
  {
    taskId: 'e5bdffe4-88a3-4ae0-9f24-56d259387ffa',
    subTaskId: '8df2f6be-0330-4129-92ed-a33e91e7beeb',
    title: 'Wireframe — Conversas & Assistidos (PII protegida)',
    description:
      'Lista com filtros (status/categoria/canal, 50/pág) → detalhe em duas colunas: transcrição (content blocks) + dados do assistido SEMPRE mascarados (LGPD). Botão "revelar dados" destacado como ação auditada (POST /revelar) — nunca automático. Mesmo padrão vale pra tela de Assistidos.',
    urlImage: `${BASE}/20260106/3db1b7dd-2c81-41c6-9331-db558ad8371c.png`,
  },
  {
    taskId: '2d02e057-57a2-4da7-9d83-8c0107eb1865',
    subTaskId: '906c8c05-c991-4629-8e15-29f68b93dcca',
    title: 'Wireframe — Configurações da IA',
    description:
      'Tela simples: textarea do estiloPrompt (com "restaurar padrão"), toggle conversacional e aviso obrigatório de que salvar regenera o cache de reescrita (custo pontual de IA). GET/PUT /admin/config. O upload de imagem deste card vive dentro do builder (campo imagem dos nós).',
    urlImage: `${BASE}/20260107/a381d14e-5a75-4a18-90c2-5a52d7103fd4.png`,
  },
  {
    taskId: 'fbe14157-1446-450c-8584-5747ff6b1331',
    subTaskId: 'f0a8d13a-d3aa-4df8-9778-88df35cb19ee',
    title: 'Wireframe — Dashboard & Auditoria',
    description:
      '4 tiles de resumo + gráfico de conversas por dia + por categoria (GET /admin/analytics/summary, sem over-engineering) e a trilha de auditoria LGPD paginada (GET /admin/audit): quem revelou PII de quem, quando.',
    urlImage: `${BASE}/20260108/4faf5348-5862-4d79-8af6-694cc964a3cb.png`,
  },
];

async function main() {
  // dynamic imports DEPOIS do loadEnv (prisma.client lê DATABASE_URL no import)
  const { NestFactory } = await import('@nestjs/core');
  const { prisma } = await import('../src/infra/db/prisma/prisma.client');
  const { AppModule } = await import('../src/app.module');
  const { AddDesignToSubTaskUseCase } = await import(
    '../src/application/use-cases/task/add-design-to-subtask/AddDesignToSubTaskUseCase'
  );

  const userId = process.env.MCP_USER_ID;
  if (!userId) throw new Error('MCP_USER_ID não definido no .env');

  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) throw new Error(`usuário ${userId} não encontrado`);
  const user = { id: u.id, name: u.name, avatar: u.imageUrl ?? undefined };

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const useCase = app.get(AddDesignToSubTaskUseCase);

  for (const d of DESIGNS) {
    const { id } = await useCase.execute({ ...d, user });
    console.log(`ok ${d.title} → design ${id}`);
  }
  await app.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
