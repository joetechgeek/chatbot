import { FormEvent, ChangeEvent, useRef } from 'react';
import { ChatRequestOptions } from 'ai';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions) => void;
  isLoading: boolean;
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex gap-4">
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const form = e.currentTarget.form;
              if (form) {
                form.requestSubmit();
              }
            }
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
} 