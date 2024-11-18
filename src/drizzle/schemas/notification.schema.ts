import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users.schema';
import { tasks } from './tasks.schema';
import { relations } from 'drizzle-orm';

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  task_id: integer('task_id').references(() => tasks.id, {
    onDelete: 'cascade',
  }),
  notified_at: text('notifed_at').notNull(),
  description: text('description').notNull(),
});

export const notificationRelation = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [notifications.task_id],
    references: [tasks.id],
  }),
}));
