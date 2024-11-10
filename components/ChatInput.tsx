import { FormEvent, ChangeEvent, useRef, useState } from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { useSupabase } from './providers/SupabaseProvider';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>, files?: File[]) => void;
  isLoading: boolean;
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e, attachments);
    setAttachments([]);
    setUploadProgress(0);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={onSubmit} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        {attachments.length > 0 && (
          <div className="mb-2 flex gap-2 flex-wrap">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
              >
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                  className="text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full h-1 bg-gray-200 rounded">
                <div 
                  className="h-full bg-blue-500 rounded" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleFileClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>
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
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </form>
  );
} 