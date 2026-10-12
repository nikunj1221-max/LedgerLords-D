import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import intentRouter from './routes/intent';
import workspaceRouter from './routes/workspace';
import dataRouter from './routes/data';
import actionsRouter from './routes/actions';
import authRouter from './routes/auth';
import userDataRouter from './routes/userData';
import { requireAuth } from './services/auth/auth';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '12mb' }));

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api', requireAuth);
app.use('/api/user-data', userDataRouter);
app.use('/api/intent', intentRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/data', dataRouter);
app.use('/api/actions', actionsRouter);

// Serve static client bundle if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

export default app;
