# Instalar o MCP do Coilab em outra máquina

Guia pra rodar o servidor MCP (ver [mcp.md](./mcp.md)) num PC novo e plugar no
Claude Code. O servidor é **stdio local**: roda deste repo e fala direto com o
banco (RDS na AWS) — nada é preso a uma máquina específica.

## Pré-requisitos

- **Node.js 20+** (testado com 24)
- **Git** com acesso ao repo `github.com/icaroeduardo-lab/coilab-web-back-end`
- **Claude Code** instalado
- IP da máquina **liberado no security group do RDS** (porta 5432) — este é o
  portão de verdade: sem essa regra de inbound, nada conecta

## Passo a passo

### 1. Clonar e instalar

```bash
git clone git@github.com:icaroeduardo-lab/coilab-web-back-end.git
cd coilab-web-back-end
npm install
```

### 2. Configurar o `.env`

O `.env` **não está no git** — copiar de uma máquina já configurada por canal
seguro (nunca commitar, nunca mandar por chat/e-mail em texto puro).

Mínimo pro MCP funcionar:

| Variável | Pra quê |
|---|---|
| `DATABASE_URL` | Postgres (RDS) — obrigatório |
| `MCP_USER_ID` | Cognito `sub` que assina `create_task`/`add_subtask`/`update_discovery_form` |

As demais (`AWS_*`, `BUCKET_*`, `REPO_*`, `COGNITO_*`, `WEBHOOK_SECRET`) só
importam pros scripts auxiliares (designs no S3, issues de desenvolvimento) e
pra API HTTP — o MCP em si não usa.

### 3. Testar o servidor solto

```bash
npm run mcp
```

Deve subir sem erro e ficar aguardando no stdin (Ctrl+C pra sair). Erro de
conexão aqui = `DATABASE_URL` errado ou IP não liberado no security group.

### 4. Registrar no Claude Code

```bash
claude mcp add coilab --scope user -- npm run --prefix /caminho/absoluto/para/coilab-web-back-end --silent mcp
```

Ou editar o `~/.claude.json` direto:

```json
"mcpServers": {
  "coilab": {
    "type": "stdio",
    "command": "npm",
    "args": ["run", "--prefix", "/caminho/absoluto/para/coilab-web-back-end", "--silent", "mcp"],
    "env": {}
  }
}
```

> Alternativa: o `.mcp.json` na raiz do repo já registra o servidor quando a
> sessão do Claude Code é aberta DENTRO deste repo. O registro global acima é
> pra usar o MCP de qualquer diretório (ex: workspace de outro projeto).

### 5. Verificar

Abrir uma sessão nova do Claude Code e pedir: "liste os projetos do coilab".
Se o tool `list_projects` responder, está instalado.

## Armadilhas conhecidas

1. **Path absoluto no registro** — o `--prefix` tem que apontar pro clone da
   máquina nova. Se o repo mudar de pasta depois, atualizar o `~/.claude.json`
   (o sintoma é o MCP falhar só na próxima reinicialização da sessão).
2. **Security group do RDS** — liberar o IP público da máquina nova (regra
   inbound, porta 5432). IP residencial muda: se o MCP parar de conectar do
   nada, conferir isso primeiro.
3. **stdout é sagrado** — o protocolo MCP usa stdout; qualquer `console.log`
   em código carregado pelo servidor quebra o handshake (logs vão pra stderr).
4. **Tools fora do MCP** — designs e issues de desenvolvimento não têm tool
   (dependem de S3/GitHub e identidade rica); são feitos por scripts em
   `scripts/` rodados de dentro do repo (`npx tsx scripts/<nome>.ts`), que aí
   sim precisam das variáveis de AWS no `.env`.
