-- Seed task_tools with default types
INSERT INTO task_tools (name) VALUES ('Discovery'), ('Design'), ('Diagram');

-- Add typeId FK and metadata, drop old columns
ALTER TABLE sub_tasks ADD COLUMN "typeId" INT REFERENCES task_tools(id);
ALTER TABLE sub_tasks ADD COLUMN metadata JSONB;
ALTER TABLE sub_tasks ALTER COLUMN "typeId" SET NOT NULL;
ALTER TABLE sub_tasks DROP COLUMN type;
ALTER TABLE sub_tasks DROP COLUMN "discoveryForm";
ALTER TABLE sub_tasks DROP COLUMN designs;
ALTER TABLE sub_tasks DROP COLUMN diagrams;
