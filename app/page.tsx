'use client';

export const dynamic = 'force-dynamic';

import { useChat } from 'ai/react';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatSidebar } from '@/components/ChatSidebar';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/providers/SupabaseAuthProvider';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { useChatStore } from '@/lib/store/chat';
import Link from 'next/link';
import { Message } from 'ai';
import { Bars3Icon } from '@heroicons/react/24/outline';

// Extend the Message type to include attachments
interface ExtendedMessage extends Message {
  attachments?: {
    id: string;
    file_name: string;
    file_type: string;
    file_url: string;
  }[];
}

export default function Home() {
  const { session } = useAuth();
  const supabase = useSupabase();
  const { currentChat, addMessage, createChat } = useChatStore();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { messages, input, handleInputChange, handleSubmit: handleAISubmit, isLoading } = useChat({
    api: '/api/chat',
    onFinish: async (message) => {
      // Only save to database if user is authenticated
      if (session && currentChat) {
        await addMessage(supabase, {
          role: 'assistant',
          content: message.content,
        });
      }
    },
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, files?: File[]) => {
    e.preventDefault();
    
    let messageId: string | undefined;

    // Only save to database if user is authenticated
    if (session && currentChat) {
      const { data: message, error } = await supabase
        .from('messages')
        .insert([{
          chat_id: currentChat.id,
          role: 'user',
          content: input,
        }])
        .select()
        .single();

      if (!error && message) {
        messageId = message.id;

        // Upload files if any
        if (files && files.length > 0) {
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('messageId', message.id);

            await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
          }

          // Refresh the chat to get the new message with attachments
          const { data: updatedMessage } = await supabase
            .from('messages')
            .select('*, attachments(*)')
            .eq('id', message.id)
            .single();

          if (updatedMessage) {
            await addMessage(supabase, updatedMessage);
          }
        } else {
          await addMessage(supabase, message);
        }
      }
    }

    // Create a new form event for AI submit
    const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>;
    handleAISubmit(formEvent);
  };

  const handleNewChat = async () => {
    if (session) {
      await createChat(supabase, 'New Chat');
      // Clear the messages UI
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen">
      {session && (
        <ChatSidebar 
          isSidebarOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      )}
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              {session && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
              )}
              <h1 className="text-xl font-semibold">Chat</h1>
            </div>
            {!session && (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 w-full max-w-4xl mx-auto p-4 mb-24 overflow-y-auto">
          {messages.map((message, i) => (
            <ChatMessage 
              key={i} 
              role={message.role as "user" | "assistant"} 
              content={message.content}
              attachments={(message as ExtendedMessage).attachments}
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
    </div>
  );
}
