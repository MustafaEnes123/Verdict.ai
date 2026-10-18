import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface TopHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 dark:bg-[#161B22]/95 backdrop-blur-md border-b border-[#D0D7DE] dark:border-[#30363D] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base font-bold tracking-[0.12em] text-[#1F2328] dark:text-[#F0F6FC]">
            VERDICT.AI
          </span>
          <span className="h-3.5 w-[1px] bg-[#D0D7DE] dark:bg-[#30363D]" />
          <span className="font-mono text-[11px] tracking-wider uppercase px-2 py-0.5 rounded bg-[#F6F5F2] dark:bg-[#0D1117] text-[#57606A] dark:text-[#8B949E] border border-[#D0D7DE] dark:border-[#30363D]">
            INDEPENDENT MODEL BENCHMARK
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-medium bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] border border-[#D0D7DE] dark:border-[#30363D] hover:border-[#1F2328] dark:hover:border-[#8B949E] transition-colors"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#F0F6FC]" />
              <span>LIGHT</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#1F2328]" />
              <span>DARK</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
