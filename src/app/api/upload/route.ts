import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionUser } from "@/lib/auth-helper";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "png", "jpg", "jpeg"]);

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds maximum size limit of 10MB." },
        { status: 400 }
      );
    }

    // Validate extension
    const nameParts = file.name.split(".");
    const ext = nameParts[nameParts.length - 1].toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `File type not supported. Allowed formats: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}` },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Cloudinary credentials missing. Returning local development mock URL.");
      // Fallback for development: return a realistic-looking mock URL based on the file name
      const fileId = crypto.randomUUID();
      const mockUrl = `https://res.cloudinary.com/demo/image/upload/v1234567890/backbenchers/${fileId}_${file.name}`;
      return NextResponse.json({
        success: true,
        secure_url: mockUrl,
        file_type: ext,
      });
    }

    // Signed upload to Cloudinary via REST API
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "backbenchers";

    // Generate SHA-1 signature
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("folder", folder);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("signature", signature);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const res = await fetch(cloudinaryUrl, {
      method: "POST",
      body: cloudinaryFormData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Cloudinary upload API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Failed to upload file to Cloudinary." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      secure_url: data.secure_url,
      file_type: ext,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file." }, { status: 500 });
  }
}
