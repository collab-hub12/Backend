import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {eq} from 'drizzle-orm';
import {NodePgDatabase} from 'drizzle-orm/node-postgres';
import {DrizzleAsyncProvider} from '@app/drizzle/drizzle.provider';
import {drawingBoards} from '@app/drizzle/schemas/boards.schema';
import {schema} from '@app/drizzle/schemas/schema';

@Injectable()
export class DrawingboardService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
  ) { }

  async create(task_id: string) {
    const board = (
      await this.db
        .insert(drawingBoards)
        .values({
          task_id,
        })
        .returning()
    )[0];
    if (!board)
      throw new BadRequestException('Error Occured While Creating Board');
  }

  async GetBoardDetails(task_id: string) {
    const board = (
      await this.db
        .select()
        .from(drawingBoards)
        .where(eq(drawingBoards.task_id, task_id))
    )[0];
    if (!board)
      throw new BadRequestException('Error Occured While Getting Board');
    return board;
  }

  async updateNodes(task_id: string, nodesChanges: unknown) {
    const res = (
      await this.db
        .update(drawingBoards)
        .set({nodes: nodesChanges})
        .where(eq(drawingBoards.task_id, task_id))
    ).rowCount;
    if (res === 0)
      throw new BadRequestException('Error Occured while updating nodes');
  }
  async updateEdges(task_id: string, edgesChanges: unknown) {
    const res = (
      await this.db
        .update(drawingBoards)
        .set({edges: edgesChanges})
        .where(eq(drawingBoards.task_id, task_id))
    ).rowCount;
    if (res === 0)
      throw new BadRequestException('Error Occured while updating nodes');
  }
}
