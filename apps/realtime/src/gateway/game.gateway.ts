import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_table')
  handleJoinTable(client: Socket, data: { tableId: string; userId: string }) {
    client.join(`table-${data.tableId}`);
    this.server.to(`table-${data.tableId}`).emit('player_joined', data);
  }

  @SubscribeMessage('leave_table')
  handleLeaveTable(client: Socket, data: { tableId: string; userId: string }) {
    client.leave(`table-${data.tableId}`);
    this.server.to(`table-${data.tableId}`).emit('player_left', data);
  }

  @SubscribeMessage('game_action')
  handleGameAction(
    client: Socket,
    data: { tableId: string; userId: string; action: string },
  ) {
    this.server.to(`table-${data.tableId}`).emit('action_received', data);
  }
}
