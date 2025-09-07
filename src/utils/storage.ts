import { User, ChatRoom, Message } from '../types';

const USERS_KEY = 'chat_users';
const ROOMS_KEY = 'chat_rooms';
const MESSAGES_KEY_PREFIX = 'chat_messages_';
const CURRENT_USER_KEY = 'chat_current_user';
const ROOM_KEYS_PREFIX = 'chat_room_key_';

export class StorageService {
  // User management
  static getUsers(): User[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  static saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  static getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.username === username) || null;
  }

  static getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  // Session management
  static setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  static getCurrentUser(): User | null {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static clearCurrentUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  // Room management
  static getRooms(): ChatRoom[] {
    const rooms = localStorage.getItem(ROOMS_KEY);
    return rooms ? JSON.parse(rooms) : [];
  }

  static saveRoom(room: ChatRoom): void {
    const rooms = this.getRooms();
    const existingIndex = rooms.findIndex(r => r.id === room.id);
    
    if (existingIndex >= 0) {
      rooms[existingIndex] = room;
    } else {
      rooms.push(room);
    }
    
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  }

  static getRoomById(id: string): ChatRoom | null {
    const rooms = this.getRooms();
    return rooms.find(r => r.id === id) || null;
  }

  static getRoomByInviteCode(code: string): ChatRoom | null {
    const rooms = this.getRooms();
    return rooms.find(r => r.inviteCode === code) || null;
  }

  // Message management
  static getMessages(roomId: string): Message[] {
    const messages = localStorage.getItem(MESSAGES_KEY_PREFIX + roomId);
    return messages ? JSON.parse(messages) : [];
  }

  static saveMessage(message: Message): void {
    const messages = this.getMessages(message.roomId);
    messages.push(message);
    localStorage.setItem(MESSAGES_KEY_PREFIX + message.roomId, JSON.stringify(messages));
  }

  static clearMessages(roomId: string): void {
    localStorage.removeItem(MESSAGES_KEY_PREFIX + roomId);
  }

  // Room encryption keys
  static saveRoomKey(roomId: string, key: string): void {
    localStorage.setItem(ROOM_KEYS_PREFIX + roomId, key);
  }

  static getRoomKey(roomId: string): string | null {
    return localStorage.getItem(ROOM_KEYS_PREFIX + roomId);
  }

  static clearRoomKey(roomId: string): void {
    localStorage.removeItem(ROOM_KEYS_PREFIX + roomId);
  }

  // Generate unique IDs
  static generateId(): string {
    return crypto.randomUUID();
  }

  // Generate invite codes
  static generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}