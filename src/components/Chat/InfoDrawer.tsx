import React, { useState } from 'react';
import { X, Users, Share, Copy, Check } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useRouter } from '../../hooks/useRouter';

interface InfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoDrawer: React.FC<InfoDrawerProps> = ({ isOpen, onClose }) => {
  const { currentRoom, participants, generateInviteLink } = useChat();
  const { navigateToHome } = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = async () => {
    if (!currentRoom) return;

    try {
      const inviteLink = generateInviteLink(currentRoom.id);
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite link:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Info</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Back to Home Button */}
            <div>
              <button
                onClick={navigateToHome}
                className="flex items-center space-x-2 w-full p-3 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-medium">← Back to Home</span>
              </button>
            </div>

            {/* Room Info */}
            <div>
              <>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Current Room</h3>
              {currentRoom && (
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Name:</strong> {currentRoom.name}</p>
                    <p><strong>ID:</strong> {currentRoom.id}</p>
                    <p><strong>Code:</strong> {currentRoom.inviteCode}</p>
                    <p><strong>Participants:</strong> {participants.length}/{currentRoom.maxParticipants}</p>
                  </div>
              )}
              </>
            </div>

            {/* Participants */}
            <div>
              {currentRoom && (
                <>
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Participants ({participants.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {participant.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {participant.username}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Invite Link */}
            <div>
              {currentRoom && (
                <>
                  <div className="flex items-center space-x-2 mb-3">
                    <Share className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Invite Others</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Share this link to invite others to join this chat room:
                    </p>
                    
                    <button
                      onClick={handleCopyInvite}
                      className="w-full flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-600 dark:text-green-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Copy Invite Link</span>
                        </>
                      )}
                    </button>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <p>• Link expires when room is full</p>
                      <p>• Maximum {currentRoom.maxParticipants} participants</p>
                      <p>• Messages are encrypted end-to-end</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};