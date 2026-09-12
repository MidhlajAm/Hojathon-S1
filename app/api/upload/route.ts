import { storeImage } from "@/lib/cloudinary";

/** POST /api/upload — multipart form with a single `file` field. */
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Attach a photo to upload." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "That file is not an image." }, { status: 415 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json(
      { error: "That photo is over 10 MB. Try a smaller one." },
      { status: 413 },
    );
  }

  try {
    const stored = await storeImage(file);
    return Response.json(stored, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The upload could not be stored.";
    return Response.json({ error: message }, { status: 502 });
  }
}
