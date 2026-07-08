/**
 * Email dispatch utility using Resend REST API or local log fallback
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
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
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
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Backbenchers <onboarding@resend.dev>", // resend default onboarding sandbox sender
        to,
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || JSON.stringify(data));
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Resend send email error:", err.message || err);
    throw err;
  }
}
