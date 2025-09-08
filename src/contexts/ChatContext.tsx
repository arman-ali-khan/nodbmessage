import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatRoom, Message, User, ChatContextType } from '../types';
import { StorageService } from '../utils/storage';
import { EncryptionService } from '../utils/encryption';
import { useAuth } from './AuthContext';
import { ChatService } from '../services/chatService';
import { AuthService } from '../services/authService';

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

  // Listen for storage changes to sync messages across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('chat_messages_') && currentRoom) {
        const roomId = e.key.replace('chat_messages_', '');
        if (roomId === currentRoom.id) {
          loadMessages(currentRoom.id);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentRoom]);

  // Auto-refresh messages
  useEffect(() => {
    if (!currentRoom) return;

    const interval = setInterval(() => {
      loadMessages(currentRoom.id);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom]);

  const loadMessages = async (roomId: string) => {
    const storedMessages = StorageService.getMessages(roomId);
    const roomKey = StorageService.getRoomKey(roomId);
    
    if (!roomKey) return;

    try {
      const cryptoKey = await EncryptionService.importKey(roomKey);
      const decryptedMessages = await Promise.all(
        storedMessages.map(async (msg) => {
          try {
            const decryptedContent = await EncryptionService.decrypt(
              msg.encryptedContent,
              cryptoKey,
              msg.iv
            );
            return { ...msg, content: decryptedContent };
          } catch (error) {
            console.error('Error decrypting message:', error);
            return { ...msg, content: '[Decryption failed]' };
          }
        })
      );
      
      setMessages(decryptedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

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

      // Generate or get room encryption key
      let roomKeyString = StorageService.getRoomKey(roomId);
      if (!roomKeyString) {
        const roomKey = await EncryptionService.generateKey();
        roomKeyString = await EncryptionService.exportKey(roomKey);
        StorageService.saveRoomKey(roomId, roomKeyString);
      }

      setCurrentRoom(room);
      loadParticipants(room);
      await loadMessages(roomId);

      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  };

  const leaveRoom = () => {
    if (currentRoom && user) {
      // Leave room in Supabase
      ChatService.leaveRoom(currentRoom.id, user.id);
    }
    
    setCurrentRoom(null);
    setMessages([]);
    setParticipants([]);
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!currentRoom || !user) return;

    try {
      const roomKeyString = StorageService.getRoomKey(currentRoom.id);
      if (!roomKeyString) throw new Error('Room key not found');

      const roomKey = await EncryptionService.importKey(roomKeyString);
      const { encrypted, iv } = await EncryptionService.encrypt(content, roomKey);

      const message: Message = {
        id: StorageService.generateId(),
        roomId: currentRoom.id,
        senderId: user.id,
        senderUsername: user.username,
        content, // Keep unencrypted for local display
        encryptedContent: encrypted,
        timestamp: new Date().toISOString(),
        iv,
      };

      StorageService.saveMessage(message);
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: `chat_messages_${currentRoom.id}`,
        newValue: JSON.stringify([...messages, message]),
      }));

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

    // Generate room encryption key
    const roomKey = await EncryptionService.generateKey();
    const roomKeyString = await EncryptionService.exportKey(roomKey);
    StorageService.saveRoomKey(result.room.id, roomKeyString);

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