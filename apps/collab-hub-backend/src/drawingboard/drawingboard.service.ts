import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '@app/drizzle/drizzle.provider';
import { drawingBoards } from '@app/drizzle/schemas/boards.schema';
import { schema } from '@app/drizzle/schemas/schema';

@Injectable()
export class DrawingboardService {
  constructor(
    @Inject(DrizzleAsyncProvider) private readonly db: NodePgDatabase<schema>,
  ) {}

  async create(team_id: string) {
    const board = (
      await this.db
        .insert(drawingBoards)
        .values({
          team_id,
        })
        .returning()
    )[0];
    if (!board)
      throw new BadRequestException('Error Occurred While Creating Board');
  }

  async GetBoardDetails(team_id: string) {
    const board = (
      await this.db
        .select()
        .from(drawingBoards)
        .where(eq(drawingBoards.team_id, team_id))
    )[0];
    if (!board)
      throw new BadRequestException('Error Occurred While Getting Board');
    return board;
  }

  async updateNodes(team_id: string, nodesChanges: unknown) {
    const res = (
      await this.db
        .update(drawingBoards)
        .set({ nodes: nodesChanges })
        .where(eq(drawingBoards.team_id, team_id))
    ).rowCount;

    if (res === 0) {
      // Drawing board doesn't exist, create it and then update
      try {
        await this.create(team_id);
        await this.db
          .update(drawingBoards)
          .set({ nodes: nodesChanges })
          .where(eq(drawingBoards.team_id, team_id));
      } catch (error) {
        console.log(error);
        throw new BadRequestException('Error Occurred while updating nodes');
      }
    }
  }

  async updateEdges(team_id: string, edgesChanges: unknown) {
    const res = (
      await this.db
        .update(drawingBoards)
        .set({ edges: edgesChanges })
        .where(eq(drawingBoards.team_id, team_id))
    ).rowCount;

    if (res === 0) {
      // Drawing board doesn't exist, create it and then update
      try {
        await this.create(team_id);
        await this.db
          .update(drawingBoards)
          .set({ edges: edgesChanges })
          .where(eq(drawingBoards.team_id, team_id));
      } catch (error) {
        throw new BadRequestException('Error Occurred while updating edges');
      }
    }
  }
}
