import {integer, primaryKey, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {users} from "./users.schema";
import {teams} from "./teams.schema";
import {organizations} from "./organizations.schema";
import {relations} from 'drizzle-orm';

export const rooms = sqliteTable("rooms", {
    id: integer("id").primaryKey({autoIncrement: true}),
    title: text("title").notNull(),
    org_id: integer("org_id").notNull().references(() => teams.id, {onDelete: 'cascade'}),
    team_id: integer("team_id").notNull().references(() => teams.id, {onDelete: 'cascade'}),
    room_agenda: text("room_agenda").notNull(),
})

export const roomsRelation = relations(rooms, ({one, many}) => ({
    roomMember: many(roomMembers),
    team: one(teams, {
        fields: [rooms.team_id],
        references: [teams.id]
    }),
    organization: one(organizations, {
        fields: [rooms.org_id],
        references: [organizations.id]
    })

}))

export const roomMembers = sqliteTable("room_member_details", {
    user_id: integer("user_id").notNull().references(() => users.id, {onDelete: 'cascade'}),
    room_id: integer("room_id").notNull().references(() => rooms.id, {onDelete: 'cascade'}),
    is_admin: integer("is_admin", {mode: "boolean"}).notNull()
}, (t) => ({
    pk: primaryKey({columns: [t.user_id, t.room_id]}),
}))


export const roomMemberRelations = relations(roomMembers, ({one}) => ({
    room: one(rooms, {
        fields: [roomMembers.room_id],
        references: [rooms.id],
    }),
    user: one(users, {
        fields: [roomMembers.user_id],
        references: [users.id],
    })
}))