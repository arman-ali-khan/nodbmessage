import React, { useState } from 'react';
import { Plus, Hash, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useRouter } from '../../hooks/useRouter';
import { ChatService } from '../../services/chatService';

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { createRoom } = useChat();
  const { navigateToRoom } = useRouter();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    maxParticipants: 10
  });
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreateRoom = async () => {
    if (!newRoomData.name.trim()) return;

    try {
      const newRoom = await createRoom(newRoomData.name, newRoomData.maxParticipants);
      setShowCreateRoom(false);
      setNewRoomData({ name: '', maxParticipants: 10 });
      navigateToRoom(newRoom.id);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) return;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(joinRoomId.trim())) {
      setJoinError('Invalid room ID format');
      return;
    }

    setJoinError('');
    try {
      // Check if room exists
      const room = await ChatService.getRoomById(joinRoomId.trim());
      if (!room) {
        setJoinError('Room not found');
        return;
      }

      // Check if room is full
      if (room.participants.length >= room.maxParticipants && !room.participants.includes(user!.id)) {
        setJoinError('Room is full');
        return;
      }

      setShowJoinRoom(false);
      setJoinRoomId('');
      navigateToRoom(joinRoomId.trim());
    } catch (error) {
      console.error('Failed to join room:', error);
      setJoinError('Failed to join room');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">SecureChat</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Start Chatting Securely
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create a new chat room or join an existing one. All messages are encrypted end-to-end for your privacy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Create Room Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Create New Room
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start a new encrypted chat room and invite others to join
            </p>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Create Room
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Join Room
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Enter a room ID to join an existing chat room
            </p>
            <button
              onClick={() => setShowJoinRoom(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
            Why Choose SecureChat?
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">🔒</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">End-to-End Encryption</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your messages are encrypted and only you and your chat partners can read them
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 dark:text-orange-400 text-xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Messaging</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Messages are delivered instantly with live updates across all devices
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-teal-600 dark:text-teal-400 text-xl">👥</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Group Chats</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create rooms for up to 50 participants with easy invite links
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Dialog */}
      {showCreateRoom && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCreateRoom(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Room</h3>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ×
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowJoinRoom(false);
              setJoinRoomId('');
              setJoinError('');
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
                  ×
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
    </div>
  );
};