import React from 'react';
import { WorkspaceProvider } from './context/WorkspaceContext.jsx';
import AppShell from './components/AppShell.jsx';

export default function App() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}
