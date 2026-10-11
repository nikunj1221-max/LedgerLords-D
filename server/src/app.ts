import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import intentRouter from './routes/intent';
import workspaceRouter from './routes/workspace';
import dataRouter from './routes/data';
import actionsRouter from './routes/actions';
import authRouter from './routes/auth';
import { requireAuth } from './services/auth/auth';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api', requireAuth);
app.use('/api/intent', intentRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/data', dataRouter);
app.use('/api/actions', actionsRouter);

export default app;
