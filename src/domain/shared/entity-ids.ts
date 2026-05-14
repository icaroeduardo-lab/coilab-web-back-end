const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function createId<T>(brand: string, value: string): T {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`Invalid ${brand}: "${value}" is not a valid UUID`);
  }
  return value as unknown as T;
}

export type ProjectId = string & { readonly __type: 'ProjectId' };
export type TaskId = string & { readonly __type: 'TaskId' };
export type SubTaskId = string & { readonly __type: 'SubTaskId' };
export type ApplicantId = number & { readonly __type: 'ApplicantId' };
export type UserId = string & { readonly __type: 'UserId' };
export type FlowId = number & { readonly __type: 'FlowId' };
export type DesignId = string & { readonly __type: 'DesignId' };
export type TaskToolId = number & { readonly __type: 'TaskToolId' };

export const ProjectId = (value: string): ProjectId => createId<ProjectId>('ProjectId', value);
export const TaskId = (value: string): TaskId => createId<TaskId>('TaskId', value);
export const SubTaskId = (value: string): SubTaskId => createId<SubTaskId>('SubTaskId', value);
export const ApplicantId = (value: number): ApplicantId => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid ApplicantId: "${value}" is not a valid positive integer`);
  }
  return value as ApplicantId;
};
export const UserId = (value: string): UserId => createId<UserId>('UserId', value);
export const FlowId = (value: number): FlowId => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid FlowId: "${value}" is not a valid positive integer`);
  }
  return value as FlowId;
};
export const DesignId = (value: string): DesignId => createId<DesignId>('DesignId', value);
export const TaskToolId = (value: number): TaskToolId => {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid TaskToolId: "${value}" is not a valid positive integer`);
  }
  return value as TaskToolId;
};
