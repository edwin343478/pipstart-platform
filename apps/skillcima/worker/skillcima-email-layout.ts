import { skillcimaEmailTheme } from "./skillcima-email-theme";

export interface SkillcimaEmailLayoutInput {
  previewText: string;
  eyebrow: string;
  heading: string;

  /*
   * Only internally composed HTML may be passed here.
   * Editable course content itself remains structured
   * and is escaped by the future lesson composer.
   */
  trustedContentHtml: string;

  footerText?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requireText(value: string, field: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`SKILLCIMA_EMAIL_${field.toUpperCase()}_REQUIRED`);
  }

  return trimmed;
}

export function renderSkillcimaEmailLayout(
  input: SkillcimaEmailLayoutInput,
): string {
  const previewText = escapeHtml(
    requireText(input.previewText, "preview_text"),
  );

  const eyebrow = escapeHtml(requireText(input.eyebrow, "eyebrow"));

  const heading = escapeHtml(requireText(input.heading, "heading"));

  const footerText = escapeHtml(
    input.footerText?.trim() ||
      `${skillcimaEmailTheme.brandName} · ${skillcimaEmailTheme.domain}`,
  );

  if (!input.trustedContentHtml.trim()) {
    throw new Error("SKILLCIMA_EMAIL_CONTENT_REQUIRED");
  }

  const { colors, fonts } = skillcimaEmailTheme;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${heading}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .skillcima-shell {
        width: 100% !important;
      }

      .skillcima-pad {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
    }
  </style>
</head>

<body style="margin:0;padding:0;background:${colors.background};color:${colors.text};">

  <div
    style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;"
  >${previewText}</div>

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="width:100%;background:${colors.background};"
  >
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table
          role="presentation"
          class="skillcima-shell"
          width="${skillcimaEmailTheme.maxWidth}"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="width:100%;max-width:${skillcimaEmailTheme.maxWidth}px;background:${colors.surface};border:1px solid ${colors.border};border-radius:20px;overflow:hidden;"
        >

          <tr>
            <td
              class="skillcima-pad"
              style="padding:22px 40px;background:${colors.primary};font-family:${fonts.heading};font-size:24px;font-weight:700;line-height:1.2;color:${colors.text};"
            >
              ${skillcimaEmailTheme.brandName}
            </td>
          </tr>

          <tr>
            <td
              style="height:4px;background:${colors.accent};font-size:0;line-height:0;"
            >&nbsp;</td>
          </tr>

          <tr>
            <td
              class="skillcima-pad"
              style="padding:40px 40px 16px;font-family:${fonts.body};"
            >
              <div
                style="margin:0 0 12px;font-size:12px;font-weight:700;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;color:${colors.accent};"
              >${eyebrow}</div>

              <h1
                style="margin:0;font-family:${fonts.heading};font-size:32px;line-height:1.2;font-weight:700;color:${colors.text};"
              >${heading}</h1>
            </td>
          </tr>

          <tr>
            <td
              class="skillcima-pad"
              style="padding:16px 40px 40px;font-family:${fonts.body};font-size:16px;line-height:1.7;color:${colors.text};"
            >
              ${input.trustedContentHtml}
            </td>
          </tr>

          <tr>
            <td
              class="skillcima-pad"
              style="padding:24px 40px;background:${colors.soft};border-top:1px solid ${colors.border};font-family:${fonts.body};font-size:12px;line-height:1.6;color:${colors.muted};"
            >
              ${footerText}
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
