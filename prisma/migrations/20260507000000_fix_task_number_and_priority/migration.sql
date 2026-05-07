-- Add '#' prefix to taskNumber values that are missing it
UPDATE tasks SET "taskNumber" = '#' || "taskNumber"
WHERE "taskNumber" NOT LIKE '#%';

UPDATE sub_tasks SET "taskNumber" = '#' || "taskNumber"
WHERE "taskNumber" NOT LIKE '#%';

-- Normalize priority to lowercase with correct accents
UPDATE tasks SET priority = CASE LOWER(REPLACE(priority, 'é', 'e'))
  WHEN 'baixa' THEN 'baixa'
  WHEN 'media' THEN 'média'
  WHEN 'alta'  THEN 'alta'
  ELSE LOWER(priority)
END;
