import React from 'react';
import { useVerdictPipeline } from './h3s/useVerdictPipeline';
import { TopHeader } from './c8s/TopHeader';
import { SetupGrid } from './c8s/SetupGrid';
import { PromptBar } from './c8s/PromptBar';
import { DebateArena } from './c8s/DebateArena';

export const App: React.FC = () => {
  const {
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
  } = useVerdictPipeline();

  return (
    <div className="min-h-screen bg-[#F6F5F2] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#F0F6FC] font-sans antialiased transition-colors">
      {/* 1. Top Header */}
      <TopHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        {/* 2. 3-Column Configuration Strip */}
        <SetupGrid
          nodes={nodes}
          onSelectProvider={setNodeProvider}
          onChangeApiKey={setNodeApiKey}
          onConnectModels={connectAndLoadModels}
          onSelectModel={setNodeModel}
        />

        {/* 3. Prompt Composer */}
        <PromptBar
          allNodesReady={allNodesReady}
          isRunning={session.isRunning}
          onSubmitPrompt={runBenchmark}
        />

        {/* 4. Results Arena */}
        <DebateArena session={session} nodes={nodes} />
      </main>
    </div>
  );
};

export default App;
