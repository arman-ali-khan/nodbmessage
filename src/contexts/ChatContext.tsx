import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatRoom, Message, User, ChatContextType } from '../types';
import { StorageService } from '../utils/storage';
import { useAuth } from './AuthContext';
import { ChatService } from '../services/chatService';
import { SocketService } from '../services/socketService';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const socketService = SocketService.getInstance();

  // Set up Socket.IO connection and message handling
  useEffect(() => {
    if (!user) return;

    // Connect to socket server
    socketService.connect(user.id, user.username);

    // Set up message handlers
    socketService.onMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socketService.onUserJoined((data: { userId: string; username: string }) => {
      console.log(`${data.username} joined the room`);
      // Refresh participants list
      if (currentRoom) {
        loadParticipants(currentRoom);
      }
    });

    socketService.onUserLeft((data: { userId: string; username: string }) => {
      console.log(`${data.username} left the room`);
      // Refresh participants list
      if (currentRoom) {
        loadParticipants(currentRoom);
      }
    });

    return () => {
      socketService.offMessage();
      socketService.offUserJoined();
      socketService.offUserLeft();
      socketService.disconnect();
    };
  }, [user]);

  // Handle room changes
  useEffect(() => {
    if (currentRoom && user) {
      // Clear previous messages when switching rooms
      setMessages([]);
      
      // Join the new room via socket
      socketService.joinRoom(currentRoom.id);
      
      // Load participants
      loadParticipants(currentRoom);
    }
  }, [currentRoom, user]);


  const loadParticipants = (room: ChatRoom) => {
    // Load participants from Supabase
    ChatService.getRoomParticipants(room.id).then(participants => {
      setParticipants(participants);
    });
  };

  const joinRoom = async (roomId: string): Promise<boolean> => {
    try {
      if (!user) return false;

      // Get room from Supabase
      const room = await ChatService.getRoomById(roomId);
      if (!room) return false;

      // Try to join room
      const joinResult = await ChatService.joinRoom(roomId, user.id);
      if (!joinResult.success) {
        throw new Error(joinResult.error || 'Failed to join room');
      }

      setCurrentRoom(room);

      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  };

  const leaveRoom = () => {
    if (currentRoom && user) {
      // Leave room via socket
      socketService.leaveRoom(currentRoom.id);
      
      // Leave room in database
      ChatService.leaveRoom(currentRoom.id, user.id);
    }
    
    setCurrentRoom(null);
    setMessages([]);
    setParticipants([]);
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!currentRoom || !user) return;

    try {
      const message: Message = {
        id: StorageService.generateId(),
        roomId: currentRoom.id,
        senderId: user.id,
        senderUsername: user.username,
        content,
        encryptedContent: content,
        timestamp: new Date().toISOString(),
        iv: 'not-encrypted',
      };

      // Add message to local state immediately
      setMessages(prev => [...prev, message]);

      // Send message via Socket.IO to other participants
      socketService.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createRoom = async (name: string, maxParticipants: number): Promise<ChatRoom> => {
    if (!user) throw new Error('User not authenticated');

    const result = await ChatService.createRoom(name, maxParticipants, user.id);
    if (!result.success || !result.room) {
      throw new Error(result.error || 'Failed to create room');
    }

    return result.room;
  };

  const generateInviteLink = (roomId: string): string => {
    if (!currentRoom) throw new Error('Room not found');
    
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?invite=${currentRoom.inviteCode}`;
  };

  return (
    <ChatContext.Provider
      value={{
        currentRoom,
        messages,
        participants,
        joinRoom,
        leaveRoom,
        sendMessage,
        createRoom,
        generateInviteLink,
        isTyping,
        setIsTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};