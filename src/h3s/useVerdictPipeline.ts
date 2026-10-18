import { useState, useCallback, useEffect } from 'react';
import {
  AIProvider,
  BenchmarkSessionState,
  NodeConfig,
  NodeExecutionState,
  NodeSlotId,
} from '../t3s/types';
import {
  fetchProviderModels,
  generateLiveCompletion,
  SYSTEM_PROMPTS,
  buildJudgeComparisonPrompt,
} from '../s6s/apiService';
import { parseJudgeDecision } from '../u3s/verdictUtils';

const createInitialExecutionState = (): NodeExecutionState => ({
  status: 'idle',
  content: '',
  error: null,
  startedAt: null,
  completedAt: null,
});

const INITIAL_NODES: Record<NodeSlotId, NodeConfig> = {
  model1: {
    slotId: 'model1',
    codeLabel: 'MODEL 01',
    roleTitle: 'Contender A',
    provider: 'openai',
    apiKey: '',
    models: [],
    selectedModel: '',
    isFetchingModels: false,
    fetchError: null,
    isConnected: false,
  },
  model2: {
    slotId: 'model2',
    codeLabel: 'MODEL 02',
    roleTitle: 'Contender B',
    provider: 'anthropic',
    apiKey: '',
    models: [],
    selectedModel: '',
    isFetchingModels: false,
    fetchError: null,
    isConnected: false,
  },
  judge: {
    slotId: 'judge',
    codeLabel: 'MODEL 03',
    roleTitle: 'The Judge',
    provider: 'gemini',
    apiKey: '',
    models: [],
    selectedModel: '',
    isFetchingModels: false,
    fetchError: null,
    isConnected: false,
  },
};

const createInitialSessionState = (): BenchmarkSessionState => ({
  prompt: '',
  isRunning: false,
  model1: createInitialExecutionState(),
  model2: createInitialExecutionState(),
  judge: createInitialExecutionState(),
  decision: null,
});

export function useVerdictPipeline() {
  const [nodes, setNodes] = useState<Record<NodeSlotId, NodeConfig>>(INITIAL_NODES);
  const [session, setSession] = useState<BenchmarkSessionState>(
    createInitialSessionState
  );
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const isNodeReady = (node: NodeConfig): boolean =>
    Boolean(
      node.isConnected &&
        node.apiKey.trim().length > 0 &&
        node.models.length > 0 &&
        node.selectedModel.trim().length > 0
    );

  const allNodesReady =
    isNodeReady(nodes.model1) &&
    isNodeReady(nodes.model2) &&
    isNodeReady(nodes.judge);

  const connectAndLoadModels = useCallback(
    async (
      slotId: NodeSlotId,
      overrideProvider?: AIProvider,
      overrideApiKey?: string
    ) => {
      const currentNode = nodes[slotId];
      const targetProvider = overrideProvider ?? currentNode.provider;
      const targetKey = (overrideApiKey ?? currentNode.apiKey).trim();

      if (!targetKey) {
        setNodes((prev) => ({
          ...prev,
          [slotId]: {
            ...prev[slotId],
            fetchError: 'Enter a valid API key to fetch models.',
            isConnected: false,
            models: [],
            selectedModel: '',
          },
        }));
        return;
      }

      setNodes((prev) => ({
        ...prev,
        [slotId]: {
          ...prev[slotId],
          provider: targetProvider,
          apiKey: targetKey,
          isFetchingModels: true,
          fetchError: null,
        },
      }));

      try {
        const fetchedModels = await fetchProviderModels(targetProvider, targetKey);
        setNodes((prev) => {
          const existingSelected = prev[slotId].selectedModel;
          const stillValid = fetchedModels.some((m) => m.id === existingSelected);
          const defaultModel = stillValid
            ? existingSelected
            : fetchedModels[0]?.id || '';

          return {
            ...prev,
            [slotId]: {
              ...prev[slotId],
              provider: targetProvider,
              apiKey: targetKey,
              models: fetchedModels,
              selectedModel: defaultModel,
              isFetchingModels: false,
              fetchError: null,
              isConnected: fetchedModels.length > 0,
            },
          };
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch live models from provider API.';
        setNodes((prev) => ({
          ...prev,
          [slotId]: {
            ...prev[slotId],
            isFetchingModels: false,
            fetchError: message,
            isConnected: false,
            models: [],
            selectedModel: '',
          },
        }));
      }
    },
    [nodes]
  );

  const setNodeProvider = useCallback(
    (slotId: NodeSlotId, provider: AIProvider) => {
      setNodes((prev) => {
        if (prev[slotId].provider === provider) return prev;
        return {
          ...prev,
          [slotId]: {
            ...prev[slotId],
            provider,
            apiKey: '',
            models: [],
            selectedModel: '',
            isFetchingModels: false,
            fetchError: null,
            isConnected: false,
          },
        };
      });
    },
    []
  );

  const setNodeApiKey = useCallback((slotId: NodeSlotId, apiKey: string) => {
    setNodes((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        apiKey,
        fetchError: null,
      },
    }));
  }, []);

  const setNodeModel = useCallback((slotId: NodeSlotId, modelId: string) => {
    setNodes((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        selectedModel: modelId,
      },
    }));
  }, []);

  const runBenchmark = useCallback(
    async (userPromptText: string) => {
      const cleanPrompt = userPromptText.trim();
      if (!cleanPrompt || !allNodesReady || session.isRunning) {
        return;
      }

      const model1Cfg = nodes.model1;
      const model2Cfg = nodes.model2;
      const judgeCfg = nodes.judge;

      const startTime = Date.now();

      setSession({
        prompt: cleanPrompt,
        isRunning: true,
        model1: {
          status: 'running',
          content: '',
          error: null,
          startedAt: startTime,
          completedAt: null,
          provider: model1Cfg.provider,
          model: model1Cfg.selectedModel,
        },
        model2: {
          status: 'running',
          content: '',
          error: null,
          startedAt: startTime,
          completedAt: null,
          provider: model2Cfg.provider,
          model: model2Cfg.selectedModel,
        },
        judge: {
          ...createInitialExecutionState(),
          provider: judgeCfg.provider,
          model: judgeCfg.selectedModel,
        },
        decision: null,
      });

      // 1. Trigger Model 1 and Model 2 simultaneously in parallel (Promise.all)
      const runModel1 = async (): Promise<string | null> => {
        try {
          const output = await generateLiveCompletion({
            provider: model1Cfg.provider,
            apiKey: model1Cfg.apiKey,
            model: model1Cfg.selectedModel,
            systemPrompt: SYSTEM_PROMPTS.contender,
            prompt: cleanPrompt,
          });
          setSession((prev) => ({
            ...prev,
            model1: {
              ...prev.model1,
              status: 'completed',
              content: output,
              completedAt: Date.now(),
            },
          }));
          return output;
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : 'Model 1 request failed.';
          setSession((prev) => ({
            ...prev,
            model1: {
              ...prev.model1,
              status: 'error',
              error: msg,
              completedAt: Date.now(),
            },
          }));
          return null;
        }
      };

      const runModel2 = async (): Promise<string | null> => {
        try {
          const output = await generateLiveCompletion({
            provider: model2Cfg.provider,
            apiKey: model2Cfg.apiKey,
            model: model2Cfg.selectedModel,
            systemPrompt: SYSTEM_PROMPTS.contender,
            prompt: cleanPrompt,
          });
          setSession((prev) => ({
            ...prev,
            model2: {
              ...prev.model2,
              status: 'completed',
              content: output,
              completedAt: Date.now(),
            },
          }));
          return output;
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : 'Model 2 request failed.';
          setSession((prev) => ({
            ...prev,
            model2: {
              ...prev.model2,
              status: 'error',
              error: msg,
              completedAt: Date.now(),
            },
          }));
          return null;
        }
      };

      const [model1Answer, model2Answer] = await Promise.all([
        runModel1(),
        runModel2(),
      ]);

      if (!model1Answer || !model2Answer) {
        setSession((prev) => ({
          ...prev,
          isRunning: false,
        }));
        return;
      }

      // 2. As soon as BOTH Model 1 and Model 2 finish, trigger Model 3 (The Judge)
      const judgeStart = Date.now();
      setSession((prev) => ({
        ...prev,
        judge: {
          ...prev.judge,
          status: 'running',
          startedAt: judgeStart,
          error: null,
        },
      }));

      try {
        const judgePrompt = buildJudgeComparisonPrompt({
          userPrompt: cleanPrompt,
          model1Name: model1Cfg.selectedModel,
          model1Answer,
          model2Name: model2Cfg.selectedModel,
          model2Answer,
        });

        const judgeOutput = await generateLiveCompletion({
          provider: judgeCfg.provider,
          apiKey: judgeCfg.apiKey,
          model: judgeCfg.selectedModel,
          systemPrompt: SYSTEM_PROMPTS.judge,
          prompt: judgePrompt,
        });

        const decision = parseJudgeDecision(
          judgeOutput,
          model1Cfg.selectedModel,
          model2Cfg.selectedModel
        );

        setSession((prev) => ({
          ...prev,
          isRunning: false,
          judge: {
            ...prev.judge,
            status: 'completed',
            content: judgeOutput,
            completedAt: Date.now(),
          },
          decision,
        }));
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Judge evaluation failed.';
        setSession((prev) => ({
          ...prev,
          isRunning: false,
          judge: {
            ...prev.judge,
            status: 'error',
            error: msg,
            completedAt: Date.now(),
          },
        }));
      }
    },
    [allNodesReady, nodes, session.isRunning]
  );

  return {
    nodes,
    allNodesReady,
    isDark,
    toggleTheme,
    setNodeProvider,
    setNodeApiKey,
    setNodeModel,
    connectAndLoadModels,
    session,
    runBenchmark,
  };
}
