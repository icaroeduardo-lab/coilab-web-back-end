import { randomUUID } from 'crypto';
import { extname } from 'path';
import { ITaskRepository } from '../../../../domain/repositories/ITaskRepository';
import { TaskId } from '../../../../domain/shared/entity-ids';
import { S3StorageService } from '../../../../infra/storage/S3StorageService';

export interface GetDesignUploadUrlInput {
  taskId: string;
  filename: string;
}

export interface UploadUrlOutput {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export class GetDesignUploadUrlUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly storage: S3StorageService,
  ) {}

  async execute(input: GetDesignUploadUrlInput): Promise<UploadUrlOutput> {
    const task = await this.taskRepository.findById(TaskId(input.taskId));
    if (!task) throw new Error('Task not found');

    const prefix = task.getTaskNumber().replace('#', '');
    const ext = extname(input.filename);
    const key = `${prefix}/${randomUUID()}${ext}`;

    const bucket = process.env.BUCKET_DESIGN!;
    const { uploadUrl, fileUrl } = await this.storage.getPresignedUploadUrl(bucket, key);
    return { uploadUrl, fileUrl, key };
  }
}
