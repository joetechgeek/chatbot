import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import { useEffect, useRef, useState } from 'react';
import type { Components } from 'react-markdown';
import { DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
}

interface CodeComponentProps {
  className?: string;
  children?: React.ReactNode;
  node?: any;
  [key: string]: any;
}

const LlamaIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-6 h-6 text-blue-500"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-4 5.5c2.61 0 4.83-1.67 5.65-4H6.35c.82 2.33 3.04 4 5.65 4z" />
  </svg>
);

const UserIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-6 h-6 text-gray-400"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

export function ChatMessage({ role, content, attachments }: ChatMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const components: Components = {
    code({ className, children, ...props }: CodeComponentProps) {
      const match = /language-(\w+)/.exec(className || '');

      if (props.node?.position?.start?.line) {
        return (
          <div className="relative group">
            <div className="absolute right-4 top-4 z-20">
              <div className="sticky top-4">
                <button
                  onClick={() => handleCopy(String(children))}
                  className="rounded px-2 py-1 text-xs 
                            bg-gray-700/80 hover:bg-gray-600 
                            text-gray-300 hover:text-white
                            transition-all duration-200
                            shadow-lg"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto bg-gray-800 rounded-lg mt-2 p-4">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      }

      return <code className={className} {...props}>{children}</code>;
    }
  };

  const renderAttachment = (attachment: Attachment) => {
    const isImage = attachment.file_type.startsWith('image/');
    
    return (
      <div key={attachment.id} className="mt-2">
        {isImage ? (
          <div className="relative group">
            <img
              src={attachment.file_url}
              alt={attachment.file_name}
              className="max-w-sm rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <a
              href={attachment.file_url}
              download={attachment.file_name}
              className="absolute top-2 right-2 p-2 bg-gray-800/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <PhotoIcon className="w-5 h-5 text-white" />
            </a>
          </div>
        ) : (
          <a
            href={attachment.file_url}
            download={attachment.file_name}
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <DocumentIcon className="w-5 h-5" />
            <span>{attachment.file_name}</span>
          </a>
        )}
      </div>
    );
  };

  return (
    <div
      ref={messageRef}
      className={clsx(
        'p-8',
        role === 'assistant' 
          ? 'bg-gray-50 dark:bg-gray-800/50' 
          : 'bg-blue-50 dark:bg-blue-900/10'
      )}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        <div className="flex-shrink-0 mt-1">
          {role === 'assistant' ? <LlamaIcon /> : <UserIcon />}
        </div>
        <div className="flex-1">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown components={components}>
              {content}
            </ReactMarkdown>
          </div>
          {attachments && attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map(renderAttachment)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 