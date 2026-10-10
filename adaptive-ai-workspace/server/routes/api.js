import express from 'express';
import { WorkspaceController } from '../controllers/workspaceController.js';

const router = express.Router();

// Health
router.get('/health', WorkspaceController.getHealth);

// Workspace AI Engine
router.post('/workspace/generate', WorkspaceController.generate);
router.post('/workspace/adapt', WorkspaceController.adapt);

// Workspaces CRUD
router.get('/workspaces', WorkspaceController.listWorkspaces);
router.post('/workspaces', WorkspaceController.createWorkspace);
router.get('/workspaces/:id', WorkspaceController.getWorkspace);
router.patch('/workspaces/:id', WorkspaceController.updateWorkspace);

// History & Time Travel
router.get('/workspaces/:id/history', WorkspaceController.getHistory);
router.post('/workspaces/:id/restore', WorkspaceController.restoreVersion);

// Time Machine Simulation Engine
router.post('/simulations/run', WorkspaceController.runSimulation);

// Approved Data Source Access
router.get('/data/:sourceId', WorkspaceController.getDataSource);

export default router;
