import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import type { FilesRepository, RawFileEntity } from '../../../packages/domain';
import { STORAGE_TOKENS } from '../../storage/constants';
import type { CloudStorageService } from '../../storage/interfaces';

type UploadableFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

type StoreUploadedFileInput = {
  uploaderId: number;
  file: UploadableFile;
  category?: string;
  checksum?: string | null;
};

@Injectable()
export class FilesService {
  private static readonly ALLOWED_AVATAR_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]);

  private static readonly MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

  constructor(
    private readonly configService: ConfigService,
    @Inject(REPOSITORY_TOKENS.FILES)
    private readonly filesRepository: FilesRepository,
    @Inject(STORAGE_TOKENS.CLOUD_STORAGE)
    private readonly cloudStorageService: CloudStorageService,
  ) {}

  async storeUploadedFile(
    input: StoreUploadedFileInput,
  ): Promise<RawFileEntity> {
    if (!input.file.buffer.length) {
      throw new BadRequestException('Uploaded file cannot be empty');
    }

    const category = this.normalizeCategory(input.category);
    const objectKey = this.buildObjectKey(category, input.file.originalname);
    const storedObject = await this.cloudStorageService.uploadBuffer({
      key: objectKey,
      body: input.file.buffer,
      contentType: input.file.mimetype,
      size: input.file.size,
    });

    return this.filesRepository.createFile({
      uploaderId: input.uploaderId,
      fileKey: storedObject.key,
      filename: input.file.originalname,
      mimeType: input.file.mimetype,
      size: input.file.size,
      category,
      storageProvider: storedObject.storageProvider,
      checksum: input.checksum ?? null,
    });
  }

  async findByIdOrThrow(fileId: number): Promise<RawFileEntity> {
    const file = await this.filesRepository.findById(fileId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  serializeUploadedFile(file: RawFileEntity) {
    return {
      id: file.id,
      fileKey: file.fileKey,
      filename: file.filename,
      category: file.category,
      storageProvider: file.storageProvider,
      size: file.size,
      bucket: this.configService.get<string>('storage.bucket') ?? '',
    };
  }

  async serializeUploadedFileWithSignedUrl(file: RawFileEntity) {
    return {
      ...this.serializeUploadedFile(file),
      url: await this.buildSignedFileUrl(file.fileKey),
    };
  }

  ensureAvatarImageIsValid(file: UploadableFile): void {
    if (!FilesService.ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Avatar must be a JPG, PNG, or WEBP image');
    }

    if (file.size > FilesService.MAX_AVATAR_SIZE_BYTES) {
      throw new BadRequestException('Avatar image must not exceed 5MB');
    }
  }

  private normalizeCategory(category?: string): string {
    const normalizedCategory = (category ?? 'face_registration_raw')
      .trim()
      .toLowerCase();

    if (!normalizedCategory) {
      throw new BadRequestException('File category cannot be empty');
    }

    return normalizedCategory;
  }

  private buildObjectKey(category: string, originalname: string): string {
    const sanitizedFileName = this.sanitizeFileName(originalname);
    const datePrefix = new Date().toISOString().slice(0, 10);

    return `${category}/${datePrefix}/${Date.now()}-${randomUUID()}-${sanitizedFileName}`;
  }

  private sanitizeFileName(originalname: string): string {
    const extension = extname(originalname).toLowerCase();
    const nameWithoutExtension = originalname.slice(
      0,
      Math.max(0, originalname.length - extension.length),
    );
    const sanitizedBaseName = nameWithoutExtension
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${sanitizedBaseName || 'uploaded-file'}${extension}`;
  }

  private async buildSignedFileUrl(fileKey: string): Promise<string> {
    if (!fileKey) {
      return '';
    }

    return this.cloudStorageService.getSignedObjectUrl(
      fileKey,
      this.getSignedUrlTtlSeconds(),
    );
  }

  private getSignedUrlTtlSeconds(): number {
    const ttlFromConfig =
      this.configService.get<number>('storage.signedUrlExpiresInSeconds') ??
      900;

    if (!Number.isFinite(ttlFromConfig) || ttlFromConfig <= 0) {
      return 900;
    }

    return Math.floor(ttlFromConfig);
  }
}
