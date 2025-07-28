import {ConflictException, Inject, Injectable} from '@nestjs/common';
import {CreateTaskDto} from './dto/create-task.dto';
import {UpdateTaskDto} from './dto/update-task.dto';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {DrizzleAsyncProvider} from '@app/drizzle/drizzle.provider';
import {
  eq,
  and,
  desc,
  gte,
  lte,
  gt,
  sql,
  getTableColumns,
  inArray,
} from 'drizzle-orm';
import {schema} from '@app/drizzle/schemas/schema';
import {assignedTasks, tasks} from '@app/drizzle/schemas/tasks.schema';
import {users} from '@app/drizzle/schemas/users.schema';
import {DrawingboardService} from 'src/drawingboard/drawingboard.service';
import {teamMember, teams} from '@app/drizzle/schemas/teams.schema';
import {organizations} from '@app/drizzle/schemas/organizations.schema';

@Injectable()
export class TaskService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
    private readonly drawingBoardService: DrawingboardService,
  ) { }

  async create(createTaskDto: CreateTaskDto, team_id: string, org_id: string) {
    // get last task's position
    const last_task = (
      await this.db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.progress, createTaskDto.progress),
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
          title: createTaskDto.title,
          deadline: createTaskDto.deadline,
          description: createTaskDto.description,
          progress: createTaskDto.progress,
          team_id,
          org_id,
          position: last_task?.position ? last_task.position + 1 : 1,
        })
        .returning()
    )[0];

    return task_detail;
  }

  async getAllTasksOfATeamInsideOrg(
    org_id: string,
    team_id: string,
    user_ids: string[],
  ) {
    const filter = [eq(tasks.org_id, org_id), eq(tasks.team_id, team_id)];

    if (user_ids.length !== 0) {
      filter.push(inArray(assignedTasks.user_id, user_ids));
    }

    const task_details = await this.db
      .select({...getTableColumns(tasks)})
      .from(tasks)
      .leftJoin(assignedTasks, eq(assignedTasks.task_id, tasks.id))
      .where(and(...filter));

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
    org_id: string,
    team_id: string,
    task_id: string,
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

    const boardDetails =
      await this.drawingBoardService.GetBoardDetails(team_id);

    return {...task_details, assigned_to, boardDetails};
  }

  async getArchivedTasksOfATeamInsideOrg(org_id: string, team_id: string) {
    const filter = [
      eq(tasks.org_id, org_id),
      eq(tasks.team_id, team_id),
      eq(tasks.archived, true),
    ];

    const task_details = await this.db
      .select({...getTableColumns(tasks)})
      .from(tasks)
      .leftJoin(assignedTasks, eq(assignedTasks.task_id, tasks.id))
      .where(and(...filter));

    return task_details;
  }

  async assignTask(user_id: string, task_id: string) {
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

  async revokeTask(user_id: string, task_id: string) {
    await this.db
      .delete(assignedTasks)
      .where(
        and(
          eq(assignedTasks.user_id, user_id),
          eq(assignedTasks.task_id, task_id),
        ),
      );
  }

  async findOne(id: string) {
    const task_detail = (
      await this.db.select().from(tasks).where(eq(tasks.id, id))
    )[0];
    return task_detail;
  }

  async deleteTask(id: string) {
    const rowsAffected = (await this.db.delete(tasks).where(eq(tasks.id, id)))
      .rowCount;
    if (!rowsAffected) throw new ConflictException('task didnt get deleted');
    return {msg: 'task deleted successfully'};
  }

  async updateTask(id: string, updatetaskdto: UpdateTaskDto) {
    await this.db.transaction(async (tx) => {
      try {
        if (updatetaskdto.position) {
          const task_detail = (
            await tx.select().from(tasks).where(eq(tasks.id, id))
          )[0];

          //if task is in the same progress
          if (task_detail.progress === updatetaskdto.progress) {
            if (task_detail.position < updatetaskdto.position) {
              await tx
                .update(tasks)
                .set({position: sql`${tasks.position} - 1`})
                .where(
                  and(
                    gte(tasks.position, task_detail.position),
                    lte(tasks.position, updatetaskdto.position),
                    eq(tasks.progress, task_detail.progress),
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
                    eq(tasks.progress, task_detail.progress),
                  ),
                );
            }
            //if task is in the different progress
          } else if (task_detail.progress !== updatetaskdto.progress) {
            await tx
              .update(tasks)
              .set({position: sql`${tasks.position} - 1`})
              .where(
                and(
                  gt(tasks.position, task_detail.position),
                  eq(tasks.progress, task_detail.progress),
                ),
              );

            await tx
              .update(tasks)
              .set({position: sql`${tasks.position} + 1`})
              .where(
                and(
                  gte(tasks.position, updatetaskdto.position),
                  eq(tasks.progress, updatetaskdto.progress),
                ),
              );
          }
        }

        await tx
          .update(tasks)
          .set({
            position: updatetaskdto.position,
            description: updatetaskdto.description,
            deadline: updatetaskdto.deadline,
            progress: updatetaskdto.progress,
          })
          .where(eq(tasks.id, id));
      } catch (err) {
        tx.rollback();
        throw new ConflictException('task didnt get updated');
      }
    });

    return {msg: 'task updated successfully'};
  }

  async archiveTask(task_id: string) {
    const result = await this.db
      .update(tasks)
      .set({archived: true})
      .where(eq(tasks.id, task_id))
      .returning();

    if (result.length === 0) {
      throw new ConflictException('Task not found');
    }

    return {msg: 'Task archived successfully'};
  }

  async unarchiveTask(task_id: string) {
    const result = await this.db
      .update(tasks)
      .set({archived: false})
      .where(eq(tasks.id, task_id))
      .returning();

    if (result.length === 0) {
      throw new ConflictException('Task not found');
    }

    return {msg: 'Task unarchived successfully'};
  }

  async getUserTasks(user_id: string, limit: number, offset: number) {
    return await this.db
      .selectDistinct({
        ...getTableColumns(organizations),
        team_name: teams.name,
        tasks,
      })
      .from(assignedTasks)
      .innerJoin(tasks, eq(tasks.id, assignedTasks.task_id))
      .innerJoin(teamMember, eq(teamMember.team_id, tasks.team_id))
      .innerJoin(organizations, eq(organizations.id, teamMember.org_id))
      .innerJoin(teams, eq(teams.id, teamMember.team_id))
      .orderBy(organizations.id)
      .where(eq(assignedTasks.user_id, user_id))
      .limit(limit)
      .offset(offset);
  }
}
