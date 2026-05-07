-- Convert applicants.id and flows.id from UUID to SERIAL INT
-- Convert tasks.applicantId and task_flows.flowId from UUID to INT
-- Create task_status lookup and migrate tasks.status (TEXT) → tasks.statusId (INT FK)

-- 1. Drop FK constraints referencing applicants and flows
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_applicantId_fkey";
ALTER TABLE "task_flows" DROP CONSTRAINT IF EXISTS "task_flows_flowId_fkey";
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_statusId_fkey";

-- 2. Migrate task_flows.flowId UUID → INT (drop composite PK, swap column, recreate PK)
ALTER TABLE "task_flows" DROP CONSTRAINT IF EXISTS "task_flows_pkey";
ALTER TABLE "task_flows" DROP COLUMN IF EXISTS "flowId";
ALTER TABLE "task_flows" ADD COLUMN "flowId" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "task_flows" ALTER COLUMN "flowId" DROP DEFAULT;
ALTER TABLE "task_flows" ADD CONSTRAINT "task_flows_pkey" PRIMARY KEY ("taskId", "flowId");

-- 3. Migrate tasks.applicantId UUID → INT
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "applicantId";
ALTER TABLE "tasks" ADD COLUMN "applicantId" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "tasks" ALTER COLUMN "applicantId" DROP DEFAULT;

-- 4. Recreate applicants with SERIAL id
DROP TABLE IF EXISTS "applicants" CASCADE;
CREATE TABLE "applicants" (
    "id"   SERIAL NOT NULL,
    "name" TEXT   NOT NULL,
    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- 5. Recreate flows with SERIAL id
DROP TABLE IF EXISTS "flows" CASCADE;
CREATE TABLE "flows" (
    "id"   SERIAL NOT NULL,
    "name" TEXT   NOT NULL,
    CONSTRAINT "flows_pkey" PRIMARY KEY ("id")
);

-- 6. Create task_status lookup table
CREATE TABLE IF NOT EXISTS "task_status" (
    "id"   SERIAL       NOT NULL,
    "name" VARCHAR(50)  NOT NULL,
    CONSTRAINT "task_status_pkey"     PRIMARY KEY ("id"),
    CONSTRAINT "task_status_name_key" UNIQUE ("name")
);

INSERT INTO "task_status" (id, name) VALUES
  (1, 'Backlog'),
  (2, 'Em Execução'),
  (3, 'Checkout'),
  (4, 'Desenvolvimento'),
  (5, 'Testes'),
  (6, 'Concluído')
ON CONFLICT DO NOTHING;

SELECT setval('"task_status_id_seq"', 6);

-- 7. Migrate tasks.status TEXT → tasks.statusId INT
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "statusId" INTEGER;

UPDATE "tasks"
SET "statusId" = CASE "status"
  WHEN 'Backlog'         THEN 1
  WHEN 'Em Execução'     THEN 2
  WHEN 'Checkout'        THEN 3
  WHEN 'Desenvolvimento' THEN 4
  WHEN 'Testes'          THEN 5
  WHEN 'Concluído'       THEN 6
  ELSE 1
END
WHERE "statusId" IS NULL;

ALTER TABLE "tasks" ALTER COLUMN "statusId" SET NOT NULL;
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "status";

-- 8. Re-add FK constraints
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_applicantId_fkey"
  FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_statusId_fkey"
  FOREIGN KEY ("statusId") REFERENCES "task_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "task_flows" ADD CONSTRAINT "task_flows_flowId_fkey"
  FOREIGN KEY ("flowId") REFERENCES "flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
