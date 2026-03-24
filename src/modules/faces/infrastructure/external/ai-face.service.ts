import { Injectable } from '@nestjs/common';

@Injectable()
export class AiFaceService {
  extractEmbedding(fileId: number): number[] {
    // Placeholder: replace with actual AI service call in production.
    const seed = (fileId % 997) / 997;

    return Array.from({ length: 128 }, (_, index) =>
      Number(((seed + index * 0.001) % 1).toFixed(6)),
    );
  }
}
