import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"];

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG and JPEG images are allowed." },
        { status: 400 }
      );
    }

    // Generate safe filename
    const ext = file.type === "image/png" ? "png" : "jpg";
    const base = productId || crypto.randomUUID();
    // Sanitize the base to remove any path traversal characters
    const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, "-");
    const filename = `${safeBase}-${Date.now()}.${ext}`;

    // Ensure the products directory exists
    const productsDir = path.join(process.cwd(), "public", "products");
    await fs.mkdir(productsDir, { recursive: true });

    // Save the file
    const filePath = path.join(productsDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    // Return the public URL
    return NextResponse.json({ url: `/products/${filename}` });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

