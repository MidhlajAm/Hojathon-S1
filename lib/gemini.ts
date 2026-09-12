import { GoogleGenAI } from "@google/genai";

export interface GeminiConfig {
  available: boolean;
  apiKey: string;
  apiKeys: string[];
  /** Vision + reasoning model used for issue analysis. */
  model: string;
}

export interface GeminiKeyUsage {
  key: string;
  attempts: number;
  successes: number;
  failures: number;
  lastUsedAt?: string;
  lastError?: string;
  disabledUntil?: string;
}

interface KeyState {
  key: string;
  attempts: number;
  successes: number;
  failures: number;
  lastUsedAt?: number;
  lastError?: string;
  disabledUntil?: number;
}

const keyStates = new Map<string, KeyState>();
let nextKeyIndex = 0;

function configuredKeys(): string[] {
  const raw = process.env.GEMINI_API_KEYS?.trim();
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((key): key is string => typeof key === "string").map((key) => key.trim()).filter(Boolean);
      }
    } catch {
      // Also accept a simple comma/newline-separated env value.
    }

    return raw.split(/[\n,]/).map((key) => key.trim()).filter(Boolean);
  }

  const legacyKey = process.env.GEMINI_API_KEY?.trim();
  return legacyKey ? [legacyKey] : [];
}

export function geminiConfig(): GeminiConfig {
  const apiKeys = configuredKeys();
  return {
    available: apiKeys.length > 0,
    apiKey: apiKeys[0] ?? "",
    apiKeys,
    model: process.env.GEMINI_MODEL ?? "models/gemini-3.6-flash",
  };
}

export function assertGemini(): GeminiConfig {
  const config = geminiConfig();
  if (!config.available) {
    throw new Error(
      "GEMINI_API_KEYS or GEMINI_API_KEY is not set. Add it to .env.local to run the real analysis agent.",
    );
  }
  return config;
}

function isRetryableKeyError(error: unknown): boolean {
  const candidate = error as { status?: number; message?: string };
  const message = candidate.message?.toLowerCase() ?? String(error).toLowerCase();
  return (
    candidate.status === 401 ||
    candidate.status === 403 ||
    candidate.status === 429 ||
    message.includes("api key not valid") ||
    message.includes("api key") && message.includes("expired") ||
    message.includes("invalid api key") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted")
  );
}

function stateFor(key: string): KeyState {
  const existing = keyStates.get(key);
  if (existing) return existing;
  const state: KeyState = { key, attempts: 0, successes: 0, failures: 0 };
  keyStates.set(key, state);
  return state;
}

function nextAvailableKey(keys: string[], attempted: Set<string>): KeyState | undefined {
  const now = Date.now();
  for (let offset = 0; offset < keys.length; offset += 1) {
    const index = (nextKeyIndex + offset) % keys.length;
    const state = stateFor(keys[index]);
    if (!attempted.has(state.key) && (!state.disabledUntil || state.disabledUntil <= now)) {
      nextKeyIndex = (index + 1) % keys.length;
      return state;
    }
  }
  return undefined;
}

export function geminiUsage(): GeminiKeyUsage[] {
  return configuredKeys().map((key) => {
    const state = stateFor(key);
    return {
      key: `${key.slice(0, 4)}...${key.slice(-4)}`,
      attempts: state.attempts,
      successes: state.successes,
      failures: state.failures,
      lastUsedAt: state.lastUsedAt ? new Date(state.lastUsedAt).toISOString() : undefined,
      lastError: state.lastError,
      disabledUntil: state.disabledUntil
        ? state.disabledUntil === Number.MAX_SAFE_INTEGER
          ? "disabled"
          : new Date(state.disabledUntil).toISOString()
        : undefined,
    };
  });
}

export async function withGemini<T>(
  operation: (client: GoogleGenAI, config: GeminiConfig) => Promise<T>,
): Promise<T> {
  const config = assertGemini();
  const attempted = new Set<string>();
  let lastError: unknown;

  while (attempted.size < config.apiKeys.length) {
    const state = nextAvailableKey(config.apiKeys, attempted);
    if (!state) break;
    attempted.add(state.key);
    state.attempts += 1;
    state.lastUsedAt = Date.now();

    try {
      const result = await operation(new GoogleGenAI({ apiKey: state.key }), {
        ...config,
        apiKey: state.key,
      });
      state.successes += 1;
      state.lastError = undefined;
      return result;
    } catch (error) {
      state.failures += 1;
      state.lastError = error instanceof Error ? error.message : String(error);
      lastError = error;
      if (!isRetryableKeyError(error)) throw error;

      const retryMessage = state.lastError.toLowerCase();
      state.disabledUntil = retryMessage.includes("quota") || retryMessage.includes("rate") || retryMessage.includes("resource exhausted")
        ? Date.now() + 60_000
        : Number.MAX_SAFE_INTEGER;
    }
  }

  throw lastError instanceof Error
    ? new Error(`All configured Gemini API keys failed. Last error: ${lastError.message}`)
    : new Error("All configured Gemini API keys failed.");
}
