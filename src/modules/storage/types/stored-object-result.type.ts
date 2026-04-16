export type StoredObjectResult = {
  bucket: string;
  key: string;
  storageProvider: 's3';
  size: number;
  etag: string | null;
};
