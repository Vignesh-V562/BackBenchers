import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { queryD1 } from "@/lib/d1";

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

    // 4. Create user
    const userId = crypto.randomUUID();
    const cleanYear = year ? parseInt(year, 10) : null;
    const cleanDept = department || null;

    await queryD1(
      `INSERT INTO users (id, college_id, name, email, department, year, role, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, 'STUDENT', ?)`,
      [userId, collegeId, name.trim(), cleanEmail, cleanDept, cleanYear, passwordHash]
    );

    return NextResponse.json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: userId,
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
