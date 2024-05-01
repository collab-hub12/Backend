import {ConflictException, Inject, Injectable} from '@nestjs/common';
import {LibSQLDatabase} from 'drizzle-orm/libsql';
import {DrizzleAsyncProvider} from 'src/drizzle/drizzle.provider';
import type {schema} from 'src/drizzle/schemas/schema';
import {CreateRoomDto} from './dto/room.dto';
import {roomMembers, rooms} from 'src/drizzle/schemas/room.schema';
import {and, eq} from 'drizzle-orm';

@Injectable()
export class RoomService {
    constructor(@Inject(DrizzleAsyncProvider) private readonly db: LibSQLDatabase<schema>) { }

    async createRoom(createRoomDTO: CreateRoomDto) {
        return (await this.db.insert(rooms).values(createRoomDTO).returning())[0]
    }

    async addMemberToRoom(room_id: number, user_id: number) {
        const rowsAffected = (await this.db.insert(roomMembers).values({room_id, user_id, is_admin: false})).rowsAffected
        if (!rowsAffected) throw new ConflictException("issue occured adding member to the room")
        return {"msg": "member added to the room successFully"}
    }

    async removeMemberFromRoom(room_id: number, user_id: number) {
        const rowsAffected = (await this.db.delete(roomMembers).where(
            and(
                eq(roomMembers.room_id, room_id),
                eq(roomMembers.user_id, user_id)
            )
        )).rowsAffected

        if (!rowsAffected) throw new ConflictException("issue occured removing member from the Room")
        return {"msg": "member removed from the Room successFully"}
    }

    async getUsersinRoom(user_id: number, room_id: number) {
        const user = (await this.db.select().from(roomMembers).where(
            and(
                eq(roomMembers.room_id, room_id),
                eq(roomMembers.user_id, user_id),
            )
        ))[0]
        if (!user) throw new ConflictException("user is not a part of Room")
        return user
    }

    async makeUserAdminInsideRoom(user_id: number, room_id: number) {
        const rowsAffected = (await this.db.update(roomMembers).set({is_admin: true}).where(
            and(
                eq(roomMembers.user_id, user_id),
                eq(roomMembers.room_id, room_id),
            )
        )).rowsAffected;
        if (!rowsAffected) throw new ConflictException("issue occured while making an user admin");
    }
}
