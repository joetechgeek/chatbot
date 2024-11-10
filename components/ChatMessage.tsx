import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={clsx(
        'flex w-full items-start gap-4 p-4',
        role === 'assistant' && 'bg-gray-50 dark:bg-gray-800'
      )}
    >
      <div className="flex-1">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
} 