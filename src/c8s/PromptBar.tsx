import React, { useState } from 'react';
import { CornerDownLeft, Loader2 } from 'lucide-react';

interface PromptBarProps {
  allNodesReady: boolean;
  isRunning: boolean;
  onSubmitPrompt: (prompt: string) => void;
}

export const PromptBar: React.FC<PromptBarProps> = ({
  allNodesReady,
  isRunning,
  onSubmitPrompt,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !allNodesReady || isRunning) return;
    onSubmitPrompt(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (inputText.trim() && allNodesReady && !isRunning) {
        onSubmitPrompt(inputText);
      }
    }
  };

  return (
    <section className="mb-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#D0D7DE] dark:border-[#30363D] focus-within:border-[#1F2328] dark:focus-within:border-[#F0F6FC] transition-colors overflow-hidden"
      >
        <div className="px-4 py-2 border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2]/60 dark:bg-[#0D1117]/60 flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#57606A] dark:text-[#8B949E]">
            PROMPT COMPOSER
          </span>
          <span className="font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]">
            {allNodesReady
              ? 'MODEL 01 ∥ MODEL 02 → JUDGE 03'
              : 'CONFIGURE ALL 3 MODELS ABOVE TO RUN'}
          </span>
        </div>

        <div className="p-4">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder="Enter prompt to benchmark Model 1 and Model 2 head-to-head..."
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-[#1F2328] dark:text-[#F0F6FC] placeholder:text-[#57606A]/60 dark:placeholder:text-[#8B949E]/60 focus:outline-none"
          />

          <div className="mt-3 pt-3 border-t border-[#D0D7DE] dark:border-[#30363D] flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]">
              ⌘/Ctrl + Enter
            </span>

            <button
              type="submit"
              disabled={!allNodesReady || isRunning || !inputText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wide uppercase bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-opacity"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>EXECUTING BENCHMARK...</span>
                </>
              ) : (
                <>
                  <span>RUN BENCHMARK</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
