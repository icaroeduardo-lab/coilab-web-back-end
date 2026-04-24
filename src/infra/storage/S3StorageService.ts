import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const PRESIGNED_URL_TTL_SECONDS = 300;

@Injectable()
export class S3StorageService {
  private readonly client: S3Client;
  private readonly region: string;

  constructor() {
    this.region = process.env.AWS_REGION ?? 'us-east-1';
    this.client = new S3Client({ region: this.region });
  }

  async getPresignedUploadUrl(
    bucket: string,
    key: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });
    const fileUrl = `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return { uploadUrl, fileUrl };
  }
}
