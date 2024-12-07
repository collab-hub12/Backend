import {relations} from 'drizzle-orm';
import {
  integer,
  primaryKey,
  serial,
  pgTable,
  text,
} from 'drizzle-orm/pg-core';
import {users} from './users.schema';
import {teams} from './teams.schema';
import {organizations} from './organizations.schema';
import {drawingBoards} from './boards.schema';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  position: integer('position').notNull(),
  title: text('title').notNull(),
  team_id: integer('team_id')
    .notNull()
    .references(() => teams.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
  org_id: integer('org_id')
    .notNull()
    .references(() => organizations.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  description: text('description').notNull(),
  progress: text('progress').notNull(),
  deadline: text('deadline').notNull(),
});

export const tasksRelation = relations(tasks, ({one, many}) => ({
  assignedTasks: many(assignedTasks),
  team: one(teams, {
    fields: [tasks.team_id],
    references: [teams.id],
  }),
  organization: one(organizations, {
    fields: [tasks.org_id],
    references: [organizations.id],
  }),
  drawingBoards: one(drawingBoards),
}));

//junction table to represent many-to-many relationship between users and tasks
export const assignedTasks = pgTable(
  'assigned_task_details',
  {
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, {onDelete: 'cascade'}),
    task_id: integer('task_id')
      .notNull()
      .references(() => tasks.id, {onDelete: 'cascade'}),
  },
  (t) => ({
    pk: primaryKey({columns: [t.user_id, t.task_id]}),
  }),
);

export const assignedTasksRelations = relations(assignedTasks, ({one}) => ({
  task: one(tasks, {
    fields: [assignedTasks.task_id],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [assignedTasks.user_id],
    references: [users.id],
  }),
}));
