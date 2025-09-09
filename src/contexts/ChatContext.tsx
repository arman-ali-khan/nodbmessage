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

  // Connect to socket when user is available
  useEffect(() => {
    if (user) {
      socketService.connect(user.id, user.username);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // Listen for real-time messages
  useEffect(() => {
    if (!currentRoom) return;

    const handleMessage = (message: Message) => {
      if (message.roomId === currentRoom.id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleUserJoined = (data: { userId: string; username: string }) => {
      // Refresh participants when someone joins
      if (currentRoom) {
        loadParticipants(currentRoom);
      }
    };

    const handleUserLeft = (data: { userId: string; username: string }) => {
      // Refresh participants when someone leaves
      if (currentRoom) {
        loadParticipants(currentRoom);
      }
    };

    socketService.onMessage(handleMessage);
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);
    socketService.joinRoom(currentRoom.id);

    return () => {
      socketService.offMessage();
      socketService.offUserJoined();
      socketService.offUserLeft();
      socketService.leaveRoom(currentRoom.id);
    };
  }, [currentRoom]);

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
      setMessages([]); // Clear messages for new room
      loadParticipants(room);

      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  };

  const leaveRoom = () => {
    if (currentRoom && user) {
      socketService.leaveRoom(currentRoom.id);
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
        encryptedContent: '', // Not used for real-time messaging
        timestamp: new Date().toISOString(),
        iv: '', // Not used for real-time messaging
      };

      // Send message via Socket.IO
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