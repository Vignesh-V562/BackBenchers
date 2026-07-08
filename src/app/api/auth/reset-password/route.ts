import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryD1 } from "@/lib/d1";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    // 1. Fetch token record
    const { results: tokens } = await queryD1(
      "SELECT id, email, expires FROM verification_tokens WHERE token = ? AND type = 'PASSWORD_RESET' LIMIT 1",
      [token]
    );

    const tokenRecord = tokens[0];
    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    // 2. Check token expiration
    const expiryDate = new Date(tokenRecord.expires);
    if (expiryDate < new Date()) {
      await queryD1("DELETE FROM verification_tokens WHERE id = ?", [tokenRecord.id]);
      return NextResponse.json({ error: "Reset token has expired. Please request another one." }, { status: 400 });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Update password
    await queryD1(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hashedPassword, tokenRecord.email]
    );

    // 5. Delete token
    await queryD1("DELETE FROM verification_tokens WHERE id = ?", [tokenRecord.id]);

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password API error:", error);
    return NextResponse.json({ error: error.message || "Failed to reset password." }, { status: 500 });
  }
}
