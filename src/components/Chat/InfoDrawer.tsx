import React, { useState } from 'react';
import { X, Users, Share, Copy, Check, Plus, Hash } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

interface InfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoDrawer: React.FC<InfoDrawerProps> = ({ isOpen, onClose }) => {
  const { currentRoom, participants, generateInviteLink, createRoom, joinRoom } = useChat();
  const [copied, setCopied] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    maxParticipants: 10
  });
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinError, setJoinError] = useState('');

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

  const handleCreateRoom = async () => {
    if (!newRoomData.name.trim()) return;

    try {
      await createRoom(newRoomData.name, newRoomData.maxParticipants);
      setShowCreateRoom(false);
      setNewRoomData({ name: '', maxParticipants: 10 });
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) return;

    setJoinError('');
    try {
      const success = await joinRoom(joinRoomId.trim());
      if (success) {
        setShowJoinRoom(false);
        setJoinRoomId('');
      } else {
        setJoinError('Room not found or room is full');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      setJoinError('Failed to join room');
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
            {/* Action Buttons */}
            <div>
              {/* Create New Room */}
              <button
                onClick={() => setShowCreateRoom(true)}
                className="flex items-center space-x-2 w-full p-3 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create New Room</span>
              </button>

              {/* Join Room by ID */}
              <button
                onClick={() => setShowJoinRoom(true)}
                className="flex items-center space-x-2 w-full p-3 mt-2 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <Hash className="w-5 h-5" />
                <span className="font-medium">Join Room by ID</span>
              </button>
            </div>

            {currentRoom && (
              <>
                {/* Room Info */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Current Room</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Name:</strong> {currentRoom.name}</p>
                    <p><strong>ID:</strong> {currentRoom.id}</p>
                    <p><strong>Code:</strong> {currentRoom.inviteCode}</p>
                    <p><strong>Participants:</strong> {participants.length}/{currentRoom.maxParticipants}</p>
                  </div>
                </div>

                {/* Participants */}
                <div>
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
                </div>

                {/* Invite Link */}
                <div>
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Room Dialog */}
      {showCreateRoom && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-60"
            onClick={() => setShowCreateRoom(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-70 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Room</h3>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter room name"
                    value={newRoomData.name}
                    onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Participants
                  </label>
                  <input
                    type="number"
                    placeholder="Max participants"
                    min="2"
                    max="50"
                    value={newRoomData.maxParticipants}
                    onChange={(e) => setNewRoomData({ ...newRoomData, maxParticipants: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoomData.name.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Create Room
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Join Room Dialog */}
      {showJoinRoom && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-60"
            onClick={() => {
              setShowJoinRoom(false);
              setJoinRoomId('');
              setJoinError('');
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-70 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Join Room</h3>
                <button
                  onClick={() => {
                    setShowJoinRoom(false);
                    setJoinRoomId('');
                    setJoinError('');
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                  {joinError && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2">{joinError}</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowJoinRoom(false);
                    setJoinRoomId('');
                    setJoinError('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinRoomId.trim()}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};