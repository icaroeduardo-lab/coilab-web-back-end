/**
 * Migra designs em sub_tasks do formato antigo { userId } para { user: { id, name, avatar } }.
 *
 * Uso:
 *   DATABASE_URL=... npx ts-node --project tsconfig.scripts.json scripts/migrate-design-metadata.ts
 *
 * Flags:
 *   --dry-run   Exibe o que seria alterado sem gravar no banco (padrão: dry-run)
 *   --commit    Grava as alterações no banco
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const DRY_RUN = !process.argv.includes('--commit');

const isLocal = (process.env.DATABASE_URL ?? '').includes('localhost');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface LegacyDesign {
  id: string;
  title: string;
  description: string;
  urlImage: string;
  userId: string;
  dateUpload: string;
}

interface NewDesign {
  id: string;
  title: string;
  description: string;
  urlImage: string;
  user: { id: string; name: string; avatar?: string };
  dateUpload: string;
}

async function main() {
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN (sem gravação)' : 'COMMIT'}\n`);

  const subTasks = await prisma.subTask.findMany();

  const affected = subTasks.filter((st) => {
    const designs = (st.metadata as Record<string, unknown>)?.designs;
    return (
      Array.isArray(designs) &&
      designs.some((d: unknown) => typeof (d as LegacyDesign).userId === 'string')
    );
  });

  console.log(`Sub-tasks com designs no formato antigo: ${affected.length}`);
  if (affected.length === 0) {
    console.log('Nada a migrar.');
    return;
  }

  // Coleta todos os userIds únicos para buscar de uma vez
  const userIds = new Set<string>();
  for (const st of affected) {
    const designs = ((st.metadata as Record<string, unknown>).designs ?? []) as LegacyDesign[];
    for (const d of designs) {
      if (d.userId) userIds.add(d.userId);
    }
  }

  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } },
    select: { id: true, name: true, imageUrl: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const missing = [...userIds].filter((id) => !userMap.has(id));
  if (missing.length > 0) {
    console.warn(`\nAVISO: ${missing.length} userId(s) sem registro na tabela users:`);
    missing.forEach((id) => console.warn(`  - ${id}`));
    console.warn('Esses designs terão user.name = "(usuário removido)"\n');
  }

  let updated = 0;
  for (const st of affected) {
    const oldDesigns = ((st.metadata as Record<string, unknown>).designs ?? []) as (
      | LegacyDesign
      | NewDesign
    )[];

    const newDesigns: NewDesign[] = oldDesigns.map((d) => {
      if ('user' in d && d.user) return d as NewDesign;

      const legacy = d as LegacyDesign;
      const found = userMap.get(legacy.userId);
      return {
        id: legacy.id,
        title: legacy.title,
        description: legacy.description,
        urlImage: legacy.urlImage,
        user: {
          id: legacy.userId,
          name: found?.name ?? '(usuário removido)',
          avatar: found?.imageUrl ?? undefined,
        },
        dateUpload: legacy.dateUpload,
      };
    });

    const newMetadata = {
      ...(st.metadata as Record<string, unknown>),
      designs: newDesigns,
    };

    console.log(`SubTask ${st.id}: ${oldDesigns.length} design(s) a migrar`);

    if (!DRY_RUN) {
      await prisma.subTask.update({
        where: { id: st.id },
        data: { metadata: newMetadata as object },
      });
      updated++;
    }
  }

  console.log(
    DRY_RUN
      ? `\n[DRY-RUN] ${affected.length} sub-tasks seriam atualizadas. Rode com --commit para gravar.`
      : `\n${updated} sub-tasks atualizadas com sucesso.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
