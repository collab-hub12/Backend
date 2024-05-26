import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Socket} from "socket.io";

@WebSocketGateway(8001, {cors: true})
export class SocketGateway {
    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: unknown, @ConnectedSocket() socket: Socket): void {
        socket.broadcast.emit('message', data);
    }
}