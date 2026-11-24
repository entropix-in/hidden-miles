import { site } from "@/data/site";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Zoho data centre host, e.g. cpaas.zoho.in (India) or cpaas.zoho.com. */
function zohoEmailUrl() {
  const host = (process.env.ZOHO_EMAIL_HOST?.trim() || "cpaas.zoho.in")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  return `https://${host}/v1.1/email`;
}

/** Accepts the key with or without the "Zoho-enczapikey " prefix. */
function zohoApiKey() {
  return (process.env.ZOHO_EMAIL_API_KEY?.trim() || "").replace(/^Zoho-enczapikey\s+/i, "");
}

/** Email goes out once the Zoho key and a verified sender are set. */
export function mailConfigured() {
  return Boolean(zohoApiKey() && process.env.EMAIL_FROM?.trim());
}

/** Accepts `Name <address>` or a bare address. */
function parseSender(value: string) {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) return { address: match[2].trim(), name: match[1].replace(/^"|"$/g, "") || site.name };
  return { address: value.trim(), name: site.name };
}

type MailContent = {
  /** Short tag sent to Zoho as client_reference. */
  kind: "password-reset" | "verify-email" | "change-email";
  subject: string;
  heading: string;
  /** Paragraphs shown above the button. */
  intro: string[];
  cta: string;
  url: string;
  /** Short line shown under the link, e.g. why they got this email. */
  footnote: string;
};

function render({ heading, intro, cta, url, footnote }: MailContent, name: string) {
  const firstName = name.split(" ")[0] || "traveller";
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(url);

  const text = `Hi ${firstName},

${intro.join("\n\n")}

${cta}:
${url}

${footnote}

Hidden Miles
${site.phone} · ${site.email}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#faf8f3;font-family:Arial,Helvetica,sans-serif;color:#0b2735;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eae2cf;border-radius:20px;overflow:hidden;">
      <tr>
        <td style="background:#0b2735;padding:24px 32px;">
          <p style="margin:0;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#ddb02a;font-weight:bold;">Hidden Miles</p>
          <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#ffffff;">${escapeHtml(heading)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hi ${safeName},</p>
          ${intro
            .map(
              (line) =>
                `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${escapeHtml(line)}</p>`,
            )
            .join("\n          ")}
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:10px;">
            <tr>
              <td style="border-radius:999px;background:#0b2735;">
                <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${escapeHtml(cta)}</a>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#265a6d;">If the button does not work, paste this link into your browser:<br /><a href="${safeUrl}" style="color:#196785;word-break:break-all;">${safeUrl}</a></p>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#265a6d;">${escapeHtml(footnote)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 32px;background:#faf8f3;border-top:1px solid #eae2cf;font-size:12px;line-height:1.6;color:#265a6d;">
          Hidden Miles Holidays Pvt. Ltd. · ${site.phone} · ${site.email}
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

/**
 * Send an account email through Zoho (ZeptoMail CPaaS) when configured.
 * Without it the link is logged server-side (useful in local dev).
 */
async function sendAccountEmail(to: string, name: string, content: MailContent) {
  const apiKey = zohoApiKey();
  const sender = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !sender) {
    console.info(
      `[hidden-miles] ${content.subject} — link for ${to}: ${content.url} (set ZOHO_EMAIL_API_KEY and EMAIL_FROM to email it)`,
    );
    return false;
  }

  const { text, html } = render(content, name);
  const bounceAddress = process.env.ZOHO_BOUNCE_ADDRESS?.trim();
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();

  try {
    const response = await fetch(zohoEmailUrl(), {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: parseSender(sender),
        to: [{ email_address: { address: to, name } }],
        ...(replyTo ? { reply_to: [parseSender(replyTo)] } : {}),
        ...(bounceAddress ? { bounce_address: bounceAddress } : {}),
        subject: content.subject,
        textbody: text,
        htmlbody: html,
        // Tracking rewrites links; account links must reach us untouched.
        track_clicks: false,
        track_opens: false,
        client_reference: `account-${content.kind}`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `[hidden-miles] Zoho rejected "${content.subject}" (${response.status}): ${detail.slice(0, 300)}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      `[hidden-miles] failed to send "${content.subject}"`,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

type Recipient = { to: string; name: string; url: string };

export function sendPasswordResetEmail({ to, name, url }: Recipient) {
  return sendAccountEmail(to, name, {
    kind: "password-reset",
    subject: "Reset your Hidden Miles password",
    heading: "Reset your password",
    intro: [
      "We received a request to reset the password for your Hidden Miles account.",
      "This link is valid for one hour and can be used once.",
    ],
    cta: "Set a new password",
    url,
    footnote:
      "If you did not ask for this, you can ignore this email. Your password will stay the same.",
  });
}

export function sendVerificationEmail({ to, name, url }: Recipient) {
  return sendAccountEmail(to, name, {
    kind: "verify-email",
    subject: "Confirm your email for Hidden Miles",
    heading: "Confirm your email",
    intro: [
      "Thanks for creating a Hidden Miles account. Confirm this is your email address and we will sign you in.",
      "This link is valid for 24 hours.",
    ],
    cta: "Confirm my email",
    url,
    footnote:
      "If you did not create an account, you can ignore this email. Nothing will be set up without the confirmation.",
  });
}

export function sendChangeEmailConfirmation({
  to,
  name,
  url,
  newEmail,
}: Recipient & { newEmail: string }) {
  return sendAccountEmail(to, name, {
    kind: "change-email",
    subject: "Approve your new Hidden Miles email",
    heading: "Approve an email change",
    intro: [
      `Someone asked to change the email on your Hidden Miles account to ${newEmail}.`,
      "If that was you, approve the change below. We will then send a confirmation link to the new address.",
    ],
    cta: "Approve the change",
    url,
    footnote:
      "If you did not ask for this, ignore this email and consider changing your password.",
  });
}
