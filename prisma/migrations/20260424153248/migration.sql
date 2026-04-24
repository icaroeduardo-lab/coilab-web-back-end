-- CreateIndex
CREATE INDEX "sub_tasks_taskId_idx" ON "sub_tasks"("taskId");

-- CreateIndex
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "tasks_applicantId_idx" ON "tasks"("applicantId");

-- CreateIndex
CREATE INDEX "tasks_creatorId_idx" ON "tasks"("creatorId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
