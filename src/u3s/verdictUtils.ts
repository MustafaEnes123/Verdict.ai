import { AIProvider, JudgeDecision, WinnerChoice } from '../t3s/types';

export const PROVIDER_META: Record<
  AIProvider,
  { label: string; fullName: string; placeholder: string }
> = {
  openai: {
    label: 'OpenAI',
    fullName: 'OpenAI',
    placeholder: 'sk-proj-...',
  },
  anthropic: {
    label: 'Claude',
    fullName: 'Anthropic Claude',
    placeholder: 'sk-ant-api03-...',
  },
  gemini: {
    label: 'Gemini',
    fullName: 'Google Gemini',
    placeholder: 'AIzaSy...',
  },
};

export function parseJudgeDecision(
  rawText: string,
  model1Name: string,
  model2Name: string
): JudgeDecision {
  const trimmed = rawText.trim();

  // Strip optional ```json ... ``` wrapper
  const cleanedJsonCandidate = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  // Try extracting JSON object if present anywhere in the response
  const jsonBlockMatch = cleanedJsonCandidate.match(/\{[\s\S]*\}/);
  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[0]);
      const rawWinner = String(parsed.winner || '').toLowerCase();
      const winner: WinnerChoice =
        rawWinner.includes('2') || rawWinner.includes('contender b')
          ? 'Model 2'
          : 'Model 1';
      const reason =
        typeof parsed.reason === 'string' && parsed.reason.trim().length > 0
          ? parsed.reason.trim()
          : trimmed;

      return {
        winner,
        winnerModelName: winner === 'Model 1' ? model1Name : model2Name,
        reason,
      };
    } catch {
      // Fall through to regex extraction
    }
  }

  // Fallback regex parsing if model returned plain text instead of strict JSON
  const winnerMatch = trimmed.match(
    /(?:winner|winning\s*model)["'\s:]*?(model\s*1|model\s*2)/i
  );
  const winner: WinnerChoice =
    winnerMatch && winnerMatch[1].toLowerCase().includes('2')
      ? 'Model 2'
      : 'Model 1';

  const reasonMatch = trimmed.match(/(?:reason|explanation)["'\s:]+([\s\S]+)$/i);
  const reason = reasonMatch
    ? reasonMatch[1].replace(/[}"'\s]+$/, '').trim()
    : trimmed;

  return {
    winner,
    winnerModelName: winner === 'Model 1' ? model1Name : model2Name,
    reason,
  };
}

export function formatDuration(
  startedAt: number | null,
  completedAt: number | null
): string {
  if (!startedAt) return '';
  const end = completedAt ?? Date.now();
  const diffSec = Math.max(0.1, (end - startedAt) / 1000);
  return `${diffSec.toFixed(1)}s`;
}
