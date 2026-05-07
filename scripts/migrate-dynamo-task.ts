/**
 * Migração de um registro de task do DynamoDB para o RDS.
 *
 * Uso:
 *   npx ts-node --project tsconfig.scripts.json scripts/migrate-dynamo-task.ts
 *
 * Ajuste as constantes na seção CONFIG antes de executar.
 */

import { randomUUID } from 'crypto';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const TASK_ID = '8081fc5b-c3d4-4da2-a2c5-dbec54917c42';
const TASK_NAME = 'Fluxo de Chat e Mensageria Multicamadas para o POMAR';
const TASK_NUMBER = '#20260007'; // confirme com campo seq/taskNumber do CSV
const TASK_DESCRIPTION =
  '# Issue: Implementar Fluxo de Chat e Mensageria Multicamadas para o POMAR\n\n' +
  'O Polo de Mediação e Ações Restaurativas (POMAR) necessita de uma interface de ' +
  'comunicação integrada no sistema VIA para gerenciar o contato simultâneo com as ' +
  'duas partes (Autor e Réu)...';

const PROJECT_ID = '55791d95-68d2-47b6-ba91-14f6418c815e'; // MarIA — confirme
const APPLICANT_ID = 4; // POMAR
const CREATOR_ID = '44c8d4a8-6031-7036-a916-56b1a6f4f2a6';
const TASK_PRIORITY = 'alta'; // ajuste: 'baixa' | 'media' | 'alta'
const TASK_STATUS_ID = 4; // desenvolvimento — ajuste conforme status do CSV
const TASK_CREATED_AT = new Date('2026-04-20T14:52:31.877Z');
const EXPECTED_DELIVERY = new Date('2026-04-28T03:00:00.000Z');
const FILLED_AT = '2026-04-29T19:23:49.134Z';

// ─── SUBTASK IDs ─────────────────────────────────────────────────────────────

const DISCOVERY_SUBTASK_ID = randomUUID();
const DESIGN_SUBTASK_ID = randomUUID();

// ─── METADATA ────────────────────────────────────────────────────────────────

const discoveryMetadata = {
  form: {
    projectName: {
      value:
        'Área de trabalho no VIA para o Polo de Mediação e Ações Restaurativas - POMAR',
      userId: CREATOR_ID,
      filledAt: FILLED_AT,
    },
    summary: {
      value:
        'As atividades do POMAR estão em demanda crescente e seus operadores necessitam gerenciar as atividades.',
      userId: CREATOR_ID,
      filledAt: FILLED_AT,
    },
    currentProcess: {
      value:
        'Resumo do cenário\n\n- O projeto MarIA oferece aos assistidos do autoatendimento de pensão alimentícia a possibilidade de realizar acordo extrajudicial com o genitor da criança ou adolescente;\n\n- Quando a representante legal indica a possibilidade de acordo, a equipe do NAD (Núcleo de Atendimento Digital):\n1.Analisa a documentação das partes envolvidas;\n2.Realiza a abertura de um Caso Não Processual (CNP) no sistema Verde;\n3.Encaminha o caso ao POMAR;\n\n- Ao receber a demanda, o POMAR:\n1.Abre um novo CNP no sistema Verde;\n2.Registra as informações em planilha de controle;\n3. Realiza contato com as partes por meio do sistema da Thykhe para condução dos trâmites de conciliação;\n\n- Em caso de realização de acordo:\n1.O POMAR efetua a distribuição do acordo;\n2.Informa o número do processo ao assistido e ao NAD;',
      userId: CREATOR_ID,
      filledAt: FILLED_AT,
    },
    painPoints: {
      value:
        '1-Recebe a documentação dos assistidos por e-mail;\n2- Gestão dos atendimentos realizada por meio de planilhas.\n3- Necessidade de operar múltiplos sistemas simultaneamente;\n4- Precisam lidar com diversos "sistemas", sendo que o sistema da Thykhe apresenta a limitação da janela de 24 horas, o que acaba travando o serviço. Como melhoria, sugerem a geração automática de um link para que a parte convidada possa ingressar diretamente na conciliação.\n5- Gostariam que a declaração de hipossuficiência da parte convidada fosse gerada automaticamente.\n6- Atualmente, é necessário abrir um CNP para criação de estatísticas do POMAR; avalia-se se esse processo poderia ser realizado de outra forma, mais simples e automatizada.\n7- Sugerem a inclusão de mais uma pergunta no fluxo relacionada ao tema do acordo.',
      userId: CREATOR_ID,
      filledAt: FILLED_AT,
    },
    frequency: { value: 'diario', userId: CREATOR_ID, filledAt: FILLED_AT },
    volume: {
      value:
        'Nos primeiros 15 dias do autoatendimento, cerca de 60% dos casos foram sinalizados como potenciais acordos.',
      userId: CREATOR_ID,
      filledAt: FILLED_AT,
    },
    avgTime: {
      value:
        'O POMAR possui o prazo de até 15 dias úteis para homologar o acordo ou devolver o caso ao NAD.',
      userId: CREATOR_ID,
      filledAt: FILLED_AT,
    },
    complexity: { value: 'complex', userId: CREATOR_ID, filledAt: FILLED_AT },
    humanDependency: { value: 'alta', userId: CREATOR_ID, filledAt: FILLED_AT },
    institutionalPriority: { value: 'alta', userId: CREATOR_ID, filledAt: FILLED_AT },
    inactionCost: {
      value:
        'Com a tendência de aumento da demanda, a manutenção do processo atual ensejará maior dependência de controles manuais, retrabalho operacional e aumento do tempo de resposta, comprometendo a eficiência e a qualidade do atendimento.',
      userId: CREATOR_ID,
      filledAt: FILLED_AT,
    },
    technicalOpinion: {
      value:
        'O desenvolvimento deve priorizar as seguintes funcionalidades:\n\n1. Gestão das demandas no VIA:\n- Realizar o gerenciamento das demandas diretamente no VIA, utilizando como referência os campos já definidos na planilha POMAR/NAD.\n\n2. Automatização de etapas do fluxo de trabalho...',
      userId: CREATOR_ID,
      filledAt: FILLED_AT,
    },
  },
};

const designMetadata = {
  designs: [
    {
      id: 'f3b5f7bc-7fd9-45ef-bb69-27165f9f7eba',
      title: 'Tela de atendimento POMAR',
      description:
        'A interface de atendimento do POMAR manterá a consistência visual e funcional do padrão NAD. As principais adaptações incluem a remoção do filtro \'No Pomar\', uma vez que a visão será exclusiva para dados deste setor (conforme selecionado no Navbar). A tabela será alimentada estritamente com registros originados no banco de dados do POMAR, garantindo a integridade e o foco da operação.',
      urlImage:
        'https://coilab-tasks-design.s3.us-east-1.amazonaws.com/f3b5f7bc-7fd9-45ef-bb69-27165f9f7eba-20260007.jpeg',
      userId: CREATOR_ID,
      dateUpload: FILLED_AT,
    },
    {
      id: 'd5778c27-6988-434c-9459-4d9faf86f49e',
      title: 'Envio de convites',
      description:
        'Teremos o chat do assistido autor que tem já as mensagens que já foram feitas através do WhatsApp, antes do POMAR receber o assistido. Teremos as guias entre chats que fazem parte do processo que no caso os assistidos autor e réu.\nPodemos clicar no botão que vai enviar a mensagem em um componente de alert acima. Para começar o envio da mensagem do evento.',
      urlImage:
        'https://coilab-tasks-design.s3.us-east-1.amazonaws.com/d5778c27-6988-434c-9459-4d9faf86f49e-20260007.PNG',
      userId: CREATOR_ID,
      dateUpload: FILLED_AT,
    },
    {
      id: '5e055891-0228-4790-86a4-c77d103b0ee5',
      title: 'Modal de confirmação',
      description:
        'Antes de enviar as mensagens, será aberto um modal de confirmação dos dados dos assistidos que vão receber as mensagens. Teremos os dados do usuário e o número que vai receber a mensagem. Abaixo teremos um textareas com uma mensagem default de mensagem, que pode ser alterado antes de enviar.',
      urlImage:
        'https://coilab-tasks-design.s3.us-east-1.amazonaws.com/5e055891-0228-4790-86a4-c77d103b0ee5-20260007.png',
      userId: CREATOR_ID,
      dateUpload: FILLED_AT,
    },
    {
      id: '26e3817a-8d32-4e3e-b945-116ea973a569',
      title: 'Alerta de falta de dados',
      description:
        'Podemos ter assistidos que não teremos os dados que precisa enviar a mensagem. Nesses casos, podemos editar e completar os dados ou enviar mesmo sem os dados, para pelo menos um assistido receber o mensagem.',
      urlImage:
        'https://coilab-tasks-design.s3.us-east-1.amazonaws.com/26e3817a-8d32-4e3e-b945-116ea973a569-20260007.png',
      userId: CREATOR_ID,
      dateUpload: FILLED_AT,
    },
    {
      id: '485b3f21-007e-4700-ae71-a91ed3207b4e',
      title: 'Aguardando resposta',
      description:
        'Depois do envio, a tela vai ter a mensagem de aguardo de resposta de um dos assistidos e também podemos reenviar a mensagem ou ver a mensagem que enviamos, abrindo novamente o modal com os dados do envio.',
      urlImage:
        'https://coilab-tasks-design.s3.us-east-1.amazonaws.com/485b3f21-007e-4700-ae71-a91ed3207b4e-20260007.png',
      userId: CREATOR_ID,
      dateUpload: FILLED_AT,
    },
    {
      id: 'cb042798-0c6f-468f-9209-605c42438828',
      title: 'Notificação',
      description:
        'Podemos colocar um ícone de notificação, informado que foi respondido por um dos assistidos que informa a quantidade de mensagem e também a quantidade por assistido.',
      urlImage:
        'https://coilab-tasks-design.s3.us-east-1.amazonaws.com/cb042798-0c6f-468f-9209-605c42438828-20260007.png',
      userId: CREATOR_ID,
      dateUpload: FILLED_AT,
    },
    {
      id: '0cb99bf2-a87c-4316-93fc-45a620702601',
      title: 'Assistido não contactado',
      description: 'Vamos deixar uma mensagem em caso não foi contactado o assistido.',
      urlImage:
        'https://coilab-tasks-design.s3.us-east-1.amazonaws.com/0cb99bf2-a87c-4316-93fc-45a620702601-20260007.png',
      userId: CREATOR_ID,
      dateUpload: FILLED_AT,
    },
  ],
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function run() {
  // get next subtask numbers
  const lastSubTask = await prisma.subTask.findFirst({
    orderBy: { taskNumber: 'desc' },
    select: { taskNumber: true },
  });

  const lastNum = lastSubTask?.taskNumber
    ? parseInt(lastSubTask.taskNumber.slice(5), 10)
    : 0;

  const year = new Date().getFullYear();
  const discoveryTaskNumber = `#${year}${String(lastNum + 1).padStart(4, '0')}`;
  const designTaskNumber = `#${year}${String(lastNum + 2).padStart(4, '0')}`;

  console.log('subtask numbers:', discoveryTaskNumber, designTaskNumber);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    // 1. task — upsert (task may already exist from partial migration)
    await tx.task.upsert({
      where: { id: TASK_ID },
      update: {
        name: TASK_NAME,
        taskNumber: TASK_NUMBER,
        description: TASK_DESCRIPTION,
        priority: TASK_PRIORITY,
        statusId: TASK_STATUS_ID,
      },
      create: {
        id: TASK_ID,
        name: TASK_NAME,
        taskNumber: TASK_NUMBER,
        description: TASK_DESCRIPTION,
        projectId: PROJECT_ID,
        applicantId: APPLICANT_ID,
        creatorId: CREATOR_ID,
        priority: TASK_PRIORITY,
        statusId: TASK_STATUS_ID,
        createdAt: TASK_CREATED_AT,
      },
    });

    // 2. subtask discovery
    await tx.subTask.create({
      data: {
        id: DISCOVERY_SUBTASK_ID,
        taskId: TASK_ID,
        idUser: CREATOR_ID,
        status: 'APROVADO',
        typeId: 1,
        taskNumber: discoveryTaskNumber,
        expectedDelivery: EXPECTED_DELIVERY,
        createdAt: new Date('2026-04-20T15:19:08.044Z'),
        completionDate: new Date('2026-04-29T19:23:49.134Z'),
        metadata: discoveryMetadata,
      },
    });

    // 3. subtask design
    await tx.subTask.create({
      data: {
        id: DESIGN_SUBTASK_ID,
        taskId: TASK_ID,
        idUser: CREATOR_ID,
        status: 'APROVADO',
        typeId: 2,
        taskNumber: designTaskNumber,
        expectedDelivery: EXPECTED_DELIVERY,
        createdAt: TASK_CREATED_AT,
        completionDate: new Date('2026-04-29T19:23:49.134Z'),
        metadata: designMetadata,
      },
    });
  });

  console.log('migração concluída');
  console.log('  task:              ', TASK_ID);
  console.log('  subtask discovery:', DISCOVERY_SUBTASK_ID, discoveryTaskNumber);
  console.log('  subtask design:   ', DESIGN_SUBTASK_ID, designTaskNumber);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
