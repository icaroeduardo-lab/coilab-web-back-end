import { ProjectId, TaskId, SubTaskId, ApplicantId, FlowId, DesignId } from './entity-ids';

describe('Typed Entity IDs', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  it.each([
    ['ProjectId', ProjectId],
    ['TaskId', TaskId],
    ['SubTaskId', SubTaskId],
    ['ApplicantId', ApplicantId],
    ['FlowId', FlowId],
    ['DesignId', DesignId],
  ] as const)('%s accepts valid UUID', (_, factory) => {
    expect(() => factory(validUuid)).not.toThrow();
    expect(factory(validUuid)).toBe(validUuid);
  });

  it.each([
    ['ProjectId', ProjectId],
    ['TaskId', TaskId],
    ['SubTaskId', SubTaskId],
    ['ApplicantId', ApplicantId],
    ['FlowId', FlowId],
    ['DesignId', DesignId],
  ] as const)('%s throws on invalid UUID', (name, factory) => {
    expect(() => factory('not-a-uuid')).toThrow(
      `Invalid ${name}: "not-a-uuid" is not a valid UUID`,
    );
  });
});
