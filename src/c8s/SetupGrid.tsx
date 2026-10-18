import React from 'react';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { AIProvider, NodeConfig, NodeSlotId } from '../t3s/types';
import { PROVIDER_META } from '../u3s/verdictUtils';

interface SetupGridProps {
  nodes: Record<NodeSlotId, NodeConfig>;
  onSelectProvider: (slotId: NodeSlotId, provider: AIProvider) => void;
  onChangeApiKey: (slotId: NodeSlotId, apiKey: string) => void;
  onConnectModels: (
    slotId: NodeSlotId,
    overrideProvider?: AIProvider,
    overrideKey?: string
  ) => void;
  onSelectModel: (slotId: NodeSlotId, modelId: string) => void;
}

const PROVIDERS: AIProvider[] = ['openai', 'anthropic', 'gemini'];
const SLOT_ORDER: NodeSlotId[] = ['model1', 'model2', 'judge'];

export const SetupGrid: React.FC<SetupGridProps> = ({
  nodes,
  onSelectProvider,
  onChangeApiKey,
  onConnectModels,
  onSelectModel,
}) => {
  return (
    <section className="mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {SLOT_ORDER.map((slotId) => {
          const node = nodes[slotId];
          const isReady =
            node.isConnected &&
            node.models.length > 0 &&
            Boolean(node.selectedModel);

          return (
            <div
              key={slotId}
              className="rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#D0D7DE] dark:border-[#30363D] p-4 flex flex-col justify-between transition-colors"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D0D7DE] dark:border-[#30363D]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117]">
                    {node.codeLabel}
                  </span>
                  <span className="text-xs font-semibold text-[#1F2328] dark:text-[#F0F6FC]">
                    ({node.roleTitle})
                  </span>
                </div>

                <span
                  className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                    isReady
                      ? 'bg-[#1F2328]/5 dark:bg-[#F0F6FC]/10 text-[#1F2328] dark:text-[#F0F6FC] border-[#1F2328]/30 dark:border-[#F0F6FC]/30'
                      : 'bg-[#F6F5F2] dark:bg-[#0D1117] text-[#57606A] dark:text-[#8B949E] border-[#D0D7DE] dark:border-[#30363D]'
                  }`}
                >
                  {isReady ? 'READY' : 'UNLINKED'}
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Provider Selector (OpenAI | Claude | Gemini) */}
                <div>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#F6F5F2] dark:bg-[#0D1117] border border-[#D0D7DE] dark:border-[#30363D]">
                    {PROVIDERS.map((prov) => {
                      const active = node.provider === prov;
                      return (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => onSelectProvider(slotId, prov)}
                          className={`py-1.5 px-2 rounded-md font-mono text-xs font-medium transition-colors ${
                            active
                              ? 'bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117] font-semibold'
                              : 'text-[#57606A] dark:text-[#8B949E] hover:text-[#1F2328] dark:hover:text-[#F0F6FC]'
                          }`}
                        >
                          {PROVIDER_META[prov].label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. API Key Input */}
                <div>
                  <div className="flex gap-1.5">
                    <input
                      type="password"
                      value={node.apiKey}
                      onChange={(e) => onChangeApiKey(slotId, e.target.value)}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text').trim();
                        if (pasted) {
                          e.preventDefault();
                          onChangeApiKey(slotId, pasted);
                          onConnectModels(slotId, node.provider, pasted);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onConnectModels(slotId);
                        }
                      }}
                      placeholder={`${PROVIDER_META[node.provider].label} API Key (${PROVIDER_META[node.provider].placeholder})`}
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-lg font-mono text-xs bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] placeholder:text-[#57606A]/60 dark:placeholder:text-[#8B949E]/60 border border-[#D0D7DE] dark:border-[#30363D] focus:outline-none focus:border-[#1F2328] dark:focus:border-[#F0F6FC] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => onConnectModels(slotId)}
                      disabled={node.isFetchingModels || !node.apiKey.trim()}
                      className="px-3 py-1.5 rounded-lg font-mono text-xs font-semibold bg-[#1F2328] text-[#FFFFFF] dark:bg-[#F0F6FC] dark:text-[#0D1117] hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none shrink-0 flex items-center gap-1.5 transition-opacity"
                    >
                      {node.isFetchingModels ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>LOAD</span>
                      )}
                    </button>
                  </div>

                  {node.fetchError && (
                    <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-mono text-red-600 dark:text-red-400">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="break-words leading-tight">
                        {node.fetchError}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Live-Fetched Model Dropdown */}
                <div>
                  <div className="relative">
                    <select
                      value={node.selectedModel}
                      disabled={node.models.length === 0}
                      onChange={(e) => onSelectModel(slotId, e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg font-mono text-xs bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] border border-[#D0D7DE] dark:border-[#30363D] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#1F2328] dark:focus:border-[#F0F6FC] cursor-pointer transition-colors"
                    >
                      {node.models.length === 0 ? (
                        <option value="">
                          {node.isFetchingModels
                            ? 'Fetching live models...'
                            : 'Load API key to select model'}
                        </option>
                      ) : (
                        node.models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.id}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#57606A] dark:text-[#8B949E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
