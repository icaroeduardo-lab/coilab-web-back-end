# Servidor MCP

Servidor [MCP](https://modelcontextprotocol.io) via stdio que expõe os use cases de **tarefas** e **projetos** para clientes LLM (Claude Code, Claude Desktop, etc.). Não passa pela API HTTP: cria um application context do NestJS e chama os use cases diretamente, reutilizando as regras de domínio e indo ao banco via Prisma.

## Execução

```bash
npm run mcp
```

O `.mcp.json` na raiz já registra o servidor para o Claude Code. Para outros clientes, aponte o comando acima como servidor stdio, com o diretório do projeto como cwd.

## Requisitos

- `.env` com `DATABASE_URL` válido (o servidor carrega o `.env` sozinho, em modo quiet para não sujar o stdout do protocolo).
- Banco acessível.
- `MCP_USER_ID` (opcional): Cognito `sub` do usuário que assina as ações. Obrigatório apenas para os tools que registram autoria: `create_task`, `add_subtask` e `update_discovery_form`. Como o transporte é stdio, não há JWT — essa variável substitui o `user.sub` que os controllers extraem do token.

## Tools

Tarefas: `list_task_tools`, `create_task`, `get_task`, `list_tasks`, `list_tasks_by_project`, `update_task`, `change_task_status`, `delete_task`, `add_subtask`, `change_subtask_status`, `update_discovery_form`, `add_checklist_item`, `remove_checklist_item`, `toggle_checklist_item`, `reorder_checklist_item`.

Projetos: `create_project`, `get_project`, `list_projects`, `update_project`, `change_project_status`.

Fora do escopo (dependem de S3/GitHub e identidade rica do JWT): designs, issues de desenvolvimento, upload de documentos, complete/cancel de subtarefa de dev. Erros de domínio voltam como resultado de tool com `isError: true` e a mensagem da exceção.

## Estrutura

```
src/mcp/
├── server.ts            # bootstrap do Nest context + transporte stdio
├── helpers.ts           # serialização de resultado, erros, MCP_USER_ID
└── tools/
    ├── task.tools.ts    # tools de tarefa/subtarefa/checklist
    └── project.tools.ts # tools de projeto
```

Logs vão para stderr; stdout é reservado ao JSON-RPC do protocolo.
