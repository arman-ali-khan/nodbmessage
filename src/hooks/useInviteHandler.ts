import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { StorageService } from '../utils/storage';

export const useInviteHandler = () => {
  const { user } = useAuth();
  const { joinRoom } = useChat();

  useEffect(() => {
    const handleInviteFromUrl = async () => {
      if (!user) return;

      const urlParams = new URLSearchParams(window.location.search);
      const inviteCode = urlParams.get('invite');
      
      if (inviteCode) {
        // Find room by invite code
        const room = StorageService.getRoomByInviteCode(inviteCode);
        
        if (room) {
          // Check if room is not full
          if (room.participants.length < room.maxParticipants || room.participants.includes(user.id)) {
            const success = await joinRoom(room.id);
            if (success) {
              // Clear invite from URL without reloading
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              console.error('Failed to join room');
            }
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
  }, [user, joinRoom]);
};