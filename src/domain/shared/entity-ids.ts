import { isUUID } from 'class-validator';

function createId<T>(brand: string, value: string): T {
  if (!isUUID(value)) {
    throw new Error(`Invalid ${brand}: "${value}" is not a valid UUID`);
  }
  return value as unknown as T;
}

export type ProjectId = string & { readonly __type: 'ProjectId' };
export type TaskId = string & { readonly __type: 'TaskId' };
export type SubTaskId = string & { readonly __type: 'SubTaskId' };
export type ApplicantId = string & { readonly __type: 'ApplicantId' };
export type FlowId = string & { readonly __type: 'FlowId' };
export type DesignId = string & { readonly __type: 'DesignId' };

export const ProjectId = (value: string): ProjectId => createId<ProjectId>('ProjectId', value);
export const TaskId = (value: string): TaskId => createId<TaskId>('TaskId', value);
export const SubTaskId = (value: string): SubTaskId => createId<SubTaskId>('SubTaskId', value);
export const ApplicantId = (value: string): ApplicantId =>
  createId<ApplicantId>('ApplicantId', value);
export const FlowId = (value: string): FlowId => createId<FlowId>('FlowId', value);
export const DesignId = (value: string): DesignId => createId<DesignId>('DesignId', value);
