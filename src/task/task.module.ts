import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { drizzleProvider } from 'src/drizzle/drizzle.provider';
import { DrawingboardService } from 'src/drawingboard/drawingboard.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, ...drizzleProvider, DrawingboardService],
})
export class TaskModule {}
