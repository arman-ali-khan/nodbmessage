import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from './useRouter';
import { ChatService } from '../services/chatService';

export const useInviteHandler = () => {
  const { user } = useAuth();
  const { navigateToRoom, isRoomPath } = useRouter();

  useEffect(() => {
    const handleInviteFromUrl = async () => {
      if (!user) return;

      // Skip invite handling if already on a room path
      if (isRoomPath) return;

      const urlParams = new URLSearchParams(window.location.search);
      const inviteCode = urlParams.get('invite');
      
      if (inviteCode) {
        // Find room by invite code
        const room = await ChatService.getRoomByInviteCode(inviteCode);
        
        if (room) {
          // Check if room is not full
          if (room.participants.length < room.maxParticipants || room.participants.includes(user.id)) {
            // Navigate to room page and clear invite from URL
            navigateToRoom(room.id);
            // Clear the invite parameter from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('invite');
            window.history.replaceState({}, '', newUrl.toString());
          } else {
            console.error('Room is full');
            // You might want to show a modal or notification here
          }
        } else {
          console.error('Invalid invite code');
          // You might want to show a modal or notification here
        }
      }
    };

    handleInviteFromUrl();
  }, [user, navigateToRoom, isRoomPath]);
};