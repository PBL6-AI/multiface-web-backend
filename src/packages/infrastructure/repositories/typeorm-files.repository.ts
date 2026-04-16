import { getRepositoryToken } from '@nestjs/typeorm';
import { REPOSITORY_TOKENS } from '../../../common/constants';
import { Repository } from 'typeorm';
import type {
  CreateFileRecordInput,
  FilesRepository,
} from '../../domain/repositories';
import { FileEntity } from '../entities';

export class TypeOrmFilesRepository implements FilesRepository {
  constructor(private readonly filesRepository: Repository<FileEntity>) {}

  async createFile(input: CreateFileRecordInput): Promise<FileEntity> {
    return this.filesRepository.save(
      this.filesRepository.create({
        ...input,
        checksum: input.checksum ?? null,
      }),
    );
  }

  async findById(fileId: number): Promise<FileEntity | null> {
    return this.filesRepository.findOne({
      where: { id: fileId },
    });
  }
}

export const useFilesRepository = () => ({
  provide: REPOSITORY_TOKENS.FILES,
  useFactory: (filesRepository: Repository<FileEntity>) =>
    new TypeOrmFilesRepository(filesRepository),
  inject: [getRepositoryToken(FileEntity)],
});
