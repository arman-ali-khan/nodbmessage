import React, { useState } from 'react';
import { Info, Sun, Moon, LogOut, AlertTriangle, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { InfoDrawer } from './InfoDrawer';

export const ChatWindow: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentRoom, participants, leaveRoom, createRoom, joinRoom } = useChat();
  const { theme, toggleTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    maxParticipants: 10
  });

  const handleLeave = () => {
    leaveRoom();
  };

  const handleCreateRoom = async () => {
    if (!newRoomData.name.trim()) return;

    try {
      const newRoom = await createRoom(newRoomData.name, newRoomData.maxParticipants);
      // Auto-join the newly created room
      await joinRoom(newRoom.id);
      setShowCreateRoom(false);
      setNewRoomData({ name: '', maxParticipants: 10 });
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Active Chat</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Join a room using an invite link or create a new room to start chatting.</p>
          
          <button
            onClick={() => setShowCreateRoom(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Room</span>
          </button>
          
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentRoom.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>

            <button
              onClick={handleLeave}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Leave Room"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
        <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium">
            Closing this window will delete all messages permanently.
          </p>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList />
        <MessageInput />
      </div>

      {/* Info Drawer */}
      <InfoDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};