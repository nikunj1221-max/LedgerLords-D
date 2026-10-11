import 'dotenv/config';
import axios from 'axios';

async function main() {
  const base = (process.env.AI_ENDPOINT || '').replace(/\/chat\/completions$/, '');
  const res = await axios.get(`${base}/models`, {
    headers: { Authorization: `Bearer ${process.env.AI_API_KEY}` },
    timeout: 10000,
  });
  const ids: string[] = res.data.data.map((m: any) => m.id).sort();
  console.log(ids.join('\n'));
}
main().catch(e => console.error('failed:', e.response?.status ?? e.message));