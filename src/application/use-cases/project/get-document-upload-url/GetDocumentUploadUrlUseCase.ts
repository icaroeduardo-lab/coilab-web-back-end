import { randomUUID } from 'crypto';
import { extname } from 'path';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../../domain/shared/entity-ids';
import { S3StorageService } from '../../../../infra/storage/S3StorageService';

export interface GetDocumentUploadUrlInput {
  projectId: string;
  filename: string;
}

export interface UploadUrlOutput {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export class GetDocumentUploadUrlUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly storage: S3StorageService,
  ) {}

  async execute(input: GetDocumentUploadUrlInput): Promise<UploadUrlOutput> {
    const project = await this.projectRepository.findById(ProjectId(input.projectId));
    if (!project) throw new Error('Project not found');

    const prefix = project.getProjectNumber().replace('#', '');
    const ext = extname(input.filename);
    const key = `${prefix}/${randomUUID()}${ext}`;

    const bucket = process.env.BUCKET_PROJECTS_DOCUMENTS!;
    const { uploadUrl, fileUrl } = await this.storage.getPresignedUploadUrl(bucket, key);
    return { uploadUrl, fileUrl, key };
  }
}
