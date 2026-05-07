ALTER TABLE "sub_tasks" ADD COLUMN "taskNumber" TEXT NOT NULL DEFAULT '';
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn
  FROM "sub_tasks"
)
UPDATE "sub_tasks"
SET "taskNumber" = CONCAT('#2026', LPAD(numbered.rn::TEXT, 4, '0'))
FROM numbered
WHERE "sub_tasks".id = numbered.id;
ALTER TABLE "sub_tasks" ALTER COLUMN "taskNumber" DROP DEFAULT;
CREATE UNIQUE INDEX "sub_tasks_taskNumber_key" ON "sub_tasks"("taskNumber");
