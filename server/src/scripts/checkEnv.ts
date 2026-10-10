import 'dotenv/config';

const key = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';
console.log({
  keyComesFrom: process.env.AI_API_KEY ? 'AI_API_KEY' : process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY' : 'none',
  keyLength: key.length,
  keyPrefix: key.slice(0, 4),
  endpointHost: new URL(process.env.AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions').host,
  model: process.env.AI_MODEL || '(default: gpt-4o-mini)',
});