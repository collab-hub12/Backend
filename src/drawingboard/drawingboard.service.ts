import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { drawingBoards } from 'src/drizzle/schemas/boards.schema';
import { schema } from 'src/drizzle/schemas/schema';

@Injectable()
export class DrawingboardService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>,
  ) {}

  async create(task_id: number) {
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

  async GetBoardDetails(task_id: number) {
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

  async updateNodes(task_id: number, nodesChanges: unknown) {
    const res = (
      await this.db
        .update(drawingBoards)
        .set({ nodes: nodesChanges })
        .where(eq(drawingBoards.task_id, task_id))
    ).rowsAffected;
    if (res === 0)
      throw new BadRequestException('Error Occured while updating nodes');
  }
  async updateEdges(task_id: number, edgesChanges: unknown) {
    const res = (
      await this.db
        .update(drawingBoards)
        .set({ edges: edgesChanges })
        .where(eq(drawingBoards.task_id, task_id))
    ).rowsAffected;
    if (res === 0)
      throw new BadRequestException('Error Occured while updating nodes');
  }
}
