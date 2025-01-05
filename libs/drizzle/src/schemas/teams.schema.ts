import {
  primaryKey,
  text,
  pgTable,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';
import {organizations} from './organizations.schema';
import {users} from './users.schema';
import {relations} from 'drizzle-orm';

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  org_id: uuid('org_id')
    .notNull()
    .references(() => organizations.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
});

export const teamRelation = relations(teams, ({one, many}) => ({
  teamMember: many(teamMember),
  organization: one(organizations, {
    fields: [teams.org_id],
    references: [organizations.id],
  }),
}));

export const teamMember = pgTable(
  'team_member_details',
  {
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    team_id: uuid('team_id')
      .notNull()
      .references(() => teams.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    org_id: uuid('org_id')
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    is_admin: boolean('is_admin').notNull(),
  },
  (t) => ({
    pk: primaryKey({columns: [t.user_id, t.team_id, t.org_id]}),
  }),
);

export const teamMemberRelations = relations(teamMember, ({one}) => ({
  team: one(teams, {
    fields: [teamMember.team_id],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMember.user_id],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [teamMember.org_id],
    references: [organizations.id],
  }),
}));
