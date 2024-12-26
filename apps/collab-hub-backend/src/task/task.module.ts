import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { DrawingboardModule } from 'src/drawingboard/drawingboard.module';

@Module({
  imports: [DrawingboardModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
