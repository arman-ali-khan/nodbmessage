export interface User {
  id: string;
  username: string;
  email?: string;
  passwordHash: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string;
  participants: string[];
  maxParticipants: number;
  createdAt: string;
  inviteCode: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  encryptedContent: string;
  timestamp: string;
  iv: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, email?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface ChatContextType {
  currentRoom: ChatRoom | null;
  messages: Message[];
  participants: User[];
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: () => void;
  sendMessage: (content: string) => Promise<void>;
  createRoom: (name: string, maxParticipants: number) => Promise<ChatRoom>;
  generateInviteLink: (roomId: string) => string;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}