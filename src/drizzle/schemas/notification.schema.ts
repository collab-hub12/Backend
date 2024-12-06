import {integer, pgTable, serial, text} from 'drizzle-orm/pg-core';
import {users} from './users.schema';
import {tasks} from './tasks.schema';
import {relations} from 'drizzle-orm';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
  task_id: integer('task_id').references(() => tasks.id, {
    onDelete: 'cascade',
  }),
  notified_at: text('notifed_at').notNull(),
  description: text('description').notNull(),
});

export const notificationRelation = relations(notifications, ({one}) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [notifications.task_id],
    references: [tasks.id],
  }),
}));
