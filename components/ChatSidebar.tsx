'use client'

import { useSupabase } from './providers/SupabaseProvider'
import { useChatStore } from '@/lib/store/chat'
import { useEffect } from 'react'
import { useAuth } from './providers/SupabaseAuthProvider'
import { PlusIcon, TrashIcon, ArrowRightOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

export function ChatSidebar({ isSidebarOpen, onToggle }: { 
  isSidebarOpen: boolean;
  onToggle: () => void;
}) {
  const supabase = useSupabase()
  const { session } = useAuth()
  const { chats, currentChat, createChat, loadChats, setCurrentChat, deleteChat, isLoading } = useChatStore()

  useEffect(() => {
    if (session) {
      loadChats(supabase)
    }
  }, [session, loadChats, supabase])

  const handleNewChat = async () => {
    await createChat(supabase, 'New Chat')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-50 dark:bg-gray-900 transform transition-transform duration-200 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleNewChat}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              <PlusIcon className="w-5 h-5" />
              New Chat
            </button>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Recent Chats</h2>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={clsx(
                    'group flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
                    currentChat?.id === chat.id && 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  <div
                    className="flex-1 truncate"
                    onClick={() => chat.id && setCurrentChat(chat.id)}
                  >
                    {chat.title}
                  </div>
                  <button
                    onClick={() => chat.id && deleteChat(supabase, chat.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  )
} 