
import {ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Socket} from "socket.io";

interface IUser {
    socketId: string,
    userId: string
}

@WebSocketGateway(8001, {cors: true})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private Rooms = new Map<string, IUser[]>();

    async handleConnection(socketClient: Socket) {

    }

    async handleDisconnect(socketClient: Socket) {
        for (let [roomId, users] of this.Rooms) {
            for (let user of users) {
                if (user.socketId === socketClient.id) {
                    const updatedUserlist = this.Rooms.get(roomId).filter(user => user.socketId !== socketClient.id)
                    this.Rooms.set(roomId, updatedUserlist)
                    socketClient.to(roomId).emit('connectedUsers', {users: this.Rooms.get(roomId)})
                }
            }
        }
    }

    @SubscribeMessage("join")
    async handleJoinRoom(@ConnectedSocket() socketClient: Socket, @MessageBody() {user, roomId}: {user: string, roomId: string}) {
        socketClient.join(roomId)
        // check if room exists or noT
        if (!this.Rooms.has(roomId)) {
            // creating room with empty user array
            this.Rooms.set(roomId, []);
        }

        const UpdateUsersDetails = this.Rooms.get(roomId)
            .filter(userINroom => userINroom.userId !== user)

        UpdateUsersDetails.push({userId: user, socketId: socketClient.id})

        this.Rooms.set(roomId, UpdateUsersDetails)

        socketClient.to(roomId).emit('connectedUsers', {users: this.Rooms.get(roomId)})
        socketClient.emit('connectedUsers', {users: this.Rooms.get(roomId)})
    }


    @SubscribeMessage("nodesChange")
    async handleOnNodeChanges(@ConnectedSocket() socketClient: Socket, @MessageBody() data: {roomId: string, changes: unknown}) {
        socketClient.to(data.roomId).emit("nodesChange", data.changes);
    }

    @SubscribeMessage("edgesChange")
    async handleOnEdgesChanges(@ConnectedSocket() socketClient: Socket, @MessageBody() data: {roomId: string, changes: unknown}) {
        socketClient.to(data.roomId).emit("edgesChange", data.changes);
    }
}