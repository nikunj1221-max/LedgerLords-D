import axios from 'axios';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { UIPlan } from '../../schemas/uiPlan';
import { fallbackPlanner, PlannerInput } from './fallbackPlanner';
import { buildPlanFromDraft } from './planValidator';
import { buildSystemPrompt, buildUserPayload } from './plannerPrompt';
import { BANNED_NEW_TYPES } from './componentContract';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type PostFn = (
  url: string,
  body: unknown,
  config: { headers: Record<string, string>; timeout: number }
) => Promise<{ data: any }>;

export interface PlannerOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  post?: PostFn;
  maxAttempts?: number;         // initial call + repairs
  budgetMs?: number;            // total time for all attempts
  attemptTimeoutMs?: number;    // per HTTP call
  maxRateLimitWaitMs?: number;  // longest 429 wait we accept
  forceFallback?: boolean;
}

export interface PlannerResult {
  plan: UIPlan;
  provider: 'llm' | 'deterministic';
  attempts: number;          // LLM calls made
  fallbackReason?: string;   // why the deterministic planner was used
  cached?: boolean;          // served from the cache
}

export class AIPlannerService {
  private cache = new Map<string, PlannerResult>();
  private cacheLoaded = false;

  constructor(private opts: PlannerOptions = {}) {}

  // Read env at call time so dotenv load order never matters.
  private get apiKey() { return this.opts.apiKey ?? (process.env.AI_API_KEY || process.env.OPENAI_API_KEY); }
  private get endpoint() { return this.opts.endpoint ?? (process.env.AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions'); }
  private get model() { return this.opts.model ?? (process.env.AI_MODEL || 'gpt-4o-mini'); }
  private get forceFallback() { return this.opts.forceFallback ?? process.env.AI_FORCE_FALLBACK === '1'; }
  private get maxAttempts() { return this.opts.maxAttempts ?? 2; }
  private get budgetMs() { return this.opts.budgetMs ?? 25000; }
  private get attemptTimeoutMs() { return this.opts.attemptTimeoutMs ?? 10000; }
  private get maxRateWaitMs() { return this.opts.maxRateLimitWaitMs ?? Number(process.env.AI_MAX_RATE_WAIT_MS || 10000); }
  private get cacheOn() { return process.env.AI_CACHE !== '0'; }
  private get post(): PostFn { return this.opts.post ?? ((url, body, cfg) => axios.post(url, body, cfg)); }
  private get maxTokens(): number { return Number(process.env.AI_MAX_TOKENS || 3000); }
  private get jsonModeEnabled(): boolean { return process.env.AI_JSON_MODE !== '0'; }

  public async generatePlan(input: PlannerInput): Promise<PlannerResult> {
    const skip = this.skipReason(input);
    if (skip) return this.fallback(input, skip, 0);

    this.loadCache();
    const userPayload = buildUserPayload(input);
    const systemPrompt = buildSystemPrompt();
    // Key includes model + prompt, so editing the prompt invalidates old cached plans.
    const cacheKey = createHash('sha1').update(this.model).update(systemPrompt).update(JSON.stringify(userPayload)).digest('hex');
    const hit = this.cacheOn ? this.cache.get(cacheKey) : undefined;
    if (hit) {
      console.log('✓ Plan served from cache.');
      return { ...hit, plan: structuredClone(hit.plan), cached: true };
    }

    const started = Date.now();
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(userPayload) },
    ];

    let attempts = 0;
    let lastIssues: string[] = [];

    while (attempts < this.maxAttempts) {
      const remaining = this.budgetMs - (Date.now() - started);
      if (remaining < 3000) { lastIssues = ['time budget exhausted']; break; }

      attempts++;
      let content: string;
      try {
        content = await this.callModel(messages, Math.min(this.attemptTimeoutMs, remaining));
      } catch (err) {
        return this.fallback(input, `LLM request failed: ${this.describe(err)}`, attempts);
      }

      const checked = this.check(content, input);
      if (checked.ok) {
        console.log(`✓ LLM plan accepted (attempt ${attempts}, ${Date.now() - started}ms).`);
        const result: PlannerResult = { plan: checked.plan, provider: 'llm', attempts };
        this.remember(cacheKey, result);
        return result;
      }

      lastIssues = checked.issues;
      console.warn(`⚠️ LLM plan rejected (attempt ${attempts}): ${lastIssues.slice(0, 3).join(' | ')}`);
      messages.push(
        { role: 'assistant', content },
        { role: 'user', content: `Your JSON was rejected:\n- ${lastIssues.slice(0, 8).join('\n- ')}\nReturn the corrected JSON object only.` }
      );
    }

    return this.fallback(input, `validation failed: ${lastIssues.slice(0, 3).join('; ')}`, attempts);
  }

  // ---- cache (memory + optional disk via AI_CACHE_FILE) ----
  private loadCache() {
    if (this.cacheLoaded) return;
    this.cacheLoaded = true;
    const file = process.env.AI_CACHE_FILE;
    if (!file || !this.cacheOn) return;
    try {
      const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const [k, v] of Object.entries(obj)) this.cache.set(k, v as PlannerResult);
      console.log(`ℹ️  Loaded ${this.cache.size} cached plans from ${file}`);
    } catch (_e) { /* no cache file yet */ }
  }

  private remember(key: string, result: PlannerResult) {
    if (!this.cacheOn) return;
    if (this.cache.size >= 100) this.cache.delete(this.cache.keys().next().value!);
    this.cache.set(key, result);
    const file = process.env.AI_CACHE_FILE;
    if (!file) return;
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(Object.fromEntries(this.cache)));
    } catch (_e) { console.warn('⚠️ Could not write plan cache file.'); }
  }

  private skipReason(input: PlannerInput): string | null {
    if (this.forceFallback) return 'AI_FORCE_FALLBACK is set';
    if (!this.apiKey) return 'no API key configured';
    if (!(input.prompt || '').trim() && !input.clarificationResponse) return 'empty prompt (initial dashboard)';
    return null;
  }

  /**
   * Call the LLM with rate-limit retry and Groq json_validate_failed recovery.
   *
   * Groq sometimes returns HTTP 400 with `error.failed_generation` containing the
   * rejected text.  If we can salvage it, we return it for our own parser to handle.
   * If not, we retry once without response_format so the model can produce free text.
   */
  private async callModel(messages: ChatMessage[], timeoutMs: number): Promise<string> {
    try {
      return await this.callOnce(messages, timeoutMs, this.jsonModeEnabled);
    } catch (err) {
      // Groq json_validate_failed — 400 with failed_generation text
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const errBody = err.response.data?.error;
        const failedGen: string | undefined = errBody?.failed_generation;
        if (typeof failedGen === 'string' && failedGen.trim().length > 0) {
          console.warn(`⚠️ json_validate_failed: len=${failedGen.length} tail=…${failedGen.slice(-80)}`);
          return failedGen;
        }
        // No salvageable text — retry once without JSON mode
        console.warn(`⚠️ json_validate_failed with no text; retrying without JSON mode.`);
        return this.callOnce(messages, timeoutMs, false);
      }

      // Rate-limit retry (429)
      const wait = this.rateLimitWaitMs(err);
      if (wait !== null && wait <= this.maxRateWaitMs) {   // one wait, then one retry
        console.log(`⏳ Rate limited; waiting ${wait}ms before one retry.`);
        await new Promise(r => setTimeout(r, wait));
        return this.callOnce(messages, timeoutMs, this.jsonModeEnabled);
      }
      throw err;
    }
  }

  private async callOnce(messages: ChatMessage[], timeoutMs: number, jsonMode: boolean): Promise<string> {
    const effort = process.env.AI_REASONING_EFFORT; // low | medium | high (reasoning models only)
    const res = await this.post(
      this.endpoint,
      {
        model: this.model,
        messages,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        temperature: 0.1,
        max_tokens: this.maxTokens,
        ...(effort ? { reasoning_effort: effort } : {}),
      },
      { headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, timeout: timeoutMs }
    );
    const u = res.data?.usage;
    if (u) console.log(`📊 tokens: prompt=${u.prompt_tokens} completion=${u.completion_tokens}`);
    const finishReason = res.data?.choices?.[0]?.finish_reason;
    if (finishReason === 'length') {
      console.warn(`⚠️ finish_reason=length: model output was truncated (max_tokens=${this.maxTokens}). Consider increasing AI_MAX_TOKENS.`);
    }
    const content = res.data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('empty model response');
    return content;
  }

  private rateLimitWaitMs(err: unknown): number | null {
    if (!axios.isAxiosError(err) || err.response?.status !== 429) return null;
    const s = Number(err.response.headers?.['retry-after']);
    return Number.isFinite(s) && s > 0 ? Math.ceil(s * 1000) : 2000;
  }

  private check(content: string, input: PlannerInput): { ok: true; plan: UIPlan } | { ok: false; issues: string[] } {
    let raw: any;
    try {
      // Strip markdown fences, then extract from first { to last }
      let cleaned = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }
      raw = JSON.parse(cleaned);
    } catch (e: any) {
      return { ok: false, issues: [`response was not valid JSON (${e.message})`] };
    }

    const banned = (Array.isArray(raw?.components) ? raw.components : [])
      .map((c: any, i: number) => (!c?.retainId && BANNED_NEW_TYPES.has(c?.type) ? `components.${i}: ${c.type} is not allowed (numbers come from the data layer)` : ''))
      .filter(Boolean);
    if (banned.length) return { ok: false, issues: banned };

    const r = buildPlanFromDraft(raw, {
      prompt: input.prompt,
      previousPlan: input.previousPlan,
      pinnedComponentIds: input.pinnedComponentIds,
    });
    return r.ok ? { ok: true, plan: r.plan } : { ok: false, issues: r.issues };
  }

  private async fallback(input: PlannerInput, reason: string, attempts: number): Promise<PlannerResult> {
    console.log(`ℹ️  Using deterministic planner: ${reason}`);
    return { plan: await fallbackPlanner.plan(input), provider: 'deterministic', attempts, fallbackReason: reason };
  }

  // Never include the Authorization header or the key in logs.
  private describe(err: unknown): string {
    if (axios.isAxiosError(err)) {
      const msg = (err.response?.data as any)?.error?.message;
      const h: any = err.response?.headers;
      const hs = typeof h?.toJSON === 'function' ? h.toJSON() : h ?? {};
      const limits = Object.entries(hs)
        .filter(([k]) => /ratelimit|retry-after/i.test(k))
        .map(([k, v]) => `${k}=${v}`)
        .join(' ');
      return `HTTP ${err.response?.status ?? 'no response'} ${err.code ?? ''}${msg ? ` - ${String(msg).slice(0, 240)}` : ''}${limits ? ` [${limits}]` : ''}`.trim();
    }
    return err instanceof Error ? err.message : String(err);
  }
}

export const aiPlanner = new AIPlannerService();