import { NextResponse } from "next/server";
import { queryD1 } from "@/lib/d1";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing verification token." }, { status: 400 });
    }

    // 1. Fetch token details
    const { results: tokens } = await queryD1(
      "SELECT id, email, expires, user_data FROM verification_tokens WHERE token = ? AND type = 'EMAIL_VERIFICATION' LIMIT 1",
      [token]
    );

    const tokenRecord = tokens[0];
    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired verification token." }, { status: 400 });
    }

    // 2. Check expiration
    const expiryDate = new Date(tokenRecord.expires);
    if (expiryDate < new Date()) {
      // Clean up expired token
      await queryD1("DELETE FROM verification_tokens WHERE id = ?", [tokenRecord.id]);
      return NextResponse.json({ error: "Verification token has expired. Please sign up again." }, { status: 400 });
    }

    // 3. Create user in database
    if (tokenRecord.user_data) {
      const userData = JSON.parse(tokenRecord.user_data);
      const userId = crypto.randomUUID();
      
      await queryD1(
        `INSERT INTO users (id, college_id, name, email, department, year, role, password_hash, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, 'STUDENT', ?, datetime('now'))`,
        [userId, userData.collegeId, userData.name, tokenRecord.email, userData.department, userData.year, userData.passwordHash]
      );
    } else {
      // Fallback for older tokens (if any)
      await queryD1(
        "UPDATE users SET email_verified = datetime('now') WHERE email = ?",
        [tokenRecord.email]
      );
    }

    // 4. Delete the token
    await queryD1("DELETE FROM verification_tokens WHERE id = ?", [tokenRecord.id]);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error: any) {
    console.error("Verification API error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify email." }, { status: 500 });
  }
}
