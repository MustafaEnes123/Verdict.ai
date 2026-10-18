import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlockSnippet: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2] dark:bg-[#0D1117]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#EBEAE6] dark:bg-[#161B22] border-b border-[#D0D7DE] dark:border-[#30363D] font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider font-semibold">
            {language || 'code'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FFFFFF] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] border border-[#D0D7DE] dark:border-[#30363D] hover:opacity-80 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs leading-relaxed font-mono text-[#1F2328] dark:text-[#F0F6FC] overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function renderInlineFormatting(text: string): React.ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] font-mono text-[0.88em] border border-[#D0D7DE] dark:border-[#30363D]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong
          key={idx}
          className="font-semibold text-[#1F2328] dark:text-[#F0F6FC]"
        >
          {token.slice(2, -2)}
        </strong>
      );
    }
    return token;
  });
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  if (!content) return null;

  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-[#1F2328] dark:text-[#E6EDF3]">
      {segments.map((segment, segIdx) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const lines = segment.slice(3, -3).split('\n');
          const firstLine = (lines[0] || '').trim();
          const codeBody = lines.slice(1).join('\n').replace(/\n$/, '');
          return (
            <CodeBlockSnippet
              key={segIdx}
              language={firstLine}
              code={codeBody}
            />
          );
        }

        const lines = segment.split('\n');
        return (
          <div key={segIdx} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <div key={lineIdx} className="h-1" />;
              }

              if (trimmed.startsWith('### ')) {
                return (
                  <h4
                    key={lineIdx}
                    className="text-sm font-bold text-[#1F2328] dark:text-[#F0F6FC] pt-2"
                  >
                    {renderInlineFormatting(trimmed.slice(4))}
                  </h4>
                );
              }

              if (trimmed.startsWith('## ')) {
                return (
                  <h3
                    key={lineIdx}
                    className="text-base font-bold text-[#1F2328] dark:text-[#F0F6FC] pt-2"
                  >
                    {renderInlineFormatting(trimmed.slice(3))}
                  </h3>
                );
              }

              if (trimmed.startsWith('# ')) {
                return (
                  <h2
                    key={lineIdx}
                    className="text-lg font-bold text-[#1F2328] dark:text-[#F0F6FC] pt-2.5"
                  >
                    {renderInlineFormatting(trimmed.slice(2))}
                  </h2>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2.5 pl-1">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#57606A] dark:bg-[#8B949E] shrink-0" />
                    <span className="flex-1">
                      {renderInlineFormatting(trimmed.slice(2))}
                    </span>
                  </div>
                );
              }

              const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
              if (numberedMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2.5 pl-1">
                    <span className="font-mono font-semibold text-[#57606A] dark:text-[#8B949E] text-xs mt-0.5 min-w-[1.25rem]">
                      {numberedMatch[1]}.
                    </span>
                    <span className="flex-1">
                      {renderInlineFormatting(numberedMatch[2])}
                    </span>
                  </div>
                );
              }

              return (
                <p key={lineIdx} className="leading-relaxed">
                  {renderInlineFormatting(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
