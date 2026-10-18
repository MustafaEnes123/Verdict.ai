export type AIProvider = 'openai' | 'anthropic' | 'gemini';

export type NodeSlotId = 'model1' | 'model2' | 'judge';

export interface ModelOption {
  id: string;
  displayName: string;
}

export interface NodeConfig {
  slotId: NodeSlotId;
  codeLabel: string;
  roleTitle: string;
  provider: AIProvider;
  apiKey: string;
  models: ModelOption[];
  selectedModel: string;
  isFetchingModels: boolean;
  fetchError: string | null;
  isConnected: boolean;
}

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'error';

export interface NodeExecutionState {
  status: ExecutionStatus;
  content: string;
  error: string | null;
  startedAt: number | null;
  completedAt: number | null;
  provider?: AIProvider;
  model?: string;
}

export type WinnerChoice = 'Model 1' | 'Model 2';

export interface JudgeDecision {
  winner: WinnerChoice;
  winnerModelName: string;
  reason: string;
}

export interface BenchmarkSessionState {
  prompt: string;
  isRunning: boolean;
  model1: NodeExecutionState;
  model2: NodeExecutionState;
  judge: NodeExecutionState;
  decision: JudgeDecision | null;
}
