import { AIProvider, ModelOption } from '../t3s/types';

/**
 * Live Model Fetching Service
 * Makes a real HTTP GET request directly to the selected provider's API
 * using the user's API key and returns the active models available to that key.
 */
export async function fetchProviderModels(
  provider: AIProvider,
  rawApiKey: string
): Promise<ModelOption[]> {
  const apiKey = rawApiKey.trim();
  if (!apiKey) {
    throw new Error('Please enter an API key first.');
  }

  if (provider === 'gemini') {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      let errMsg = `Gemini API Error (${response.status})`;
      try {
        const errData = await response.json();
        if (errData?.error?.message) {
          errMsg = errData.error.message;
        }
      } catch {
        // Ignore JSON parse errors
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    const rawModels = Array.isArray(data?.models) ? data.models : [];

    const filteredModels: ModelOption[] = rawModels
      .filter(
        (m: {
          name?: string;
          supportedGenerationMethods?: string[];
        }) =>
          typeof m?.name === 'string' &&
          Array.isArray(m?.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes('generateContent')
      )
      .map((m: { name: string; displayName?: string }) => {
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
      } catch {
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

    const filteredModels: ModelOption[] = rawModels
      .filter((m: { id?: string }) => {
        if (!m || typeof m.id !== 'string') return false;
        const lowerId = m.id.toLowerCase();
        const matchesPrefix = prefixes.some((prefix) => lowerId.startsWith(prefix));
        const isExcluded = excludedSubstrings.some((sub) => lowerId.includes(sub));
        return matchesPrefix && !isExcluded;
      })
      .map((m: { id: string }) => ({
        id: m.id,
        displayName: m.id,
      }))
      .sort((a: ModelOption, b: ModelOption) => a.id.localeCompare(b.id));

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
      } catch {
        // Ignore JSON parse errors
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    const rawModels = Array.isArray(data?.data) ? data.data : [];

    const mappedModels: ModelOption[] = rawModels
      .filter((m: { id?: string }) => m && typeof m.id === 'string')
      .map((m: { id: string; display_name?: string }) => ({
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
export async function generateLiveCompletion(params: {
  provider: AIProvider;
  apiKey: string;
  model: string;
  systemPrompt: string;
  prompt: string;
}): Promise<string> {
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      cleanModel
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

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
      } catch {
        // Ignore JSON parse errors
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || '')
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
      } catch {
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
      } catch {
        // Ignore JSON parse errors
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    const text = Array.isArray(data?.content)
      ? data.content
          .filter((block: { type?: string; text?: string }) => block.type === 'text')
          .map((block: { text: string }) => block.text)
          .join('\n')
      : '';

    if (!text) {
      throw new Error('Anthropic returned an empty response.');
    }

    return text;
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

export const SYSTEM_PROMPTS = {
  contender:
    'You are an expert AI system participating in an independent head-to-head benchmark. ' +
    'Provide a comprehensive, accurate, technically rigorous, and well-structured response to the user’s prompt.',

  judge:
    'You are Model 3 (The Supreme Judge) in an objective head-to-head AI benchmark. ' +
    'You are given the User’s original prompt along with two completely independent responses from Model 1 and Model 2. ' +
    'Evaluate both responses objectively across accuracy, depth, clarity, code quality, edge-case coverage, and absence of hallucinations. ' +
    'You MUST select a definitive winner ("Model 1" or "Model 2") and return ONLY a valid JSON object in this exact schema:\n' +
    '{\n' +
    '  "winner": "Model 1" | "Model 2",\n' +
    '  "reason": "A concise, sharp, well-reasoned paragraph explaining why the winning model gave the better answer and where the other model fell short."\n' +
    '}',
};

export function buildJudgeComparisonPrompt(params: {
  userPrompt: string;
  model1Name: string;
  model1Answer: string;
  model2Name: string;
  model2Answer: string;
}): string {
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
