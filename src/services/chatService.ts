import { supabase } from '../lib/supabase';
import { ChatRoom, User } from '../types';
import { StorageService } from '../utils/storage';
import { Message } from '../types';

export class ChatService {
  static async createRoom(name: string, maxParticipants: number, createdBy: string): Promise<{ success: boolean; room?: ChatRoom; error?: string }> {
    try {
      const inviteCode = StorageService.generateInviteCode();

      // Create room in database
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          created_by: createdBy,
          max_participants: maxParticipants,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (roomError) {
        console.error('Room creation error:', roomError);
        return { success: false, error: 'Failed to create room' };
      }

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: roomData.id,
          user_id: createdBy,
        });

      if (participantError) {
        console.error('Participant addition error:', participantError);
        // Try to clean up the room if participant addition fails
        await supabase.from('chat_rooms').delete().eq('id', roomData.id);
        return { success: false, error: 'Failed to join room as creator' };
      }

      const room: ChatRoom = {
        id: roomData.id,
        name: roomData.name,
        createdBy: roomData.created_by,
        participants: [createdBy],
        maxParticipants: roomData.max_participants,
        createdAt: roomData.created_at,
        inviteCode: roomData.invite_code,
      };

      return { success: true, room };
    } catch (error) {
      console.error('Room creation error:', error);
      return { success: false, error: 'Failed to create room' };
    }
  }

  static async getRoomById(roomId: string): Promise<ChatRoom | null> {
    try {
      // Get room data
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError || !roomData) {
        return null;
      }

      // Get participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', roomId);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return null;
      }

      const participants = participantsData.map(p => p.user_id);

      return {
        id: roomData.id,
        name: roomData.name,
        createdBy: roomData.created_by,
        participants,
        maxParticipants: roomData.max_participants,
        createdAt: roomData.created_at,
        inviteCode: roomData.invite_code,
      };
    } catch (error) {
      console.error('Error fetching room:', error);
      return null;
    }
  }

  static async getRoomByInviteCode(inviteCode: string): Promise<ChatRoom | null> {
    try {
      // Get room data
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (roomError || !roomData) {
        return null;
      }

      // Get participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', roomData.id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return null;
      }

      const participants = participantsData.map(p => p.user_id);

      return {
        id: roomData.id,
        name: roomData.name,
        createdBy: roomData.created_by,
        participants,
        maxParticipants: roomData.max_participants,
        createdAt: roomData.created_at,
        inviteCode: roomData.invite_code,
      };
    } catch (error) {
      console.error('Error fetching room by invite code:', error);
      return null;
    }
  }

  static async joinRoom(roomId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if room exists and get current participant count
      const room = await this.getRoomById(roomId);
      if (!room) {
        return { success: false, error: 'Room not found' };
      }

      // Check if user is already a participant
      if (room.participants.includes(userId)) {
        return { success: true }; // Already in room
      }

      // Check if room is full
      if (room.participants.length >= room.maxParticipants) {
        return { success: false, error: 'Room is full' };
      }

      // Add user as participant
      const { error } = await supabase
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: userId,
        });

      if (error) {
        // Check if error is due to user already being a participant (unique constraint violation)
        if (error.code === '23505') {
          // User is already a participant, consider this a success
          return { success: true };
        }
        console.error('Error joining room:', error);
        return { success: false, error: 'Failed to join room' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error joining room:', error);
      return { success: false, error: 'Failed to join room' };
    }
  }

  static async leaveRoom(roomId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error leaving room:', error);
        return { success: false, error: 'Failed to leave room' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error leaving room:', error);
      return { success: false, error: 'Failed to leave room' };
    }
  }

  static async getRoomParticipants(roomId: string): Promise<User[]> {
    try {
      // First, get the user IDs from room_participants
      const { data: participantData, error: participantError } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', roomId);

      if (participantError) {
        console.error('Error fetching room participants:', participantError);
        return [];
      }

      if (!participantData || participantData.length === 0) {
        return [];
      }

      // Extract user IDs
      const userIds = participantData.map(p => p.user_id);

      // Second, get user details for these IDs (excluding password_hash for security)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, email, created_at')
        .in('id', userIds);

      if (userError) {
        console.error('Error fetching user details:', userError);
        return [];
      }

      return userData.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: '', // Don't expose password hash to client
        createdAt: user.created_at,
      }));
    } catch (error) {
      console.error('Error fetching room participants:', error);
      return [];
    }
  }

  static async getMessages(roomId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data.map(msg => ({
        id: msg.id,
        roomId: msg.room_id,
        senderId: msg.sender_id,
        senderUsername: msg.sender_username,
        content: msg.content,
        encryptedContent: msg.encrypted_content,
        timestamp: msg.created_at,
        iv: msg.iv,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  static async saveMessage(message: Message): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: message.id,
          room_id: message.roomId,
          sender_id: message.senderId,
          sender_username: message.senderUsername,
          content: message.content,
          encrypted_content: message.encryptedContent,
          iv: message.iv,
          created_at: message.timestamp,
        });

      if (error) {
        console.error('Error saving message:', error);
        return { success: false, error: 'Failed to save message' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving message:', error);
      return { success: false, error: 'Failed to save message' };
    }
  }
}