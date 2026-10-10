import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import GoalInput from './GoalInput.jsx';
import WorkspaceCanvas from './WorkspaceCanvas.jsx';
import AICopilot from './AICopilot.jsx';
import TimeMachinePanel from './TimeMachinePanel.jsx';
import EvidenceDrawer from './EvidenceDrawer.jsx';
import WorkspaceHistory from './WorkspaceHistory.jsx';
import ClarificationModal from './ClarificationModal.jsx';
import PreferencesModal from './PreferencesModal.jsx';
import LoadingState from './LoadingState.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    workspace,
    generateWorkspace,
    isGenerating,
    generationStage,
  } = useWorkspace();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main App Canvas Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto flex flex-col relative min-w-0">
          {!workspace ? (
            <GoalInput
              onSubmit={(goal) => generateWorkspace(goal)}
              isGenerating={isGenerating}
            />
          ) : (
            <WorkspaceCanvas />
          )}
        </main>

        {/* Docked AI Copilot if a workspace is loaded */}
        {workspace && <AICopilot />}
      </div>

      {/* Signature Modals & Drawers */}
      <TimeMachinePanel />
      <EvidenceDrawer />
      <WorkspaceHistory />
      <ClarificationModal />
      <PreferencesModal />

      {/* Stage-based Loading Indicator */}
      {isGenerating && <LoadingState stage={generationStage} />}
    </div>
  );
}
