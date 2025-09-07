import React, { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from '../../utils/dateUtils';

export const MessageList: React.FC = () => {
  const { messages } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No messages yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Send the first message to start the conversation
            </p>
          </div>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.senderId === user?.id;
          const timestamp = new Date(message.timestamp);
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                }`}
              >
                {!isOwnMessage && (
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {message.senderUsername}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwnMessage
                      ? 'text-blue-100'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {formatDistanceToNow(timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};