import React from 'react';
import { AlertCircle, Loader2, Trophy } from 'lucide-react';
import { BenchmarkSessionState, NodeConfig, NodeSlotId } from '../t3s/types';
import { formatDuration, PROVIDER_META } from '../u3s/verdictUtils';
import { MarkdownView } from './MarkdownView';

interface DebateArenaProps {
  session: BenchmarkSessionState;
  nodes: Record<NodeSlotId, NodeConfig>;
}

export const DebateArena: React.FC<DebateArenaProps> = ({ session, nodes }) => {
  if (!session.prompt) {
    return null;
  }

  const isModel1Winner = session.decision?.winner === 'Model 1';
  const isModel2Winner = session.decision?.winner === 'Model 2';

  const model1Id = session.model1.model || nodes.model1.selectedModel;
  const model2Id = session.model2.model || nodes.model2.selectedModel;
  const judgeId = session.judge.model || nodes.judge.selectedModel;

  return (
    <section className="space-y-5 pb-16">
      {/* TOP/CENTER FULL-WIDTH VERDICT CARD (MODEL 03 — THE JUDGE) */}
      <div className="rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#D0D7DE] dark:border-[#30363D] overflow-hidden">
        {/* Prominent High-Contrast Winner Banner at the Very Top */}
        {session.judge.status === 'completed' && session.decision ? (
          <div className="px-5 py-4 bg-[#1F2328] dark:bg-[#F0F6FC] text-[#FFFFFF] dark:text-[#0D1117] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-lg leading-none" role="img" aria-label="trophy">
                🏆
              </span>
              <h2 className="font-mono text-sm sm:text-base font-bold tracking-wider uppercase">
                WINNER: {session.decision.winner.toUpperCase()} (
                {session.decision.winnerModelName})
              </h2>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] opacity-80">
              <span>JUDGE 03: {judgeId}</span>
              <span>•</span>
              <span>
                {formatDuration(
                  session.judge.startedAt,
                  session.judge.completedAt
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2]/70 dark:bg-[#0D1117]/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]">
                JUDGE 03
              </span>
              <span className="font-mono text-xs text-[#57606A] dark:text-[#8B949E]">
                {PROVIDER_META[session.judge.provider || nodes.judge.provider].label}{' '}
                / {judgeId}
              </span>
            </div>

            <div className="font-mono text-xs text-[#57606A] dark:text-[#8B949E]">
              {session.judge.status === 'idle' &&
                session.isRunning &&
                'WAITING FOR CONTENDERS...'}
              {session.judge.status === 'running' && (
                <span className="inline-flex items-center gap-1.5 text-[#1F2328] dark:text-[#F0F6FC] font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  EVALUATING MODEL 01 VS MODEL 02...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Judge Reasoning Body */}
        <div className="p-5">
          {session.judge.status === 'idle' && session.isRunning && (
            <p className="font-mono text-xs text-[#57606A] dark:text-[#8B949E]">
              Judge 03 ({judgeId}) will automatically evaluate both responses as
              soon as Model 01 and Model 02 complete their independent answers.
            </p>
          )}

          {session.judge.status === 'running' && (
            <div className="py-4 flex items-center gap-3 font-mono text-xs text-[#1F2328] dark:text-[#F0F6FC]">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>
                Comparing accuracy, depth, clarity, and code quality across both
                contenders...
              </span>
            </div>
          )}

          {session.judge.status === 'error' && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 font-mono text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">JUDGE EVALUATION ERROR</div>
                <div className="mt-0.5">{session.judge.error}</div>
              </div>
            </div>
          )}

          {session.judge.status === 'completed' && session.decision && (
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#57606A] dark:text-[#8B949E] mb-1.5">
                VERDICT REASONING
              </div>
              <p className="text-sm sm:text-[15px] leading-relaxed text-[#1F2328] dark:text-[#F0F6FC]">
                {session.decision.reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SIDE-BY-SIDE CONTENDER CARDS (MODEL 01 & MODEL 02) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* MODEL 01 (Contender A) */}
        <div
          className={`rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] overflow-hidden transition-all ${
            isModel1Winner
              ? 'border-2 border-[#1F2328] dark:border-[#F0F6FC] shadow-sm'
              : 'border border-[#D0D7DE] dark:border-[#30363D]'
          }`}
        >
          <div className="px-4 py-3 border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2]/60 dark:bg-[#0D1117]/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]">
                MODEL 01
              </span>
              <span className="font-mono text-xs font-medium text-[#1F2328] dark:text-[#F0F6FC]">
                {model1Id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isModel1Winner && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]">
                  <Trophy className="w-3 h-3" />
                  WINNER
                </span>
              )}

              {session.model1.status === 'running' && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#57606A] dark:text-[#8B949E]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  GENERATING...
                </span>
              )}

              {session.model1.status === 'completed' && (
                <span className="font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]">
                  {formatDuration(
                    session.model1.startedAt,
                    session.model1.completedAt
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {session.model1.status === 'running' && (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-2 font-mono text-xs text-[#57606A] dark:text-[#8B949E]">
                <Loader2 className="w-5 h-5 animate-spin text-[#1F2328] dark:text-[#F0F6FC]" />
                <span>Generating independent response from {model1Id}...</span>
              </div>
            )}

            {session.model1.status === 'error' && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 font-mono text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">MODEL 01 ERROR</div>
                  <div className="mt-0.5">{session.model1.error}</div>
                </div>
              </div>
            )}

            {session.model1.status === 'completed' && (
              <MarkdownView content={session.model1.content} />
            )}
          </div>
        </div>

        {/* MODEL 02 (Contender B) */}
        <div
          className={`rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] overflow-hidden transition-all ${
            isModel2Winner
              ? 'border-2 border-[#1F2328] dark:border-[#F0F6FC] shadow-sm'
              : 'border border-[#D0D7DE] dark:border-[#30363D]'
          }`}
        >
          <div className="px-4 py-3 border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2]/60 dark:bg-[#0D1117]/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]">
                MODEL 02
              </span>
              <span className="font-mono text-xs font-medium text-[#1F2328] dark:text-[#F0F6FC]">
                {model2Id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isModel2Winner && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]">
                  <Trophy className="w-3 h-3" />
                  WINNER
                </span>
              )}

              {session.model2.status === 'running' && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#57606A] dark:text-[#8B949E]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  GENERATING...
                </span>
              )}

              {session.model2.status === 'completed' && (
                <span className="font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]">
                  {formatDuration(
                    session.model2.startedAt,
                    session.model2.completedAt
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {session.model2.status === 'running' && (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-2 font-mono text-xs text-[#57606A] dark:text-[#8B949E]">
                <Loader2 className="w-5 h-5 animate-spin text-[#1F2328] dark:text-[#F0F6FC]" />
                <span>Generating independent response from {model2Id}...</span>
              </div>
            )}

            {session.model2.status === 'error' && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 font-mono text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">MODEL 02 ERROR</div>
                  <div className="mt-0.5">{session.model2.error}</div>
                </div>
              </div>
            )}

            {session.model2.status === 'completed' && (
              <MarkdownView content={session.model2.content} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
