import {Inject, Injectable} from '@nestjs/common';
import {CreateTaskDto} from './dto/create-task.dto';
import {UpdateTaskDto} from './dto/update-task.dto';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {eq, and} from 'drizzle-orm';
import {schema} from 'src/drizzle/schemas/schema';
import {tasks} from 'src/drizzle/schemas/tasks.schema';


@Injectable()
export class TaskService {

  constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>) { }

  async create(createTaskDto: CreateTaskDto, team_id: number, org_id: number) {
    const task_detail = (await this.db.insert(tasks).values({
      title: createTaskDto.taskTitle,
      task_deadline: createTaskDto.taskDeadline,
      task_desc: createTaskDto.taskDescription,
      task_progress: createTaskDto.taskProgress,
      team_id,
      org_id,
    }).returning())[0]

    return task_detail;
  }

  async getAllTasksOfATeamInsideOrg(org_id: number, team_id: number) {
    const task_details = await this.db.select().from(tasks).where(
      and(
        eq(tasks.org_id, org_id),
        eq(tasks.team_id, team_id))
    )
    return task_details;
  }

  async findOne(id: number) {
    const task_detail = (await this.db.select().from(tasks).where(eq(tasks.id, id)))[0]
    return task_detail;
  }
}
