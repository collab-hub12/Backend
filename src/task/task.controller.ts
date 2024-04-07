import {Controller, Get, Post, Body, Patch, Param, Delete} from '@nestjs/common';
import {TaskService} from './task.service';
import {CreateTaskDto} from './dto/create-task.dto';
import {UpdateTaskDto} from './dto/update-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.taskService.findOne(id);
  }

}
