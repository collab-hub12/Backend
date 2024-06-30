import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {tasks} from "./tasks.schema";
import {relations} from "drizzle-orm";

export const drawingBoards = sqliteTable("drawing_boards", {
    id: integer("id").primaryKey({autoIncrement: true}),
    task_id: integer("task_id").notNull().references(() => tasks.id, {onDelete: 'cascade'}),
    edges: text('edges', {mode: 'json'}),
    nodes: text('nodes', {mode: "json"})
})

export const drawingBoardsRelations = relations(
    drawingBoards, ({one}) => ({
        tasks: one(tasks, {
            fields: [drawingBoards.task_id],
            references: [tasks.id]
        }),
    })
)

export type SelectBoards = typeof drawingBoards.$inferSelect;
export type InsertBoards = typeof drawingBoards.$inferInsert;