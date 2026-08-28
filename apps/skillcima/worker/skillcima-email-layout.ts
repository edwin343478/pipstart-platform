import { skillcimaEmailTheme } from "./skillcima-email-theme";

export interface SkillcimaEmailLayoutInput {
  previewText: string;
  eyebrow: string;
  heading: string;

  /*
   * Only internally composed and escaped HTML may
   * be passed through this field.
   */
  trustedContentHtml: string;

  progressCurrent?: number;
  progressTotal?: number;
  progressLabel?: string;

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

function requireProgressInteger(
  value: number | undefined,
  fallback: number,
  field: string,
): number {
  const resolved = value ?? fallback;

  if (!Number.isInteger(resolved) || resolved < 1 || resolved > 20) {
    throw new Error(`SKILLCIMA_EMAIL_${field.toUpperCase()}_INVALID`);
  }

  return resolved;
}

function renderProgressSegments(current: number, total: number): string {
  return Array.from({ length: total }, (_, index) => {
    const active = index < current;
    const background = active
      ? skillcimaEmailTheme.colors.primary
      : skillcimaEmailTheme.colors.soft;

    const rightPadding = index === total - 1 ? "0" : "6px";

    return `<td width="${100 / total}%" style="padding:0 ${rightPadding} 0 0;">
      <div style="height:5px;border-radius:999px;background:${background};font-size:0;line-height:0;">&nbsp;</div>
    </td>`;
  }).join("");
}

export function renderSkillcimaEmailLayout(
  input: SkillcimaEmailLayoutInput,
): string {
  const previewText = escapeHtml(
    requireText(input.previewText, "preview_text"),
  );

  const eyebrow = escapeHtml(requireText(input.eyebrow, "eyebrow"));
  const heading = escapeHtml(requireText(input.heading, "heading"));

  if (!input.trustedContentHtml.trim()) {
    throw new Error("SKILLCIMA_EMAIL_CONTENT_REQUIRED");
  }

  const progressTotal = requireProgressInteger(
    input.progressTotal,
    5,
    "progress_total",
  );

  const progressCurrent = requireProgressInteger(
    input.progressCurrent,
    1,
    "progress_current",
  );

  if (progressCurrent > progressTotal) {
    throw new Error("SKILLCIMA_EMAIL_PROGRESS_RANGE_INVALID");
  }

  const progressLabel = escapeHtml(
    input.progressLabel?.trim() || `Day ${progressCurrent} of ${progressTotal}`,
  );

  const footerText = escapeHtml(
    input.footerText?.trim() ||
      `${skillcimaEmailTheme.brandName} · ${skillcimaEmailTheme.domain}`,
  );

  const progressSegments = renderProgressSegments(
    progressCurrent,
    progressTotal,
  );

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
    body,
    table,
    td,
    a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    table {
      border-collapse: collapse !important;
    }

    @media only screen and (max-width: 560px) {
      .skillcima-shell {
        width: 100% !important;
      }

      .skillcima-outer {
        padding: 18px 10px !important;
      }

      .skillcima-header {
        padding: 6px 8px 20px !important;
      }

      .skillcima-card-pad {
        padding-left: 22px !important;
        padding-right: 22px !important;
      }

      .skillcima-title {
        font-size: 27px !important;
        line-height: 1.16 !important;
        overflow-wrap: anywhere !important;
        word-break: normal !important;
      }

      .skillcima-course-label {
        display: none !important;
        width: 0 !important;
        max-width: 0 !important;
        overflow: hidden !important;
      }

      .skillcima-button {
        display: block !important;
        width: auto !important;
        text-align: center !important;
      }
    }
  </style>
</head>

<body style="margin:0;padding:0;background:${colors.background};color:${colors.text};">

  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    ${previewText}
  </div>

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="width:100%;background:${colors.background};"
  >
    <tr>
      <td
        class="skillcima-outer"
        align="center"
        style="padding:28px 12px;"
      >

        <!--[if mso]>
        <table role="presentation" width="520" cellspacing="0" cellpadding="0" border="0">
        <tr><td>
        <![endif]-->

        <table
          role="presentation"
          class="skillcima-shell"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="width:100%;max-width:${skillcimaEmailTheme.maxWidth}px;table-layout:fixed;"
        >
          <tr>
            <td
              class="skillcima-header"
              style="padding:6px 8px 22px;font-family:${fonts.body};"
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <div style="font-family:${fonts.heading};font-size:24px;font-weight:800;line-height:1;color:${colors.text};">
                      Skill<span style="color:${colors.accent};">cima</span>
                    </div>
                  </td>

                  <td
                    class="skillcima-course-label"
                    align="right"
                    style="font-size:11px;font-weight:700;line-height:1.3;letter-spacing:0.6px;text-transform:uppercase;color:${colors.muted};vertical-align:middle;"
                  >
                    Forex Foundations
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 8px 18px;">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  ${progressSegments}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td
              style="background:${colors.surface};border:1px solid ${colors.border};border-radius:16px;overflow:hidden;"
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td
                    class="skillcima-card-pad"
                    style="padding:30px 34px 14px;font-family:${fonts.body};"
                  >
                    <span style="display:inline-block;padding:7px 12px;border-radius:999px;background:${colors.primary};font-size:11px;font-weight:800;line-height:1;letter-spacing:0.5px;text-transform:uppercase;color:${colors.text};">
                      ${progressLabel}
                    </span>

                    <div style="margin-top:18px;font-size:11px;font-weight:800;line-height:1.4;letter-spacing:1.1px;text-transform:uppercase;color:${colors.accent};">
                      ${eyebrow}
                    </div>

                    <h1
                      class="skillcima-title"
                      style="margin:8px 0 0;font-family:${fonts.heading};font-size:30px;font-weight:800;line-height:1.16;color:${colors.text};"
                    >
                      ${heading}
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td
                    class="skillcima-card-pad"
                    style="padding:14px 34px 32px;font-family:${fonts.body};font-size:15px;line-height:1.65;color:${colors.text};"
                  >
                    ${input.trustedContentHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:20px 22px 4px;font-family:${fonts.body};font-size:11px;line-height:1.6;color:${colors.muted};"
            >
              ${footerText}
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="padding:0 22px;font-family:${fonts.body};font-size:10px;line-height:1.5;color:${colors.muted};"
            >
              Risk-conscious education. No profit promises.
            </td>
          </tr>
        </table>

        <!--[if mso]>
        </td></tr></table>
        <![endif]-->

      </td>
    </tr>
  </table>
</body>
</html>`;
}
