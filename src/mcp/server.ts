import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
// quiet: dotenv v17 logs to stdout by default, which corrupts the stdio JSON-RPC stream
loadEnv({ quiet: true });

import { NestFactory } from '@nestjs/core';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { AppModule } from '../app.module';
import { registerTaskTools } from './tools/task.tools';
import { registerProjectTools } from './tools/project.tools';

async function main(): Promise<void> {
  // logger: false — Nest logs go to stdout and would corrupt the stdio transport
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

  const server = new McpServer({ name: 'coilab', version: '1.0.0' });
  registerTaskTools(server, app);
  registerProjectTools(server, app);

  await server.connect(new StdioServerTransport());
  process.stderr.write('CoiLab MCP server rodando (stdio)\n');
}

main().catch((err) => {
  process.stderr.write(
    `Falha ao iniciar o MCP server: ${err instanceof Error ? err.stack : err}\n`,
  );
  process.exit(1);
});
