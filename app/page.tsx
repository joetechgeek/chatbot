'use client';

import { useChat } from 'ai/react';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { Message } from 'ai';
import { useEffect, useRef } from 'react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 mb-24 overflow-y-auto">
        {messages.map((message: Message, i: number) => (
          <ChatMessage 
            key={i} 
            role={message.role as "user" | "assistant"} 
            content={message.content} 
          />
        ))}
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Send a message to start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
