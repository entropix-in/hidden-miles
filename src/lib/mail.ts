import { site } from "@/data/site";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/**
 * Send the password reset email through Resend when configured.
 * Without an API key the link is logged server-side (useful in local dev).
 */
export async function sendPasswordResetEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info(
      `[hidden-miles] password reset link for ${to}: ${url} (set RESEND_API_KEY to email it)`,
    );
    return false;
  }

  const from =
    process.env.EMAIL_FROM?.trim() ||
    `${site.name} <onboarding@resend.dev>`;
  const firstName = name.split(" ")[0] || "traveller";
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(url);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Reset your Hidden Miles password",
        text: `Hi ${firstName},

We received a request to reset the password for your Hidden Miles account.

Set a new password here (valid for 1 hour):
${url}

If you did not ask for this, you can ignore this email — your password will stay the same.

Hidden Miles
${site.phone} · ${site.email}`,
        html: `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#faf8f3;font-family:Arial,Helvetica,sans-serif;color:#0b2735;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eae2cf;border-radius:20px;overflow:hidden;">
      <tr>
        <td style="background:#0b2735;padding:24px 32px;">
          <p style="margin:0;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#ddb02a;font-weight:bold;">Hidden Miles</p>
          <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#ffffff;">Reset your password</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">We received a request to reset the password for your Hidden Miles account.</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">This link is valid for one hour.</p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="border-radius:999px;background:#0b2735;">
                <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">Set a new password</a>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#265a6d;">If the button does not work, paste this link into your browser:<br /><a href="${safeUrl}" style="color:#196785;word-break:break-all;">${safeUrl}</a></p>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#265a6d;">If you did not ask for this, you can ignore this email — your password will stay the same.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 32px;background:#faf8f3;border-top:1px solid #eae2cf;font-size:12px;line-height:1.6;color:#265a6d;">
          Hidden Miles Holidays Pvt. Ltd. · ${site.phone} · ${site.email}
        </td>
      </tr>
    </table>
  </body>
</html>`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `[hidden-miles] Resend rejected the reset email (${response.status}): ${detail.slice(0, 300)}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[hidden-miles] failed to send password reset email",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
