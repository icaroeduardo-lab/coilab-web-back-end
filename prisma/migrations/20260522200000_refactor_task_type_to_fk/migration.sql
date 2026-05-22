-- CreateTable task_types
CREATE TABLE "task_types" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "task_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_types_name_key" ON "task_types"("name");

-- Seed task types
INSERT INTO "task_types" ("id", "name") VALUES (1, 'feature'), (2, 'bug');

-- AddColumn typeId with default 1
ALTER TABLE "tasks" ADD COLUMN "typeId" INTEGER NOT NULL DEFAULT 1;

-- Migrate existing data from type string to typeId
UPDATE "tasks" SET "typeId" = CASE
    WHEN "type" = 'bug' THEN 2
    ELSE 1
END;

-- DropColumn type
ALTER TABLE "tasks" DROP COLUMN "type";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "task_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
