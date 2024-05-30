import {integer, primaryKey, sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {organizations} from './organizations.schema';
import {users} from './users.schema';
import {relations} from 'drizzle-orm';

export const teams = sqliteTable("teams", {
    id: integer("id").primaryKey({autoIncrement: true}),
    name: text("name").notNull(),
    org_id: integer("org_id").notNull().references(() => organizations.id, {onDelete: 'cascade'}),
})

export const teamRelation = relations(teams, ({one, many}) => ({
    teamMember: many(teamMember),
    organization: one(organizations, {
        fields: [teams.org_id],
        references: [organizations.id]
    })
}))

export const teamMember = sqliteTable("team_member_details", {
    user_id: integer("user_id").notNull().references(() => users.id, {onDelete: 'cascade'}),
    team_id: integer("team_id").notNull().references(() => teams.id, {onDelete: 'cascade'}),
    org_id: integer("org_id").notNull().references(() => organizations.id, {onDelete: 'cascade'}),
    is_admin: integer("is_admin", {mode: "boolean"}).notNull()
}, (t) => ({
    pk: primaryKey({columns: [t.user_id, t.team_id, t.org_id]}),
}))

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
    })
}))
