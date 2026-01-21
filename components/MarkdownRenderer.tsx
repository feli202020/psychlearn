'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm md:prose-base max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Überschriften
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-4 pb-2 border-b border-border">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-foreground mt-6 mb-3 pb-1 border-b border-border/50">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
              {children}
            </h3>
          ),
          // Paragraphen
          p: ({ children }) => (
            <p className="text-foreground/80 leading-relaxed mb-3">
              {children}
            </p>
          ),
          // Listen
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-4 text-foreground/80">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-4 text-foreground/80">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground/80">
              {children}
            </li>
          ),
          // Tabellen
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-border rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-foreground border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-foreground/80 border-b border-border/50">
              {children}
            </td>
          ),
          // Inline-Formatierung
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/80">
              {children}
            </em>
          ),
          // Code
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                {children}
              </code>
            );
          },
          // Horizontale Linie
          hr: () => (
            <hr className="my-6 border-border" />
          ),
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-1 my-4 bg-primary/5 rounded-r-lg">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
