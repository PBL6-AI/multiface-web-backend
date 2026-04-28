import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileResponseDto {
  @ApiProperty({
    description: 'File metadata record identifier',
    example: 101,
  })
  id: number;

  @ApiProperty({
    description: 'S3 bucket where the file is stored',
    example: 'pb5-multiface-assets',
  })
  bucket: string;

  @ApiProperty({
    description: 'S3 object key stored for the uploaded file',
    example:
      'face_registration_raw/2026-04-16/1713200000000-uuid-front-image.jpg',
  })
  fileKey: string;

  @ApiProperty({
    description: 'Original filename received by the backend',
    example: 'front-image.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'Stored file category',
    example: 'face_registration_raw',
  })
  category: string;

  @ApiProperty({
    description: 'Storage provider used for the uploaded file',
    example: 's3',
  })
  storageProvider: string;

  @ApiProperty({
    description: 'Uploaded file size in bytes',
    example: 248321,
  })
  size: number;

  @ApiProperty({
    description:
      'Temporary signed URL for reading the file from object storage',
    example:
      'https://pb5-multiface-assets.s3.ap-southeast-1.amazonaws.com/face_registration_raw/example.jpg?X-Amz-Signature=...',
    required: false,
  })
  url?: string;
}
