
import {Inject} from "@nestjs/common";
import {ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway} from "@nestjs/websockets";
import {LibSQLDatabase} from "drizzle-orm/libsql";
import {Socket} from "socket.io";
import {DrawingboardService} from "src/drawingboard/drawingboard.service";
import {DrizzleAsyncProvider} from "src/drizzle/drizzle.provider";
import {drawingBoards} from "src/drizzle/schemas/boards.schema";
import {schema} from "src/drizzle/schemas/schema";

interface User {
    socketId: string,
    username: string,
    userId: string,
    picture: string
}

@WebSocketGateway(8001, {cors: true})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private Rooms = new Map<string, User[]>()
    constructor(
        private readonly drawingBoardService: DrawingboardService
    ) { }

    async handleConnection(socketClient: Socket) {
    }

    async handleDisconnect(socketClient: Socket) {
        for (let [roomId, users] of this.Rooms) {
            for (let user of users) {
                if (user.socketId === socketClient.id) {
                    const updatedUserlist = this.Rooms.get(roomId).filter(user => user.socketId !== socketClient.id)
                    this.Rooms.set(roomId, updatedUserlist)
                    socketClient.in(roomId).emit('connectedUsers', {users: this.Rooms.get(roomId)})
                }
            }
        }
    }

    @SubscribeMessage("join")
    async handleJoinRoom(@ConnectedSocket() socketClient: Socket, @MessageBody() {user, roomId}: {user: User, roomId: string}) {
        socketClient.join(roomId)
        // check if room exists or noT
        if (!this.Rooms.has(roomId)) {
            // creating room with empty user array
            this.Rooms.set(roomId, []);
        }

        const UpdateUsersDetails = this.Rooms.get(roomId)
            .filter(userINroom => userINroom.userId !== user.userId)

        UpdateUsersDetails.push({socketId: socketClient.id, ...user})

        this.Rooms.set(roomId, UpdateUsersDetails)

        socketClient.in(roomId).emit('connectedUsers', {users: this.Rooms.get(roomId)})
        socketClient.emit('connectedUsers', {users: this.Rooms.get(roomId)})
    }


    @SubscribeMessage("nodesChange")
    async handleOnNodeChanges(@ConnectedSocket() socketClient: Socket, @MessageBody() data: {roomId: string, changes: unknown, task_id: number}) {
        await this.drawingBoardService.updateNodes(
            data.task_id, data.changes
        )
        socketClient.to(data.roomId).emit("nodesChange", data.changes);

    }

    @SubscribeMessage("edgesChange")
    async handleOnEdgesChanges(@ConnectedSocket() socketClient: Socket, @MessageBody() data: {roomId: string, changes: unknown, task_id: number}) {
        await this.drawingBoardService.updateEdges(
            data.task_id, data.changes
        )
        socketClient.to(data.roomId).emit("edgesChange", data.changes);
    }
}