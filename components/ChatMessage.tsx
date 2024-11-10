import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import { useEffect, useRef, useState } from 'react';
import type { Components } from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

interface CodeComponentProps {
  className?: string;
  children?: React.ReactNode;
  node?: any;
  [key: string]: any;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
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
          <div className="relative">
            <pre className="relative overflow-x-auto p-4 bg-gray-800 rounded-lg mt-2">
              <div className="absolute right-2 top-2">
                <button
                  onClick={() => handleCopy(String(children))}
                  className="rounded px-2 py-1 text-xs 
                            bg-gray-700 hover:bg-gray-600 
                            text-gray-300 hover:text-white
                            transition-all duration-200
                            shadow-lg"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="pt-6">
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            </pre>
          </div>
        );
      }

      return <code className={className} {...props}>{children}</code>;
    }
  };

  return (
    <div
      ref={messageRef}
      className={clsx(
        'flex w-full items-start gap-4 p-4',
        role === 'assistant' && 'bg-gray-50 dark:bg-gray-800'
      )}
    >
      <div className="flex-1">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown components={components}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
} 