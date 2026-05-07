-- Add '#' prefix to projectNumber values that are missing it
UPDATE projects SET "projectNumber" = '#' || "projectNumber"
WHERE "projectNumber" NOT LIKE '#%';

-- Normalize project status to new enum values
UPDATE projects SET status = CASE LOWER(status)
  WHEN 'ativo'       THEN 'em execução'
  WHEN 'backlog'     THEN 'backlog'
  WHEN 'concluído'   THEN 'concluído'
  WHEN 'cancelado'   THEN 'cancelado'
  ELSE 'backlog'
END;
