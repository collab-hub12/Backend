import {Module} from '@nestjs/common';
import {TaskService} from './task.service';
import {TaskController} from './task.controller';
import {drizzleProvider} from 'src/drizzle/drizzle.provider';

@Module({
  controllers: [TaskController],
  providers: [TaskService, ...drizzleProvider],
})
export class TaskModule { }
