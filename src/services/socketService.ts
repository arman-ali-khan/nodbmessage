import { io, Socket } from 'socket.io-client';
import { Message } from '../types';
import MockSocketServer from './mockSocketServer';

export class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private mockServer = MockSocketServer.getInstance();
  private socketId: string | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private userJoinedHandlers: ((data: { userId: string; username: string }) => void)[] = [];
  private userLeftHandlers: ((data: { userId: string; username: string }) => void)[] = [];

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(userId: string, username: string): void {
    if (this.socketId) return; // Already connected

    // Generate a unique socket ID for mock server
    this.socketId = `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add socket to mock server
    this.mockServer.addSocket(
      this.socketId,
      userId,
      username,
      (event: string, data: any) => {
        this.handleServerEvent(event, data);
      }
    );

    console.log('Connected to mock socket server');
  }

  disconnect(): void {
    if (this.socketId) {
      this.mockServer.removeSocket(this.socketId);
      this.socketId = null;
      console.log('Disconnected from mock socket server');
    }
  }

  joinRoom(roomId: string): void {
    if (this.socketId) {
      this.mockServer.joinRoom(this.socketId, roomId);
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socketId) {
      this.mockServer.leaveRoom(this.socketId, roomId);
    }
  }

  sendMessage(message: Message): void {
    if (this.socketId) {
      this.mockServer.sendMessage(this.socketId, message);
    }
  }

  onMessage(callback: (message: Message) => void): void {
    this.messageHandlers.push(callback);
  }

  onUserJoined(callback: (data: { userId: string; username: string }) => void): void {
    this.userJoinedHandlers.push(callback);
  }

  onUserLeft(callback: (data: { userId: string; username: string }) => void): void {
    this.userLeftHandlers.push(callback);
  }

  offMessage(): void {
    this.messageHandlers = [];
  }

  offUserJoined(): void {
    this.userJoinedHandlers = [];
  }

  offUserLeft(): void {
    this.userLeftHandlers = [];
  }

  private handleServerEvent(event: string, data: any): void {
    switch (event) {
      case 'receive-message':
        this.messageHandlers.forEach(handler => handler(data));
        break;
      case 'user-joined':
        this.userJoinedHandlers.forEach(handler => handler(data));
        break;
      case 'user-left':
        this.userLeftHandlers.forEach(handler => handler(data));
        break;
    }
  }
}