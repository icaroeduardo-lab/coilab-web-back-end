CREATE TABLE "sub_tasks_status" (
  "id"   SERIAL      PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO "sub_tasks_status" (id, name) VALUES
  (1, 'não iniciada'),
  (2, 'em execução'),
  (3, 'aguardando checkout'),
  (4, 'cancelada'),
  (5, 'aprovada'),
  (6, 'reprovada');

SELECT setval('"sub_tasks_status_id_seq"', 6);

ALTER TABLE "sub_tasks" ADD COLUMN "statusId" INTEGER;

UPDATE "sub_tasks" SET "statusId" = CASE status
  WHEN 'NAO_INICIADO'        THEN 1
  WHEN 'EM_PROGRESSO'        THEN 2
  WHEN 'AGUARDANDO_CHECKOUT' THEN 3
  WHEN 'CANCELADO'           THEN 4
  WHEN 'APROVADO'            THEN 5
  WHEN 'REPROVADO'           THEN 6
END;

ALTER TABLE "sub_tasks" ALTER COLUMN "statusId" SET NOT NULL;
ALTER TABLE "sub_tasks"
  ADD CONSTRAINT "sub_tasks_statusId_fkey"
  FOREIGN KEY ("statusId") REFERENCES "sub_tasks_status"("id");

ALTER TABLE "sub_tasks" DROP COLUMN "status";

ALTER TABLE "sub_tasks" ADD CONSTRAINT "sub_tasks_reason_check"
  CHECK (
    CASE
      WHEN "statusId" IN (4, 6) THEN "reason" IS NOT NULL
      WHEN "statusId" = 5       THEN TRUE
      ELSE                           "reason" IS NULL
    END
  );
