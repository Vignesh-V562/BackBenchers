import nodemailer from "nodemailer";

/**
 * Email dispatch utility using Nodemailer (SMTP) or local log fallback
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpUser || !smtpPassword) {
    console.log("\n=======================================================");
    console.log(`[MOCK EMAIL SERVICE]`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`-------------------------------------------------------`);
    
    // Extract HTML anchor links for easy copy-pasting during local development
    const links: string[] = [];
    const hrefRegex = /href="([^"]+)"/g;
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      links.push(match[1]);
    }
    
    if (links.length > 0) {
      console.log(`Verification/Reset Links (Click or Copy):`);
      links.forEach(l => console.log(`  -> ${l}`));
    } else {
      console.log(html);
    }
    console.log("=======================================================\n");
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `"Backbenchers" <${smtpUser}>`,
      to,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Nodemailer send email error:", err.message || err);
    throw err;
  }
}
