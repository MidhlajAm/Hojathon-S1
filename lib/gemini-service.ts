import { withGemini } from "@/lib/gemini";

export interface GeminiTextRequest {
  prompt: string;
  model?: string;
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
}

export interface GeminiImage {
  mimeType: string;
  data?: string;
  url?: string;
}

export interface GeminiImageRequest {
  prompt: string;
  image: GeminiImage;
  model?: string;
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
}

export interface GeminiUsage {
  promptTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface GeminiResult {
  text: string;
  model: string;
  usage?: GeminiUsage;
}

export type GeminiRequest = GeminiTextRequest | GeminiImageRequest;

export type GeminiServiceErrorCode =
  | "INVALID_REQUEST"
  | "IMAGE_FETCH_FAILED"
  | "EMPTY_RESPONSE"
  | "PROVIDER_ERROR"
  | "ABORTED";

export class GeminiServiceError extends Error {
  readonly code: GeminiServiceErrorCode;
  readonly cause: unknown;

  constructor(code: GeminiServiceErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "GeminiServiceError";
    this.code = code;
    this.cause = cause;
  }
}

function isImageRequest(request: GeminiRequest): request is GeminiImageRequest {
  return "image" in request;
}

function validateRequest(request: GeminiRequest): void {
  if (!request.prompt.trim()) {
    throw new GeminiServiceError("INVALID_REQUEST", "Gemini prompt cannot be empty.");
  }

  if (!isImageRequest(request)) return;
  if (!request.image.mimeType.trim() || (!request.image.data && !request.image.url)) {
    throw new GeminiServiceError(
      "INVALID_REQUEST",
      "An image requires a MIME type and either data or a URL.",
    );
  }
}

async function imagePart(image: GeminiImage): Promise<{ inlineData: { mimeType: string; data: string } }> {
  if (image.data) {
    return { inlineData: { mimeType: image.mimeType, data: image.data } };
  }

  try {
    const response = await fetch(image.url!);
    if (!response.ok) {
      throw new Error(`Image request returned HTTP ${response.status}.`);
    }
    const data = Buffer.from(await response.arrayBuffer()).toString("base64");
    return { inlineData: { mimeType: image.mimeType, data } };
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error;
    throw new GeminiServiceError("IMAGE_FETCH_FAILED", "Could not load the image for Gemini.", error);
  }
}

function usageFrom(response: { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } }): GeminiUsage | undefined {
  const metadata = response.usageMetadata;
  if (!metadata) return undefined;
  return {
    promptTokens: metadata.promptTokenCount,
    outputTokens: metadata.candidatesTokenCount,
    totalTokens: metadata.totalTokenCount,
  };
}

export async function generateGemini(request: GeminiRequest): Promise<GeminiResult> {
  validateRequest(request);

  try {
    return await withGemini(async (client, config) => {
      const parts = isImageRequest(request)
        ? [await imagePart(request.image), { text: request.prompt }]
        : [{ text: request.prompt }];
      const response = await client.models.generateContent({
        model: request.model ?? config.model,
        config: {
          ...(request.systemInstruction ? { systemInstruction: request.systemInstruction } : {}),
          ...(request.responseSchema
            ? { responseMimeType: "application/json", responseSchema: request.responseSchema }
            : {}),
        },
        contents: [{ role: "user", parts }],
      });

      if (!response.text?.trim()) {
        throw new GeminiServiceError("EMPTY_RESPONSE", "Gemini returned no text.");
      }

      return {
        text: response.text.trim(),
        model: request.model ?? config.model,
        usage: usageFrom(response),
      };
    });
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new GeminiServiceError("ABORTED", "The Gemini request was cancelled.", error);
    }
    throw new GeminiServiceError("PROVIDER_ERROR", "Gemini request failed after key rotation.", error);
  }
}

export function generateText(request: GeminiTextRequest): Promise<GeminiResult> {
  return generateGemini(request);
}

export function analyzeImage(request: GeminiImageRequest): Promise<GeminiResult> {
  return generateGemini(request);
}