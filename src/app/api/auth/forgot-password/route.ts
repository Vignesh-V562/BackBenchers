import { NextResponse } from "next/server";
import crypto from "crypto";
import { queryD1 } from "@/lib/d1";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Verify user exists
    const { results: users } = await queryD1(
      "SELECT id, name FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    const user = users[0];
    if (!user) {
      // Return success to avoid email enumeration security vulnerability
      return NextResponse.json({
        success: true,
        message: "If this email is associated with a registered account, a password reset link has been sent.",
      });
    }

    // 2. Generate and store reset token (delete previous reset tokens for this email first)
    await queryD1(
      "DELETE FROM verification_tokens WHERE email = ? AND type = 'PASSWORD_RESET'",
      [cleanEmail]
    );

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiration
    const tokenId = crypto.randomUUID();

    await queryD1(
      "INSERT INTO verification_tokens (id, email, token, type, expires) VALUES (?, ?, ?, 'PASSWORD_RESET', ?)",
      [tokenId, cleanEmail, resetToken, expires]
    );

    // 3. Send email
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: cleanEmail,
      subject: "Reset your Backbenchers Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #7c6dff;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password for your Backbenchers account. Click the button below to choose a new password.</p>
          <div style="margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #7c6dff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser: <br/> ${resetLink}</p>
          <p style="font-size: 11px; color: #999; margin-top: 24px;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
          <p style="font-size: 11px; color: #999;">This link will expire in 1 hour.</p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: "If this email is associated with a registered account, a password reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request." }, { status: 500 });
  }
}
