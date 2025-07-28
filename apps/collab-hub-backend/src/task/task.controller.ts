import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from 'src/common/decorator/user.decorator';

@ApiTags('Task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: 'Get a task by id' })
  @ApiParam({ name: 'task_id', description: 'Task ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.taskService.findOne(id);
  }

  @ApiOperation({ summary: 'Delete a task by id' })
  @ApiParam({ name: 'task_id', description: 'Task ID' })
  @Delete(':task_id')
  async Delete(@Param('task_id') id: string) {
    return await this.taskService.deleteTask(id);
  }

  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'task_id', description: 'Task ID' })
  @Patch(':task_id')
  async Update(
    @Param('task_id') id: string,
    @Body() updatetaskdto: UpdateTaskDto,
  ) {
    return await this.taskService.updateTask(id, updatetaskdto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tasks for a user' })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
  })
  @ApiQuery({
    name: 'per_page',
    description: 'Number of elements per page',
    required: false,
  })
  @Get()
  async getUserTasks(
    @User() authUser: Express.User,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
  ) {
    const offset = (page - 1) * per_page;
    const limit = per_page;
    return this.taskService.getUserTasks(authUser.id, limit, offset);
  }
}
