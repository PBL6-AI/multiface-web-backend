import { Body, Controller, Post } from '@nestjs/common';
import { CreateClassUseCase } from '../../application/use-cases/create-class.use-case';
import { JoinClassUseCase } from '../../application/use-cases/join-class.use-case';
import { CreateClassDto } from '../dtos/create-class.dto';
import { JoinClassDto } from '../dtos/join-class.dto';

@Controller('classes')
export class ClassesController {
  constructor(
    private readonly createClassUseCase: CreateClassUseCase,
    private readonly joinClassUseCase: JoinClassUseCase,
  ) {}

  @Post()
  createClass(@Body() body: CreateClassDto) {
    return this.createClassUseCase.execute(body);
  }

  @Post('join')
  joinClass(@Body() body: JoinClassDto) {
    return this.joinClassUseCase.execute(body);
  }
}
