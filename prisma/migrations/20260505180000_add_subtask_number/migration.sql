ALTER TABLE "sub_tasks" ADD COLUMN "taskNumber" TEXT NOT NULL DEFAULT '';
UPDATE "sub_tasks" SET "taskNumber" = CONCAT('#2026', LPAD(ROW_NUMBER() OVER (ORDER BY "createdAt")::TEXT, 4, '0'));
ALTER TABLE "sub_tasks" ALTER COLUMN "taskNumber" DROP DEFAULT;
CREATE UNIQUE INDEX "sub_tasks_taskNumber_key" ON "sub_tasks"("taskNumber");
