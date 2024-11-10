import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

interface Attachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  created_at?: string;
}

interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
  attachments?: Attachment[]
}

interface Chat {
  id?: string
  title: string
  messages: ChatMessage[]
  created_at?: string
  updated_at?: string
}

interface ChatStore {
  chats: Chat[]
  currentChat: Chat | null
  isLoading: boolean
  createChat: (supabase: SupabaseClient<Database>, title: string) => Promise<Chat>
  addMessage: (supabase: SupabaseClient<Database>, message: ChatMessage) => Promise<void>
  loadChats: (supabase: SupabaseClient<Database>) => Promise<void>
  setCurrentChat: (chatId: string) => void
  deleteChat: (supabase: SupabaseClient<Database>, chatId: string) => Promise<void>
  ensureChat: (supabase: SupabaseClient<Database>) => Promise<Chat>
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChat: null,
      isLoading: false,

      createChat: async (supabase, title) => {
        set({ isLoading: true })

        try {
          const { data: chat, error } = await supabase
            .from('chats')
            .insert([{ title }])
            .select()
            .single()

          if (error) throw error

          const newChat = { ...chat, messages: [] }
          set((state) => ({
            chats: [newChat, ...state.chats],
            currentChat: newChat,
          }))

          return newChat
        } catch (error) {
          console.error('Error creating chat:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      addMessage: async (supabase, message) => {
        const { currentChat } = get()
        if (!currentChat?.id) return

        try {
          const { data, error } = await supabase
            .from('messages')
            .insert([
              {
                chat_id: currentChat.id,
                role: message.role,
                content: message.content,
              },
            ])
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            currentChat: state.currentChat ? {
              ...state.currentChat,
              messages: [...state.currentChat.messages, data as ChatMessage],
            } : null,
          }))
        } catch (error) {
          console.error('Error adding message:', error)
        }
      },

      loadChats: async (supabase) => {
        set({ isLoading: true })

        try {
          const { data: chats, error } = await supabase
            .from('chats')
            .select('*, messages(*)')
            .order('created_at', { ascending: false })

          if (error) throw error

          set({ chats: chats as Chat[] })
        } catch (error) {
          console.error('Error loading chats:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      setCurrentChat: (chatId) => {
        const { chats } = get()
        const chat = chats.find((c) => c.id === chatId)
        if (chat) {
          set({ currentChat: chat })
        }
      },

      deleteChat: async (supabase, chatId) => {
        try {
          const { error } = await supabase
            .from('chats')
            .delete()
            .eq('id', chatId)

          if (error) throw error

          set((state) => ({
            chats: state.chats.filter((chat) => chat.id !== chatId),
            currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
          }))
        } catch (error) {
          console.error('Error deleting chat:', error)
        }
      },

      ensureChat: async (supabase) => {
        const { currentChat } = get()
        if (!currentChat) {
          return await get().createChat(supabase, 'New Chat')
        }
        return currentChat
      },
    }),
    {
      name: 'chat-storage',
    }
  )
) 