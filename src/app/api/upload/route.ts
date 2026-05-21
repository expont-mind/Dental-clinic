import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB safety net (client compresses to ~1.5MB first)

export async function POST(req: NextRequest) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER;

  if (!cloud || !preset) {
    return NextResponse.json(
      { error: "Cloudinary is not configured." },
      { status: 500 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPG, PNG, or WebP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 10MB." },
      { status: 400 },
    );
  }

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("upload_preset", preset);
  if (folder) cloudinaryForm.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    { method: "POST", body: cloudinaryForm },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[upload] Cloudinary error:", res.status, text);
    return NextResponse.json(
      { error: `Upload failed (${res.status})` },
      { status: 500 },
    );
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    return NextResponse.json(
      { error: "Cloudinary returned no URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: data.secure_url });
}
