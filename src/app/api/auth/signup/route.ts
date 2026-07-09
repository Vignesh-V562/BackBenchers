import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { queryD1 } from "@/lib/d1";
import { sendEmail } from "@/lib/mail";

// List of blacklisted generic email domains to enforce institutional signup
const GENERIC_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "mail.com",
  "protonmail.com",
  "zoho.com",
  "aol.com",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, department, year } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const domain = cleanEmail.split("@")[1];

    if (!domain) {
      return NextResponse.json(
        { error: "Invalid email address format." },
        { status: 400 }
      );
    }

    // Enforce institutional emails
    if (GENERIC_DOMAINS.has(domain)) {
      return NextResponse.json(
        { error: "Signup requires an institutional/college email address (e.g. user@college.edu)." },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    const { results: existingUsers } = await queryD1(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    // 2. Resolve college from email domain
    const { results: existingColleges } = await queryD1(
      "SELECT id, status FROM colleges WHERE domain = ? LIMIT 1",
      [domain]
    );

    let collegeId = "";
    let collegeStatus = "PENDING";

    if (existingColleges.length > 0) {
      collegeId = existingColleges[0].id;
      collegeStatus = existingColleges[0].status;
    } else {
      // Create a new PENDING college for the new domain
      collegeId = crypto.randomUUID();
      const rawName = domain.split(".")[0];
      const collegeName = rawName.charAt(0).toUpperCase() + rawName.slice(1) + " College";
      const slug = rawName.toLowerCase();

      await queryD1(
        "INSERT INTO colleges (id, name, domain, slug, status) VALUES (?, ?, ?, ?, 'PENDING')",
        [collegeId, collegeName, domain, slug]
      );
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Generate and store verification token with user data
    const cleanYear = year ? parseInt(year, 10) : null;
    const cleanDept = department || null;
    const userData = JSON.stringify({
      name: name.trim(),
      passwordHash,
      collegeId,
      department: cleanDept,
      year: cleanYear
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    const tokenId = crypto.randomUUID();

    await queryD1(
      `INSERT INTO verification_tokens (id, email, token, type, expires, user_data) VALUES (?, ?, ?, 'EMAIL_VERIFICATION', ?, ?)`,
      [tokenId, cleanEmail, verificationToken, expires, userData]
    );

    // 6. Send verification email
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: cleanEmail,
      subject: "Verify your Backbenchers Account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #7c6dff;">Welcome to Backbenchers!</h2>
          <p>Hi ${name.trim()},</p>
          <p>Thank you for signing up. Please verify your email address to unlock your college academic workspace.</p>
          <div style="margin: 24px 0;">
            <a href="${verificationLink}" style="background-color: #7c6dff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser: <br/> ${verificationLink}</p>
          <p style="font-size: 12px; color: #999; margin-top: 24px;">This link will expire in 24 hours.</p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: "User registered successfully. Please verify your email address.",
      user: {
        name,
        email: cleanEmail,
        collegeId,
        collegeStatus,
      },
    });
  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during signup." },
      { status: 500 }
    );
  }
}
