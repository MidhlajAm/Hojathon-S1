/**
 * Image storage adapter.
 *
 * With `CLOUDINARY_URL` set, uploads go to Cloudinary. Without it, the uploaded
 * file comes back as a data URL so the whole report flow works offline with no
 * account. `next.config.ts` already allows `res.cloudinary.com` for `next/image`.
 */

export interface StoredImage {
  url: string;
  /** False when the image is only a data URL held in memory. */
  persisted: boolean;
}

function parseCloudinaryUrl(raw: string) {
  // cloudinary://<api_key>:<api_secret>@<cloud_name>
  const match = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(raw);
  if (!match) return null;
  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
}

export function cloudinaryAvailable(): boolean {
  const raw = process.env.CLOUDINARY_URL ?? "";
  return raw.length > 0 && parseCloudinaryUrl(raw) !== null;
}

export async function storeImage(file: File): Promise<StoredImage> {
  const raw = process.env.CLOUDINARY_URL ?? "";
  const credentials = raw ? parseCloudinaryUrl(raw) : null;

  if (!credentials) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "image/jpeg";
    return {
      url: `data:${mime};base64,${buffer.toString("base64")}`,
      persisted: false,
    };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await sign(
    `timestamp=${timestamp}${credentials.apiSecret}`,
  );

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", credentials.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${credentials.cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  if (!response.ok) {
    throw new Error(`Cloudinary rejected the upload (${response.status}).`);
  }

  const data = (await response.json()) as { secure_url: string };
  return { url: data.secure_url, persisted: true };
}

async function sign(payload: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
