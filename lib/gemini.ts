/**
 * Gemini adapter.
 *
 * Returns configuration when `GEMINI_API_KEY` is set, and reports "mock" when it
 * is not, so the app runs with an empty `.env.local`. The analysis agent calls
 * `geminiConfig()` and decides what to do; nothing else in the app imports this.
 *
 * When you wire the SDK in:
 *   npm install @google/genai
 *   const ai = new GoogleGenAI({ apiKey: cfg.apiKey })
 */

export interface GeminiConfig {
  available: boolean;
  apiKey: string;
  /** Vision + reasoning model used for issue analysis. */
  model: string;
}

export function geminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY ?? "";
  return {
    available: apiKey.length > 0,
    apiKey,
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  };
}

export function assertGemini(): GeminiConfig {
  const config = geminiConfig();
  if (!config.available) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local to run the real analysis agent.",
    );
  }
  return config;
}
