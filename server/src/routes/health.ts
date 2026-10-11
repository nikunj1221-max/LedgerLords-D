import express, { Router } from 'express';

const router = Router();

// Health check
router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'NexusFlow Adaptive AI Workspace API', timestamp: new Date().toISOString() });
});

export default router;
