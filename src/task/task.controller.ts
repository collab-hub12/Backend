import {Controller, Get, Body, Patch, Param, Delete} from '@nestjs/common';
import {TaskService} from './task.service';
import {UpdateTaskDto} from './dto/update-task.dto';
import {ApiOperation, ApiParam, ApiTags, ApiBearerAuth} from '@nestjs/swagger';

@ApiTags('Task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @ApiOperation({summary: 'Get a task by id'})
  @ApiParam({name: 'task_id', description: 'Task ID'})
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.taskService.findOne(id);
  }

  @ApiOperation({summary: 'Delete a task by id'})
  @ApiParam({name: 'task_id', description: 'Task ID'})
  @Delete(':task_id')
  async Delete(@Param('task_id') id: number) {
    return await this.taskService.deleteTask(id);
  }

  @ApiOperation({summary: 'Update a task'})
  @ApiParam({name: 'task_id', description: 'Task ID'})
  @Patch(':task_id')
  async Update(
    @Param('task_id') id: number,
    @Body() updatetaskdto: UpdateTaskDto,
  ) {
    return await this.taskService.updateTask(id, updatetaskdto);
  }
}
