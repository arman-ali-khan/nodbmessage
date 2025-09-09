// Mock Socket.IO server for development
// This simulates real-time messaging without requiring a separate server

import { Message } from '../types';

interface MockSocket {
  id: string;
  userId: string;
  username: string;
  roomId: string | null;
  emit: (event: string, data: any) => void;
}

class MockSocketServer {
  private static instance: MockSocketServer;
  private sockets: Map<string, MockSocket> = new Map();
  private rooms: Map<string, Set<string>> = new Map();

  static getInstance(): MockSocketServer {
    if (!MockSocketServer.instance) {
      MockSocketServer.instance = new MockSocketServer();
    }
    return MockSocketServer.instance;
  }

  addSocket(socketId: string, userId: string, username: string, emitFn: (event: string, data: any) => void): void {
    const socket: MockSocket = {
      id: socketId,
      userId,
      username,
      roomId: null,
      emit: emitFn
    };
    
    this.sockets.set(socketId, socket);
  }

  removeSocket(socketId: string): void {
    const socket = this.sockets.get(socketId);
    if (socket && socket.roomId) {
      this.leaveRoom(socketId, socket.roomId);
    }
    this.sockets.delete(socketId);
  }

  joinRoom(socketId: string, roomId: string): void {
    const socket = this.sockets.get(socketId);
    if (!socket) return;

    // Leave current room if any
    if (socket.roomId) {
      this.leaveRoom(socketId, socket.roomId);
    }

    // Join new room
    socket.roomId = roomId;
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(socketId);

    // Notify others in room
    this.broadcastToRoom(roomId, 'user-joined', {
      userId: socket.userId,
      username: socket.username
    }, socketId);
  }

  leaveRoom(socketId: string, roomId: string): void {
    const socket = this.sockets.get(socketId);
    if (!socket) return;

    socket.roomId = null;
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      } else {
        // Notify others in room
        this.broadcastToRoom(roomId, 'user-left', {
          userId: socket.userId,
          username: socket.username
        }, socketId);
      }
    }
  }

  sendMessage(socketId: string, message: Message): void {
    const socket = this.sockets.get(socketId);
    if (!socket || !socket.roomId) return;

    // Broadcast message to all users in the room
    this.broadcastToRoom(socket.roomId, 'receive-message', message);
  }

  private broadcastToRoom(roomId: string, event: string, data: any, excludeSocketId?: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.forEach(socketId => {
      if (socketId !== excludeSocketId) {
        const socket = this.sockets.get(socketId);
        if (socket) {
          socket.emit(event, data);
        }
      }
    });
  }
}

export default MockSocketServer;