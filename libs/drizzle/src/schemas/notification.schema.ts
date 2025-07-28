import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { tasks } from './tasks.schema';
import { relations } from 'drizzle-orm';
import { teams } from './teams.schema';
import { organizations } from './organizations.schema';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  sent_to: text('sent_to').notNull(),
  task_id: uuid('task_id').references(() => tasks.id, {
    onDelete: 'cascade',
  }),
  org_id: uuid('org_id').references(() => organizations.id, {
    onDelete: 'cascade',
  }),
  team_id: uuid('team_id').references(() => teams.id, {
    onDelete: 'cascade',
  }),
  notified_at: text('notifed_at').notNull(),
  description: text('description').notNull(),
});

export const notificationRelation = relations(notifications, ({ one }) => ({
  task: one(tasks, {
    fields: [notifications.task_id],
    references: [tasks.id],
  }),
}));
