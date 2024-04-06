import {Inject, Injectable} from '@nestjs/common';
import {CreateTaskDto} from './dto/create-task.dto';
import {UpdateTaskDto} from './dto/update-task.dto';
import * as user_schema from "../drizzle/schemas/users.schema"
import * as org_schema from "../drizzle/schemas/organizations.schema"
import * as task_schema from "../drizzle/schemas/tasks.schema"
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {eq} from 'drizzle-orm';
import {schema} from 'src/drizzle/schemas/schema';


@Injectable()
export class TaskService {

  constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>) { }

  async create(createTaskDto: CreateTaskDto, team_id: number) {

    const task_detail = (await this.db.insert(task_schema.tasks).values({
      title: createTaskDto.taskTitle,
      task_deadline: createTaskDto.taskDeadline,
      task_desc: createTaskDto.taskDescription,
      task_progress: createTaskDto.taskProgress,
      team_id: team_id
    }).returning())[0]

    return task_detail;
  }

  async findAll() {
    return `This action returns all task`;
  }

  async findOne(id: number) {
    const task_detail = (await this.db.select().from(task_schema.tasks).where(eq(task_schema.tasks.id, id)))[0]
    return task_detail;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  async remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
