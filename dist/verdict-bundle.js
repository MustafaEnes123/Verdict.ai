/* VERDICT.AI — Compiled Bundle from src/ Numeronym Modules */
(function () {
  var React = window.React;
  var ReactDOM = window.ReactDOM;

  function createLucideIcon(paths) {
    return function LucideIcon(props) {
      var className = (props && props.className) || "w-4 h-4";
      var style = (props && props.style) || undefined;
      return React.createElement(
        "svg",
        {
          className: className,
          style: style,
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": "true"
        },
        paths.map(function (d, idx) {
          return React.createElement("path", { key: idx, d: d });
        })
      );
    };
  }

  var LucideIcons = {
    Check: createLucideIcon(["M20 6 9 17l-5-5"]),
    Copy: createLucideIcon(["M8 8h12v12H8z", "M16 8V4H4v12h4"]),
    Terminal: createLucideIcon(["m4 17 6-6-6-6", "M12 19h8"]),
    ChevronDown: createLucideIcon(["m6 9 6 6 6-6"]),
    AlertCircle: createLucideIcon(["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 8v4", "M12 16h.01"]),
    Loader2: createLucideIcon(["M21 12a9 9 0 1 1-6.219-8.56"]),
    Moon: createLucideIcon(["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"]),
    Sun: createLucideIcon(["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M12 2v2", "M12 20v2", "m4.93 4.93 1.41 1.41", "m17.66 17.66 1.41 1.41", "M2 12h2", "M20 12h2", "m6.34 17.66-1.41 1.41", "m19.07 4.93-1.41 1.41"]),
    CornerDownLeft: createLucideIcon(["m9 10-5 5 5 5", "M20 4v7a4 4 0 0 1-4 4H4"]),
    Trophy: createLucideIcon(["M6 9H4.5a2.5 2.5 0 0 1 0-5H6", "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", "M4 22h16", "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22", "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22", "M18 2H6v7a6 6 0 0 0 12 0V2Z"])
  };

  var moduleFactories = {
    "./t3s/types": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

    },
    "./s6s/apiService": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_PROMPTS = void 0;
exports.fetchProviderModels = fetchProviderModels;
exports.generateLiveCompletion = generateLiveCompletion;
exports.buildJudgeComparisonPrompt = buildJudgeComparisonPrompt;
/**
 * Live Model Fetching Service
 * Makes a real HTTP GET request directly to the selected provider's API
 * using the user's API key and returns the active models available to that key.
 */
async function fetchProviderModels(provider, rawApiKey) {
    const apiKey = rawApiKey.trim();
    if (!apiKey) {
        throw new Error('Please enter an API key first.');
    }
    if (provider === 'gemini') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`, {
            method: 'GET',
        });
        if (!response.ok) {
            let errMsg = `Gemini API Error (${response.status})`;
            try {
                const errData = await response.json();
                if (errData?.error?.message) {
                    errMsg = errData.error.message;
                }
            }
            catch {
                // Ignore JSON parse errors
            }
            throw new Error(errMsg);
        }
        const data = await response.json();
        const rawModels = Array.isArray(data?.models) ? data.models : [];
        const filteredModels = rawModels
            .filter((m) => typeof m?.name === 'string' &&
            Array.isArray(m?.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes('generateContent'))
            .map((m) => {
            const id = m.name.replace(/^models\//, '');
            return {
                id,
                displayName: m.displayName ? `${m.displayName} (${id})` : id,
            };
        });
        if (filteredModels.length === 0) {
            throw new Error('No generateContent-capable models found for this Gemini API key.');
        }
        return filteredModels;
    }
    if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });
        if (!response.ok) {
            let errMsg = `OpenAI API Error (${response.status})`;
            try {
                const errData = await response.json();
                if (errData?.error?.message) {
                    errMsg = errData.error.message;
                }
            }
            catch {
                // Ignore JSON parse errors
            }
            throw new Error(errMsg);
        }
        const data = await response.json();
        const rawModels = Array.isArray(data?.data) ? data.data : [];
        const prefixes = ['gpt-', 'o1', 'o3', 'o4', 'chatgpt-'];
        const excludedSubstrings = [
            'realtime',
            'audio',
            'tts',
            'transcribe',
            'whisper',
            'embedding',
            'moderation',
            'dall-e',
            'search',
        ];
        const filteredModels = rawModels
            .filter((m) => {
            if (!m || typeof m.id !== 'string')
                return false;
            const lowerId = m.id.toLowerCase();
            const matchesPrefix = prefixes.some((prefix) => lowerId.startsWith(prefix));
            const isExcluded = excludedSubstrings.some((sub) => lowerId.includes(sub));
            return matchesPrefix && !isExcluded;
        })
            .map((m) => ({
            id: m.id,
            displayName: m.id,
        }))
            .sort((a, b) => a.id.localeCompare(b.id));
        if (filteredModels.length === 0) {
            throw new Error('No compatible chat/reasoning models found for this OpenAI key.');
        }
        return filteredModels;
    }
    if (provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/models', {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
        });
        if (!response.ok) {
            let errMsg = `Anthropic API Error (${response.status})`;
            try {
                const errData = await response.json();
                if (errData?.error?.message) {
                    errMsg = errData.error.message;
                }
            }
            catch {
                // Ignore JSON parse errors
            }
            throw new Error(errMsg);
        }
        const data = await response.json();
        const rawModels = Array.isArray(data?.data) ? data.data : [];
        const mappedModels = rawModels
            .filter((m) => m && typeof m.id === 'string')
            .map((m) => ({
            id: m.id,
            displayName: m.display_name ? `${m.display_name} (${m.id})` : m.id,
        }));
        if (mappedModels.length === 0) {
            throw new Error('No active Claude models returned for this Anthropic API key.');
        }
        return mappedModels;
    }
    throw new Error(`Unsupported provider: ${provider}`);
}
/**
 * Live Chat Completion Service
 * Sends a real HTTP POST request to generate content from the configured provider and model.
 */
async function generateLiveCompletion(params) {
    const { provider, model, systemPrompt, prompt } = params;
    const apiKey = params.apiKey.trim();
    if (!apiKey) {
        throw new Error('Missing API key.');
    }
    if (!model) {
        throw new Error('No model selected.');
    }
    if (provider === 'gemini') {
        const cleanModel = model.replace(/^models\//, '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            }),
        });
        if (!response.ok) {
            let errMsg = `Gemini Generation Error (${response.status})`;
            try {
                const errData = await response.json();
                if (errData?.error?.message) {
                    errMsg = errData.error.message;
                }
            }
            catch {
                // Ignore JSON parse errors
            }
            throw new Error(errMsg);
        }
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts
            ?.map((p) => p.text || '')
            .join('');
        if (!text) {
            throw new Error('Gemini returned an empty response.');
        }
        return text;
    }
    if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
            }),
        });
        if (!response.ok) {
            let errMsg = `OpenAI Generation Error (${response.status})`;
            try {
                const errData = await response.json();
                if (errData?.error?.message) {
                    errMsg = errData.error.message;
                }
            }
            catch {
                // Ignore JSON parse errors
            }
            throw new Error(errMsg);
        }
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (!text) {
            throw new Error('OpenAI returned an empty response.');
        }
        return text;
    }
    if (provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                max_tokens: 4096,
                system: systemPrompt,
                messages: [{ role: 'user', content: prompt }],
            }),
        });
        if (!response.ok) {
            let errMsg = `Anthropic Generation Error (${response.status})`;
            try {
                const errData = await response.json();
                if (errData?.error?.message) {
                    errMsg = errData.error.message;
                }
            }
            catch {
                // Ignore JSON parse errors
            }
            throw new Error(errMsg);
        }
        const data = await response.json();
        const text = Array.isArray(data?.content)
            ? data.content
                .filter((block) => block.type === 'text')
                .map((block) => block.text)
                .join('\n')
            : '';
        if (!text) {
            throw new Error('Anthropic returned an empty response.');
        }
        return text;
    }
    throw new Error(`Unsupported provider: ${provider}`);
}
exports.SYSTEM_PROMPTS = {
    contender: 'You are an expert AI system participating in an independent head-to-head benchmark. ' +
        'Provide a comprehensive, accurate, technically rigorous, and well-structured response to the user’s prompt.',
    judge: 'You are Model 3 (The Supreme Judge) in an objective head-to-head AI benchmark. ' +
        'You are given the User’s original prompt along with two completely independent responses from Model 1 and Model 2. ' +
        'Evaluate both responses objectively across accuracy, depth, clarity, code quality, edge-case coverage, and absence of hallucinations. ' +
        'You MUST select a definitive winner ("Model 1" or "Model 2") and return ONLY a valid JSON object in this exact schema:\n' +
        '{\n' +
        '  "winner": "Model 1" | "Model 2",\n' +
        '  "reason": "A concise, sharp, well-reasoned paragraph explaining why the winning model gave the better answer and where the other model fell short."\n' +
        '}',
};
function buildJudgeComparisonPrompt(params) {
    const { userPrompt, model1Name, model1Answer, model2Name, model2Answer } = params;
    return [
        '=== ORIGINAL USER PROMPT ===',
        userPrompt,
        '',
        `=== MODEL 1 (${model1Name}) INDEPENDENT ANSWER ===`,
        model1Answer,
        '',
        `=== MODEL 2 (${model2Name}) INDEPENDENT ANSWER ===`,
        model2Answer,
        '',
        '=== JUDGE INSTRUCTION ===',
        'Compare Model 1 and Model 2 objectively. Respond ONLY with a valid JSON object containing:',
        '- "winner": strictly "Model 1" or "Model 2"',
        '- "reason": a concise, sharp paragraph explaining why that model won and where the other fell short.',
    ].join('\n');
}

    },
    "./u3s/verdictUtils": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVIDER_META = void 0;
exports.parseJudgeDecision = parseJudgeDecision;
exports.formatDuration = formatDuration;
exports.PROVIDER_META = {
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
function parseJudgeDecision(rawText, model1Name, model2Name) {
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
            const winner = rawWinner.includes('2') || rawWinner.includes('contender b')
                ? 'Model 2'
                : 'Model 1';
            const reason = typeof parsed.reason === 'string' && parsed.reason.trim().length > 0
                ? parsed.reason.trim()
                : trimmed;
            return {
                winner,
                winnerModelName: winner === 'Model 1' ? model1Name : model2Name,
                reason,
            };
        }
        catch {
            // Fall through to regex extraction
        }
    }
    // Fallback regex parsing if model returned plain text instead of strict JSON
    const winnerMatch = trimmed.match(/(?:winner|winning\s*model)["'\s:]*?(model\s*1|model\s*2)/i);
    const winner = winnerMatch && winnerMatch[1].toLowerCase().includes('2')
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
function formatDuration(startedAt, completedAt) {
    if (!startedAt)
        return '';
    const end = completedAt ?? Date.now();
    const diffSec = Math.max(0.1, (end - startedAt) / 1000);
    return `${diffSec.toFixed(1)}s`;
}

    },
    "./h3s/useVerdictPipeline": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVerdictPipeline = useVerdictPipeline;
const react_1 = require("react");
const apiService_1 = require("../s6s/apiService");
const verdictUtils_1 = require("../u3s/verdictUtils");
const createInitialExecutionState = () => ({
    status: 'idle',
    content: '',
    error: null,
    startedAt: null,
    completedAt: null,
});
const INITIAL_NODES = {
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
const createInitialSessionState = () => ({
    prompt: '',
    isRunning: false,
    model1: createInitialExecutionState(),
    model2: createInitialExecutionState(),
    judge: createInitialExecutionState(),
    decision: null,
});
function useVerdictPipeline() {
    const [nodes, setNodes] = (0, react_1.useState)(INITIAL_NODES);
    const [session, setSession] = (0, react_1.useState)(createInitialSessionState);
    const [isDark, setIsDark] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        }
        else {
            root.classList.remove('dark');
        }
    }, [isDark]);
    const toggleTheme = (0, react_1.useCallback)(() => {
        setIsDark((prev) => !prev);
    }, []);
    const isNodeReady = (node) => Boolean(node.isConnected &&
        node.apiKey.trim().length > 0 &&
        node.models.length > 0 &&
        node.selectedModel.trim().length > 0);
    const allNodesReady = isNodeReady(nodes.model1) &&
        isNodeReady(nodes.model2) &&
        isNodeReady(nodes.judge);
    const connectAndLoadModels = (0, react_1.useCallback)(async (slotId, overrideProvider, overrideApiKey) => {
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
            const fetchedModels = await (0, apiService_1.fetchProviderModels)(targetProvider, targetKey);
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
        }
        catch (err) {
            const message = err instanceof Error
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
    }, [nodes]);
    const setNodeProvider = (0, react_1.useCallback)((slotId, provider) => {
        setNodes((prev) => {
            if (prev[slotId].provider === provider)
                return prev;
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
    }, []);
    const setNodeApiKey = (0, react_1.useCallback)((slotId, apiKey) => {
        setNodes((prev) => ({
            ...prev,
            [slotId]: {
                ...prev[slotId],
                apiKey,
                fetchError: null,
            },
        }));
    }, []);
    const setNodeModel = (0, react_1.useCallback)((slotId, modelId) => {
        setNodes((prev) => ({
            ...prev,
            [slotId]: {
                ...prev[slotId],
                selectedModel: modelId,
            },
        }));
    }, []);
    const runBenchmark = (0, react_1.useCallback)(async (userPromptText) => {
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
        const runModel1 = async () => {
            try {
                const output = await (0, apiService_1.generateLiveCompletion)({
                    provider: model1Cfg.provider,
                    apiKey: model1Cfg.apiKey,
                    model: model1Cfg.selectedModel,
                    systemPrompt: apiService_1.SYSTEM_PROMPTS.contender,
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
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'Model 1 request failed.';
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
        const runModel2 = async () => {
            try {
                const output = await (0, apiService_1.generateLiveCompletion)({
                    provider: model2Cfg.provider,
                    apiKey: model2Cfg.apiKey,
                    model: model2Cfg.selectedModel,
                    systemPrompt: apiService_1.SYSTEM_PROMPTS.contender,
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
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : 'Model 2 request failed.';
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
            const judgePrompt = (0, apiService_1.buildJudgeComparisonPrompt)({
                userPrompt: cleanPrompt,
                model1Name: model1Cfg.selectedModel,
                model1Answer,
                model2Name: model2Cfg.selectedModel,
                model2Answer,
            });
            const judgeOutput = await (0, apiService_1.generateLiveCompletion)({
                provider: judgeCfg.provider,
                apiKey: judgeCfg.apiKey,
                model: judgeCfg.selectedModel,
                systemPrompt: apiService_1.SYSTEM_PROMPTS.judge,
                prompt: judgePrompt,
            });
            const decision = (0, verdictUtils_1.parseJudgeDecision)(judgeOutput, model1Cfg.selectedModel, model2Cfg.selectedModel);
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
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Judge evaluation failed.';
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
    }, [allNodesReady, nodes, session.isRunning]);
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

    },
    "./c8s/MarkdownView": function(module, exports, require) {
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownView = void 0;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const CodeBlockSnippet = ({ language, code }) => {
    const [copied, setCopied] = (0, react_1.useState)(false);
    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
    };
    return (react_1.default.createElement("div", { className: "my-3 rounded-lg overflow-hidden border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2] dark:bg-[#0D1117]" },
        react_1.default.createElement("div", { className: "flex items-center justify-between px-3 py-1.5 bg-[#EBEAE6] dark:bg-[#161B22] border-b border-[#D0D7DE] dark:border-[#30363D] font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]" },
            react_1.default.createElement("div", { className: "flex items-center gap-1.5" },
                react_1.default.createElement(lucide_react_1.Terminal, { className: "w-3.5 h-3.5" }),
                react_1.default.createElement("span", { className: "uppercase tracking-wider font-semibold" }, language || 'code')),
            react_1.default.createElement("button", { type: "button", onClick: handleCopy, className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FFFFFF] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] border border-[#D0D7DE] dark:border-[#30363D] hover:opacity-80 transition-opacity" }, copied ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(lucide_react_1.Check, { className: "w-3 h-3" }),
                react_1.default.createElement("span", null, "COPIED"))) : (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(lucide_react_1.Copy, { className: "w-3 h-3" }),
                react_1.default.createElement("span", null, "COPY"))))),
        react_1.default.createElement("pre", { className: "p-3.5 text-xs leading-relaxed font-mono text-[#1F2328] dark:text-[#F0F6FC] overflow-x-auto" },
            react_1.default.createElement("code", null, code))));
};
function renderInlineFormatting(text) {
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return tokens.map((token, idx) => {
        if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
            return (react_1.default.createElement("code", { key: idx, className: "px-1.5 py-0.5 mx-0.5 rounded bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] font-mono text-[0.88em] border border-[#D0D7DE] dark:border-[#30363D]" }, token.slice(1, -1)));
        }
        if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
            return (react_1.default.createElement("strong", { key: idx, className: "font-semibold text-[#1F2328] dark:text-[#F0F6FC]" }, token.slice(2, -2)));
        }
        return token;
    });
}
const MarkdownView = ({ content }) => {
    if (!content)
        return null;
    const segments = content.split(/(```[\s\S]*?```)/g);
    return (react_1.default.createElement("div", { className: "space-y-2.5 text-sm leading-relaxed text-[#1F2328] dark:text-[#E6EDF3]" }, segments.map((segment, segIdx) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
            const lines = segment.slice(3, -3).split('\n');
            const firstLine = (lines[0] || '').trim();
            const codeBody = lines.slice(1).join('\n').replace(/\n$/, '');
            return (react_1.default.createElement(CodeBlockSnippet, { key: segIdx, language: firstLine, code: codeBody }));
        }
        const lines = segment.split('\n');
        return (react_1.default.createElement("div", { key: segIdx, className: "space-y-2" }, lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return react_1.default.createElement("div", { key: lineIdx, className: "h-1" });
            }
            if (trimmed.startsWith('### ')) {
                return (react_1.default.createElement("h4", { key: lineIdx, className: "text-sm font-bold text-[#1F2328] dark:text-[#F0F6FC] pt-2" }, renderInlineFormatting(trimmed.slice(4))));
            }
            if (trimmed.startsWith('## ')) {
                return (react_1.default.createElement("h3", { key: lineIdx, className: "text-base font-bold text-[#1F2328] dark:text-[#F0F6FC] pt-2" }, renderInlineFormatting(trimmed.slice(3))));
            }
            if (trimmed.startsWith('# ')) {
                return (react_1.default.createElement("h2", { key: lineIdx, className: "text-lg font-bold text-[#1F2328] dark:text-[#F0F6FC] pt-2.5" }, renderInlineFormatting(trimmed.slice(2))));
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (react_1.default.createElement("div", { key: lineIdx, className: "flex items-start gap-2.5 pl-1" },
                    react_1.default.createElement("span", { className: "mt-2 w-1.5 h-1.5 rounded-full bg-[#57606A] dark:bg-[#8B949E] shrink-0" }),
                    react_1.default.createElement("span", { className: "flex-1" }, renderInlineFormatting(trimmed.slice(2)))));
            }
            const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
            if (numberedMatch) {
                return (react_1.default.createElement("div", { key: lineIdx, className: "flex items-start gap-2.5 pl-1" },
                    react_1.default.createElement("span", { className: "font-mono font-semibold text-[#57606A] dark:text-[#8B949E] text-xs mt-0.5 min-w-[1.25rem]" },
                        numberedMatch[1],
                        "."),
                    react_1.default.createElement("span", { className: "flex-1" }, renderInlineFormatting(numberedMatch[2]))));
            }
            return (react_1.default.createElement("p", { key: lineIdx, className: "leading-relaxed" }, renderInlineFormatting(line)));
        })));
    })));
};
exports.MarkdownView = MarkdownView;

    },
    "./c8s/TopHeader": function(module, exports, require) {
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopHeader = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const TopHeader = ({ isDark, onToggleTheme, }) => {
    return (react_1.default.createElement("header", { className: "sticky top-0 z-30 bg-[#FFFFFF]/95 dark:bg-[#161B22]/95 backdrop-blur-md border-b border-[#D0D7DE] dark:border-[#30363D] transition-colors" },
        react_1.default.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4" },
            react_1.default.createElement("div", { className: "flex items-center gap-3" },
                react_1.default.createElement("span", { className: "text-sm sm:text-base font-bold tracking-[0.12em] text-[#1F2328] dark:text-[#F0F6FC]" }, "VERDICT.AI"),
                react_1.default.createElement("span", { className: "h-3.5 w-[1px] bg-[#D0D7DE] dark:bg-[#30363D]" }),
                react_1.default.createElement("span", { className: "font-mono text-[11px] tracking-wider uppercase px-2 py-0.5 rounded bg-[#F6F5F2] dark:bg-[#0D1117] text-[#57606A] dark:text-[#8B949E] border border-[#D0D7DE] dark:border-[#30363D]" }, "INDEPENDENT MODEL BENCHMARK")),
            react_1.default.createElement("button", { type: "button", onClick: onToggleTheme, "aria-label": "Toggle color theme", className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-medium bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] border border-[#D0D7DE] dark:border-[#30363D] hover:border-[#1F2328] dark:hover:border-[#8B949E] transition-colors" }, isDark ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(lucide_react_1.Sun, { className: "w-3.5 h-3.5 text-[#F0F6FC]" }),
                react_1.default.createElement("span", null, "LIGHT"))) : (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(lucide_react_1.Moon, { className: "w-3.5 h-3.5 text-[#1F2328]" }),
                react_1.default.createElement("span", null, "DARK")))))));
};
exports.TopHeader = TopHeader;

    },
    "./c8s/SetupGrid": function(module, exports, require) {
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupGrid = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const verdictUtils_1 = require("../u3s/verdictUtils");
const PROVIDERS = ['openai', 'anthropic', 'gemini'];
const SLOT_ORDER = ['model1', 'model2', 'judge'];
const SetupGrid = ({ nodes, onSelectProvider, onChangeApiKey, onConnectModels, onSelectModel, }) => {
    return (react_1.default.createElement("section", { className: "mb-6" },
        react_1.default.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4" }, SLOT_ORDER.map((slotId) => {
            const node = nodes[slotId];
            const isReady = node.isConnected &&
                node.models.length > 0 &&
                Boolean(node.selectedModel);
            return (react_1.default.createElement("div", { key: slotId, className: "rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#D0D7DE] dark:border-[#30363D] p-4 flex flex-col justify-between transition-colors" },
                react_1.default.createElement("div", { className: "flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D0D7DE] dark:border-[#30363D]" },
                    react_1.default.createElement("div", { className: "flex items-center gap-2" },
                        react_1.default.createElement("span", { className: "font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]" }, node.codeLabel),
                        react_1.default.createElement("span", { className: "text-xs font-semibold text-[#1F2328] dark:text-[#F0F6FC]" },
                            "(",
                            node.roleTitle,
                            ")")),
                    react_1.default.createElement("span", { className: `font-mono text-[11px] px-2 py-0.5 rounded border ${isReady
                            ? 'bg-[#1F2328]/5 dark:bg-[#F0F6FC]/10 text-[#1F2328] dark:text-[#F0F6FC] border-[#1F2328]/30 dark:border-[#F0F6FC]/30'
                            : 'bg-[#F6F5F2] dark:bg-[#0D1117] text-[#57606A] dark:text-[#8B949E] border-[#D0D7DE] dark:border-[#30363D]'}` }, isReady ? 'READY' : 'UNLINKED')),
                react_1.default.createElement("div", { className: "space-y-3" },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("div", { className: "grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#F6F5F2] dark:bg-[#0D1117] border border-[#D0D7DE] dark:border-[#30363D]" }, PROVIDERS.map((prov) => {
                            const active = node.provider === prov;
                            return (react_1.default.createElement("button", { key: prov, type: "button", onClick: () => onSelectProvider(slotId, prov), className: `py-1.5 px-2 rounded-md font-mono text-xs font-medium transition-colors ${active
                                    ? 'bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117] font-semibold'
                                    : 'text-[#57606A] dark:text-[#8B949E] hover:text-[#1F2328] dark:hover:text-[#F0F6FC]'}` }, verdictUtils_1.PROVIDER_META[prov].label));
                        }))),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("div", { className: "flex gap-1.5" },
                            react_1.default.createElement("input", { type: "password", value: node.apiKey, onChange: (e) => onChangeApiKey(slotId, e.target.value), onPaste: (e) => {
                                    const pasted = e.clipboardData.getData('text').trim();
                                    if (pasted) {
                                        e.preventDefault();
                                        onChangeApiKey(slotId, pasted);
                                        onConnectModels(slotId, node.provider, pasted);
                                    }
                                }, onKeyDown: (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        onConnectModels(slotId);
                                    }
                                }, placeholder: `${verdictUtils_1.PROVIDER_META[node.provider].label} API Key (${verdictUtils_1.PROVIDER_META[node.provider].placeholder})`, className: "flex-1 min-w-0 px-3 py-1.5 rounded-lg font-mono text-xs bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] placeholder:text-[#57606A]/60 dark:placeholder:text-[#8B949E]/60 border border-[#D0D7DE] dark:border-[#30363D] focus:outline-none focus:border-[#1F2328] dark:focus:border-[#F0F6FC] transition-colors" }),
                            react_1.default.createElement("button", { type: "button", onClick: () => onConnectModels(slotId), disabled: node.isFetchingModels || !node.apiKey.trim(), className: "px-3 py-1.5 rounded-lg font-mono text-xs font-semibold bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none shrink-0 flex items-center gap-1.5 transition-opacity" }, node.isFetchingModels ? (react_1.default.createElement(lucide_react_1.Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : (react_1.default.createElement("span", null, "LOAD")))),
                        node.fetchError && (react_1.default.createElement("div", { className: "mt-2 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-mono text-red-600 dark:text-red-400" },
                            react_1.default.createElement(lucide_react_1.AlertCircle, { className: "w-3.5 h-3.5 shrink-0 mt-0.5" }),
                            react_1.default.createElement("span", { className: "break-words leading-tight" }, node.fetchError)))),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("div", { className: "relative" },
                            react_1.default.createElement("select", { value: node.selectedModel, disabled: node.models.length === 0, onChange: (e) => onSelectModel(slotId, e.target.value), className: "w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg font-mono text-xs bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] border border-[#D0D7DE] dark:border-[#30363D] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#1F2328] dark:focus:border-[#F0F6FC] cursor-pointer transition-colors" }, node.models.length === 0 ? (react_1.default.createElement("option", { value: "" }, node.isFetchingModels
                                ? 'Fetching live models...'
                                : 'Load API key to select model')) : (node.models.map((m) => (react_1.default.createElement("option", { key: m.id, value: m.id }, m.id))))),
                            react_1.default.createElement(lucide_react_1.ChevronDown, { className: "w-3.5 h-3.5 text-[#57606A] dark:text-[#8B949E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" }))))));
        }))));
};
exports.SetupGrid = SetupGrid;

    },
    "./c8s/PromptBar": function(module, exports, require) {
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBar = void 0;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const PromptBar = ({ allNodesReady, isRunning, onSubmitPrompt, }) => {
    const [inputText, setInputText] = (0, react_1.useState)('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !allNodesReady || isRunning)
            return;
        onSubmitPrompt(inputText);
    };
    const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (inputText.trim() && allNodesReady && !isRunning) {
                onSubmitPrompt(inputText);
            }
        }
    };
    return (react_1.default.createElement("section", { className: "mb-6" },
        react_1.default.createElement("form", { onSubmit: handleSubmit, className: "rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#D0D7DE] dark:border-[#30363D] focus-within:border-[#1F2328] dark:focus-within:border-[#F0F6FC] transition-colors overflow-hidden" },
            react_1.default.createElement("div", { className: "px-4 py-2 border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2]/60 dark:bg-[#0D1117]/60 flex items-center justify-between" },
                react_1.default.createElement("span", { className: "font-mono text-[11px] font-semibold tracking-wider uppercase text-[#57606A] dark:text-[#8B949E]" }, "PROMPT COMPOSER"),
                react_1.default.createElement("span", { className: "font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]" }, allNodesReady
                    ? 'MODEL 01 ∥ MODEL 02 → JUDGE 03'
                    : 'CONFIGURE ALL 3 MODELS ABOVE TO RUN')),
            react_1.default.createElement("div", { className: "p-4" },
                react_1.default.createElement("textarea", { rows: 3, value: inputText, onChange: (e) => setInputText(e.target.value), onKeyDown: handleKeyDown, disabled: isRunning, placeholder: "Enter prompt to benchmark Model 1 and Model 2 head-to-head...", className: "w-full resize-none bg-transparent text-sm leading-relaxed text-[#1F2328] dark:text-[#F0F6FC] placeholder:text-[#57606A]/60 dark:placeholder:text-[#8B949E]/60 focus:outline-none" }),
                react_1.default.createElement("div", { className: "mt-3 pt-3 border-t border-[#D0D7DE] dark:border-[#30363D] flex items-center justify-between gap-3" },
                    react_1.default.createElement("span", { className: "font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]" }, "\u2318/Ctrl + Enter"),
                    react_1.default.createElement("button", { type: "submit", disabled: !allNodesReady || isRunning || !inputText.trim(), className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wide uppercase bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-opacity" }, isRunning ? (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement(lucide_react_1.Loader2, { className: "w-3.5 h-3.5 animate-spin" }),
                        react_1.default.createElement("span", null, "EXECUTING BENCHMARK..."))) : (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("span", null, "RUN BENCHMARK"),
                        react_1.default.createElement(lucide_react_1.CornerDownLeft, { className: "w-3.5 h-3.5" })))))))));
};
exports.PromptBar = PromptBar;

    },
    "./c8s/DebateArena": function(module, exports, require) {
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebateArena = void 0;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const verdictUtils_1 = require("../u3s/verdictUtils");
const MarkdownView_1 = require("./MarkdownView");
const DebateArena = ({ session, nodes }) => {
    if (!session.prompt) {
        return null;
    }
    const isModel1Winner = session.decision?.winner === 'Model 1';
    const isModel2Winner = session.decision?.winner === 'Model 2';
    const model1Id = session.model1.model || nodes.model1.selectedModel;
    const model2Id = session.model2.model || nodes.model2.selectedModel;
    const judgeId = session.judge.model || nodes.judge.selectedModel;
    return (react_1.default.createElement("section", { className: "space-y-5 pb-16" },
        react_1.default.createElement("div", { className: "rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#D0D7DE] dark:border-[#30363D] overflow-hidden" },
            session.judge.status === 'completed' && session.decision ? (react_1.default.createElement("div", { className: "px-5 py-4 bg-[#1F2328] dark:bg-[#F0F6FC] text-[#FFFFFF] dark:text-[#0D1117] flex flex-wrap items-center justify-between gap-3" },
                react_1.default.createElement("div", { className: "flex items-center gap-3" },
                    react_1.default.createElement("span", { className: "text-lg leading-none", role: "img", "aria-label": "trophy" }, "\uD83C\uDFC6"),
                    react_1.default.createElement("h2", { className: "font-mono text-sm sm:text-base font-bold tracking-wider uppercase" },
                        "WINNER: ",
                        session.decision.winner.toUpperCase(),
                        " (",
                        session.decision.winnerModelName,
                        ")")),
                react_1.default.createElement("div", { className: "flex items-center gap-2 font-mono text-[11px] opacity-80" },
                    react_1.default.createElement("span", null,
                        "JUDGE 03: ",
                        judgeId),
                    react_1.default.createElement("span", null, "\u2022"),
                    react_1.default.createElement("span", null, (0, verdictUtils_1.formatDuration)(session.judge.startedAt, session.judge.completedAt))))) : (react_1.default.createElement("div", { className: "px-4 py-3 border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2]/70 dark:bg-[#0D1117]/70 flex items-center justify-between gap-2" },
                react_1.default.createElement("div", { className: "flex items-center gap-2" },
                    react_1.default.createElement("span", { className: "font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]" }, "JUDGE 03"),
                    react_1.default.createElement("span", { className: "font-mono text-xs text-[#57606A] dark:text-[#8B949E]" },
                        verdictUtils_1.PROVIDER_META[session.judge.provider || nodes.judge.provider].label,
                        ' ',
                        "/ ",
                        judgeId)),
                react_1.default.createElement("div", { className: "font-mono text-xs text-[#57606A] dark:text-[#8B949E]" },
                    session.judge.status === 'idle' &&
                        session.isRunning &&
                        'WAITING FOR CONTENDERS...',
                    session.judge.status === 'running' && (react_1.default.createElement("span", { className: "inline-flex items-center gap-1.5 text-[#1F2328] dark:text-[#F0F6FC] font-semibold" },
                        react_1.default.createElement(lucide_react_1.Loader2, { className: "w-3.5 h-3.5 animate-spin" }),
                        "EVALUATING MODEL 01 VS MODEL 02..."))))),
            react_1.default.createElement("div", { className: "p-5" },
                session.judge.status === 'idle' && session.isRunning && (react_1.default.createElement("p", { className: "font-mono text-xs text-[#57606A] dark:text-[#8B949E]" },
                    "Judge 03 (",
                    judgeId,
                    ") will automatically evaluate both responses as soon as Model 01 and Model 02 complete their independent answers.")),
                session.judge.status === 'running' && (react_1.default.createElement("div", { className: "py-4 flex items-center gap-3 font-mono text-xs text-[#1F2328] dark:text-[#F0F6FC]" },
                    react_1.default.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 animate-spin shrink-0" }),
                    react_1.default.createElement("span", null, "Comparing accuracy, depth, clarity, and code quality across both contenders..."))),
                session.judge.status === 'error' && (react_1.default.createElement("div", { className: "p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 font-mono text-xs text-red-600 dark:text-red-400" },
                    react_1.default.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 shrink-0 mt-0.5" }),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("div", { className: "font-bold" }, "JUDGE EVALUATION ERROR"),
                        react_1.default.createElement("div", { className: "mt-0.5" }, session.judge.error)))),
                session.judge.status === 'completed' && session.decision && (react_1.default.createElement("div", null,
                    react_1.default.createElement("div", { className: "font-mono text-[11px] font-bold uppercase tracking-wider text-[#57606A] dark:text-[#8B949E] mb-1.5" }, "VERDICT REASONING"),
                    react_1.default.createElement("p", { className: "text-sm sm:text-[15px] leading-relaxed text-[#1F2328] dark:text-[#F0F6FC]" }, session.decision.reason))))),
        react_1.default.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 items-start" },
            react_1.default.createElement("div", { className: `rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] overflow-hidden transition-all ${isModel1Winner
                    ? 'border-2 border-[#1F2328] dark:border-[#F0F6FC] shadow-sm'
                    : 'border border-[#D0D7DE] dark:border-[#30363D]'}` },
                react_1.default.createElement("div", { className: "px-4 py-3 border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2]/60 dark:bg-[#0D1117]/60 flex flex-wrap items-center justify-between gap-2" },
                    react_1.default.createElement("div", { className: "flex items-center gap-2" },
                        react_1.default.createElement("span", { className: "font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]" }, "MODEL 01"),
                        react_1.default.createElement("span", { className: "font-mono text-xs font-medium text-[#1F2328] dark:text-[#F0F6FC]" }, model1Id)),
                    react_1.default.createElement("div", { className: "flex items-center gap-2" },
                        isModel1Winner && (react_1.default.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]" },
                            react_1.default.createElement(lucide_react_1.Trophy, { className: "w-3 h-3" }),
                            "WINNER")),
                        session.model1.status === 'running' && (react_1.default.createElement("span", { className: "inline-flex items-center gap-1.5 font-mono text-xs text-[#57606A] dark:text-[#8B949E]" },
                            react_1.default.createElement(lucide_react_1.Loader2, { className: "w-3.5 h-3.5 animate-spin" }),
                            "GENERATING...")),
                        session.model1.status === 'completed' && (react_1.default.createElement("span", { className: "font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]" }, (0, verdictUtils_1.formatDuration)(session.model1.startedAt, session.model1.completedAt))))),
                react_1.default.createElement("div", { className: "p-4 sm:p-5" },
                    session.model1.status === 'running' && (react_1.default.createElement("div", { className: "py-12 flex flex-col items-center justify-center text-center gap-2 font-mono text-xs text-[#57606A] dark:text-[#8B949E]" },
                        react_1.default.createElement(lucide_react_1.Loader2, { className: "w-5 h-5 animate-spin text-[#1F2328] dark:text-[#F0F6FC]" }),
                        react_1.default.createElement("span", null,
                            "Generating independent response from ",
                            model1Id,
                            "..."))),
                    session.model1.status === 'error' && (react_1.default.createElement("div", { className: "p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 font-mono text-xs text-red-600 dark:text-red-400" },
                        react_1.default.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 shrink-0 mt-0.5" }),
                        react_1.default.createElement("div", null,
                            react_1.default.createElement("div", { className: "font-bold" }, "MODEL 01 ERROR"),
                            react_1.default.createElement("div", { className: "mt-0.5" }, session.model1.error)))),
                    session.model1.status === 'completed' && (react_1.default.createElement(MarkdownView_1.MarkdownView, { content: session.model1.content })))),
            react_1.default.createElement("div", { className: `rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] overflow-hidden transition-all ${isModel2Winner
                    ? 'border-2 border-[#1F2328] dark:border-[#F0F6FC] shadow-sm'
                    : 'border border-[#D0D7DE] dark:border-[#30363D]'}` },
                react_1.default.createElement("div", { className: "px-4 py-3 border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F5F2]/60 dark:bg-[#0D1117]/60 flex flex-wrap items-center justify-between gap-2" },
                    react_1.default.createElement("div", { className: "flex items-center gap-2" },
                        react_1.default.createElement("span", { className: "font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]" }, "MODEL 02"),
                        react_1.default.createElement("span", { className: "font-mono text-xs font-medium text-[#1F2328] dark:text-[#F0F6FC]" }, model2Id)),
                    react_1.default.createElement("div", { className: "flex items-center gap-2" },
                        isModel2Winner && (react_1.default.createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]" },
                            react_1.default.createElement(lucide_react_1.Trophy, { className: "w-3 h-3" }),
                            "WINNER")),
                        session.model2.status === 'running' && (react_1.default.createElement("span", { className: "inline-flex items-center gap-1.5 font-mono text-xs text-[#57606A] dark:text-[#8B949E]" },
                            react_1.default.createElement(lucide_react_1.Loader2, { className: "w-3.5 h-3.5 animate-spin" }),
                            "GENERATING...")),
                        session.model2.status === 'completed' && (react_1.default.createElement("span", { className: "font-mono text-[11px] text-[#57606A] dark:text-[#8B949E]" }, (0, verdictUtils_1.formatDuration)(session.model2.startedAt, session.model2.completedAt))))),
                react_1.default.createElement("div", { className: "p-4 sm:p-5" },
                    session.model2.status === 'running' && (react_1.default.createElement("div", { className: "py-12 flex flex-col items-center justify-center text-center gap-2 font-mono text-xs text-[#57606A] dark:text-[#8B949E]" },
                        react_1.default.createElement(lucide_react_1.Loader2, { className: "w-5 h-5 animate-spin text-[#1F2328] dark:text-[#F0F6FC]" }),
                        react_1.default.createElement("span", null,
                            "Generating independent response from ",
                            model2Id,
                            "..."))),
                    session.model2.status === 'error' && (react_1.default.createElement("div", { className: "p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 font-mono text-xs text-red-600 dark:text-red-400" },
                        react_1.default.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 shrink-0 mt-0.5" }),
                        react_1.default.createElement("div", null,
                            react_1.default.createElement("div", { className: "font-bold" }, "MODEL 02 ERROR"),
                            react_1.default.createElement("div", { className: "mt-0.5" }, session.model2.error)))),
                    session.model2.status === 'completed' && (react_1.default.createElement(MarkdownView_1.MarkdownView, { content: session.model2.content })))))));
};
exports.DebateArena = DebateArena;

    },
    "./App": function(module, exports, require) {
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const react_1 = __importDefault(require("react"));
const useVerdictPipeline_1 = require("./h3s/useVerdictPipeline");
const TopHeader_1 = require("./c8s/TopHeader");
const SetupGrid_1 = require("./c8s/SetupGrid");
const PromptBar_1 = require("./c8s/PromptBar");
const DebateArena_1 = require("./c8s/DebateArena");
const App = () => {
    const { nodes, allNodesReady, isDark, toggleTheme, setNodeProvider, setNodeApiKey, setNodeModel, connectAndLoadModels, session, runBenchmark, } = (0, useVerdictPipeline_1.useVerdictPipeline)();
    return (react_1.default.createElement("div", { className: "min-h-screen bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] font-sans antialiased transition-colors" },
        react_1.default.createElement(TopHeader_1.TopHeader, { isDark: isDark, onToggleTheme: toggleTheme }),
        react_1.default.createElement("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16" },
            react_1.default.createElement(SetupGrid_1.SetupGrid, { nodes: nodes, onSelectProvider: setNodeProvider, onChangeApiKey: setNodeApiKey, onConnectModels: connectAndLoadModels, onSelectModel: setNodeModel }),
            react_1.default.createElement(PromptBar_1.PromptBar, { allNodesReady: allNodesReady, isRunning: session.isRunning, onSubmitPrompt: runBenchmark }),
            react_1.default.createElement(DebateArena_1.DebateArena, { session: session, nodes: nodes }))));
};
exports.App = App;
exports.default = exports.App;

    },
  };

  var moduleCache = {};

  function resolveModulePath(fromKey, request) {
    if (request === "react") return "react";
    if (request === "react-dom" || request === "react-dom/client") return "react-dom";
    if (request === "lucide-react") return "lucide-react";

    var fromParts = fromKey.split("/").filter(function (p) { return p && p !== "."; }).slice(0, -1);
    var reqParts = request.split("/");
    for (var i = 0; i < reqParts.length; i++) {
      var seg = reqParts[i];
      if (seg === "." || seg === "") continue;
      if (seg === "..") {
        fromParts.pop();
      } else {
        fromParts.push(seg);
      }
    }
    return "./" + fromParts.filter(Boolean).join("/");
  }

  function createRequire(currentKey) {
    return function require(request) {
      var resolved = resolveModulePath(currentKey, request);
      if (resolved === "react") return React;
      if (resolved === "react-dom") return ReactDOM;
      if (resolved === "lucide-react") return LucideIcons;

      if (moduleCache[resolved]) {
        return moduleCache[resolved].exports;
      }
      var factory = moduleFactories[resolved];
      if (!factory) {
        throw new Error("Module not found: " + resolved + " (requested " + request + " from " + currentKey + ")");
      }
      var mod = { exports: {} };
      moduleCache[resolved] = mod;
      factory(mod, mod.exports, createRequire(resolved));
      return mod.exports;
    };
  }

  var AppModule = createRequire("./main")("./App");
  var AppComponent = AppModule.default || AppModule.App;
  var rootEl = document.getElementById("root");
  if (rootEl && ReactDOM && ReactDOM.createRoot) {
    ReactDOM.createRoot(rootEl).render(React.createElement(AppComponent));
  } else if (rootEl && ReactDOM && ReactDOM.render) {
    ReactDOM.render(React.createElement(AppComponent), rootEl);
  }
})();
