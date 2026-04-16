import type { RawFileEntity } from '../entities';

export type CreateFileRecordInput = {
  uploaderId: number;
  fileKey: string;
  filename: string;
  mimeType: string;
  size: number;
  category: string;
  storageProvider: string;
  checksum?: string | null;
};

export interface FilesRepository {
  createFile(input: CreateFileRecordInput): Promise<RawFileEntity>;
  findById(fileId: number): Promise<RawFileEntity | null>;
}
