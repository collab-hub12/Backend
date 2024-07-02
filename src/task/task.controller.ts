import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.taskService.findOne(id);
  }

  @Delete(':task_id')
  async Delete(@Param('task_id') id: number) {
    return await this.taskService.deleteTask(id);
  }

  @Patch(':task_id')
  async Update(
    @Param('task_id') id: number,
    @Body() updatetaskdto: UpdateTaskDto,
  ) {
    return await this.taskService.updateTask(id, updatetaskdto);
  }
}
