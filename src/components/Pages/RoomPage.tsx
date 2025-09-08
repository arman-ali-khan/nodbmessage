import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useRouter } from '../../hooks/useRouter';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatWindow } from '../Chat/ChatWindow';
import { StorageService } from '../../utils/storage';

export const RoomPage: React.FC = () => {
  const { params, navigateToHome } = useRouter();
  const { joinRoom, currentRoom } = useChat();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRoomJoin = async () => {
      if (!params.roomId || !user) {
        setError('Invalid room or user not authenticated');
        setIsJoining(false);
        return;
      }

      try {
        // Check if room exists
        const room = StorageService.getRoomById(params.roomId);
        if (!room) {
          setError('Room not found');
          setIsJoining(false);
          return;
        }

        // Check if room is full
        if (room.participants.length >= room.maxParticipants && !room.participants.includes(user.id)) {
          setError('Room is full');
          setIsJoining(false);
          return;
        }

        // Try to join the room
        const success = await joinRoom(params.roomId);
        if (!success) {
          setError('Failed to join room');
        }
      } catch (err) {
        console.error('Error joining room:', err);
        setError('An error occurred while joining the room');
      } finally {
        setIsJoining(false);
      }
    };

    handleRoomJoin();
  }, [params.roomId, user, joinRoom]);

  if (isJoining) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error || !currentRoom) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Unable to Join Room
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {error || 'The room you\'re trying to join is not available.'}
          </p>
          <button
            onClick={navigateToHome}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    );
  }

  return <ChatWindow />;
};