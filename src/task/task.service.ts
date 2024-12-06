import {ConflictException, Inject, Injectable} from '@nestjs/common';
import {CreateTaskDto} from './dto/create-task.dto';
import {UpdateTaskDto} from './dto/update-task.dto';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import {eq, and, desc, gte, lte, gt, sql} from 'drizzle-orm';
import {schema} from 'src/drizzle/schemas/schema';
import {assignedTasks, tasks} from 'src/drizzle/schemas/tasks.schema';
import {users} from 'src/drizzle/schemas/users.schema';
import {DrawingboardService} from 'src/drawingboard/drawingboard.service';

@Injectable()
export class TaskService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
    private readonly drawingBoardService: DrawingboardService,
  ) { }

  async create(createTaskDto: CreateTaskDto, team_id: number, org_id: number) {
    // get last task's position
    const last_task = (
      await this.db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.task_progress, createTaskDto.taskProgress),
            eq(tasks.team_id, team_id),
            eq(tasks.org_id, org_id),
          ),
        )
        .orderBy(desc(tasks.position))
        .limit(1)
    )[0];

    const task_detail = (
      await this.db
        .insert(tasks)
        .values({
          title: createTaskDto.taskTitle,
          task_deadline: createTaskDto.taskDeadline,
          task_desc: createTaskDto.taskDescription,
          task_progress: createTaskDto.taskProgress,
          team_id,
          org_id,
          position: last_task?.position ? last_task.position + 1 : 1,
        })
        .returning()
    )[0];

    return task_detail;
  }

  async getAllTasksOfATeamInsideOrg(org_id: number, team_id: number) {
    const task_details = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.org_id, org_id), eq(tasks.team_id, team_id)));
    const result = Promise.all(
      task_details.map(async (task) => {
        const assigned_to = await this.db
          .select({
            id: users.id,
            picture: users.picture,
            name: users.name,
            email: users.email,
          })
          .from(assignedTasks)
          .innerJoin(tasks, eq(assignedTasks.task_id, tasks.id))
          .innerJoin(users, eq(assignedTasks.user_id, users.id))
          .where(eq(assignedTasks.task_id, task.id));
        return {...task, assigned_to};
      }),
    );
    return result;
  }

  async getTaskOfATeamInsideOrg(
    org_id: number,
    team_id: number,
    task_id: number,
  ) {
    const task_details = (
      await this.db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.org_id, org_id),
            eq(tasks.team_id, team_id),
            eq(tasks.id, task_id),
          ),
        )
    )[0];
    const assigned_to = await this.db
      .select({
        id: users.id,
        picture: users.picture,
        name: users.name,
        email: users.email,
      })
      .from(assignedTasks)
      .innerJoin(tasks, eq(assignedTasks.task_id, tasks.id))
      .innerJoin(users, eq(assignedTasks.user_id, users.id))
      .where(eq(assignedTasks.task_id, task_details.id));

    const boardDetails = await this.drawingBoardService.GetBoardDetails(
      task_details.id,
    );

    return {...task_details, assigned_to, boardDetails};
  }

  async assignTask(user_id: number, task_id: number) {
    const taskAlreadyAssigned = (
      await this.db
        .select()
        .from(assignedTasks)
        .where(
          and(
            eq(assignedTasks.task_id, task_id),
            eq(assignedTasks.user_id, user_id),
          ),
        )
    )[0];

    if (taskAlreadyAssigned)
      throw new ConflictException(
        'This user has already been assigned to the task.',
      );

    await this.db.insert(assignedTasks).values({user_id, task_id});
  }

  async revokeTask(user_id: number, task_id: number) {
    await this.db
      .delete(assignedTasks)
      .where(
        and(
          eq(assignedTasks.user_id, user_id),
          eq(assignedTasks.task_id, task_id),
        ),
      );
  }

  async findOne(id: number) {
    const task_detail = (
      await this.db.select().from(tasks).where(eq(tasks.id, id))
    )[0];
    return task_detail;
  }

  async deleteTask(id: number) {
    const rowsAffected = (await this.db.delete(tasks).where(eq(tasks.id, id)))
      .rowCount;
    if (!rowsAffected) throw new ConflictException('task didnt get deleted');
    return {msg: 'task deleted successfully'};
  }

  async updateTask(id: number, updatetaskdto: UpdateTaskDto) {
    await this.db.transaction(async (tx) => {
      try {
        if (updatetaskdto.position) {
          const task_detail = (
            await tx.select().from(tasks).where(eq(tasks.id, id))
          )[0];

          //if task is in the same progress
          if (task_detail.task_progress === updatetaskdto.taskProgress) {
            if (task_detail.position < updatetaskdto.position) {
              await tx
                .update(tasks)
                .set({position: sql`${tasks.position} - 1`})
                .where(
                  and(
                    gte(tasks.position, task_detail.position),
                    lte(tasks.position, updatetaskdto.position),
                    eq(tasks.task_progress, task_detail.task_progress),
                  ),
                );
            } else {
              await tx
                .update(tasks)
                .set({position: sql`${tasks.position} + 1`})
                .where(
                  and(
                    gte(tasks.position, updatetaskdto.position),
                    lte(tasks.position, task_detail.position),
                    eq(tasks.task_progress, task_detail.task_progress),
                  ),
                );
            }
            //if task is in the different progress
          } else if (task_detail.task_progress !== updatetaskdto.taskProgress) {
            await tx
              .update(tasks)
              .set({position: sql`${tasks.position} - 1`})
              .where(
                and(
                  gt(tasks.position, task_detail.position),
                  eq(tasks.task_progress, task_detail.task_progress),
                ),
              );

            await tx
              .update(tasks)
              .set({position: sql`${tasks.position} + 1`})
              .where(
                and(
                  gte(tasks.position, updatetaskdto.position),
                  eq(tasks.task_progress, updatetaskdto.taskProgress),
                ),
              );
          }
        }

        await tx
          .update(tasks)
          .set({
            position: updatetaskdto.position,
            task_desc: updatetaskdto.taskDescription,
            task_deadline: updatetaskdto.taskDeadline,
            task_progress: updatetaskdto.taskProgress,
          })
          .where(eq(tasks.id, id));
      } catch (err) {
        tx.rollback();
        throw new ConflictException('task didnt get updated');
      }
    });

    return {msg: 'task updated successfully'};
  }
}
