import type { StoredObjectResult } from '../types';

export type UploadBufferInput = {
  key: string;
  body: Buffer;
  contentType: string;
  size: number;
};

export interface CloudStorageService {
  uploadBuffer(input: UploadBufferInput): Promise<StoredObjectResult>;
  deleteObject(key: string): Promise<void>;
}
