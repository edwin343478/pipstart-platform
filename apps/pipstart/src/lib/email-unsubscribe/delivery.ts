import "server-only";
import { createSupabaseAdminClient } from "../supabase/admin";
import {
  hashUnsubscribeToken,
  newUnsubscribeToken,
  scopeLabel,
  type UnsubscribeScope,
} from "./core";

export interface TokenIssuer {
  issue(
    userId: string,
    scope: UnsubscribeScope,
    hash: string,
  ): Promise<boolean>;
}
export function createUnsubscribeTokenIssuer(): TokenIssuer | null {
  const client = createSupabaseAdminClient();
  if (!client) return null;
  return {
    async issue(userId, scope, hash) {
      const { data, error } = await client.rpc(
        "pipstart_issue_email_unsubscribe_token",
        { p_user_id: userId, p_scope: scope, p_token_hash: hash },
      );
      if (error || typeof data !== "boolean")
        throw new Error("Optional email preparation unavailable");
      return data;
    },
  };
}
// No transport/send call exists here. Future optional senders must use this
// envelope and independently recheck suppression immediately before dispatch.
export async function prepareOptionalEmail(
  input: {
    userId: string;
    category: "learning" | "partner";
    html: string;
    text: string;
  },
  issuer: TokenIssuer,
) {
  if (
    input.userId.length !== 36 ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      input.userId,
    ) ||
    !["learning", "partner"].includes(input.category) ||
    !input.html.trim() ||
    !input.text.trim()
  )
    throw new Error("Invalid optional email envelope");
  const categoryToken = newUnsubscribeToken();
  const allToken = newUnsubscribeToken();
  if (
    !(await issuer.issue(
      input.userId,
      input.category,
      hashUnsubscribeToken(categoryToken)!,
    )) ||
    !(await issuer.issue(input.userId, "all", hashUnsubscribeToken(allToken)!))
  )
    throw new Error("Optional email preference is OFF or unavailable");
  const categoryUrl = `https://pipstart.net/unsubscribe?token=${categoryToken}`;
  const allUrl = `https://pipstart.net/unsubscribe?token=${allToken}`;
  const label = scopeLabel(input.category);
  const footer = `<hr><p><a href="${categoryUrl}">Unsubscribe from ${label}</a> · <a href="${allUrl}">Unsubscribe from all optional emails</a></p>`;
  const html = /<\/body\s*>/i.test(input.html)
    ? input.html.replace(/<\/body\s*>/i, (closing) => footer + closing)
    : /<\/html\s*>/i.test(input.html)
      ? input.html.replace(/<\/html\s*>/i, (closing) => footer + closing)
      : input.html + footer;
  return {
    html,
    text: `${input.text}\n\nUnsubscribe from ${label}: ${categoryUrl}\nUnsubscribe from all optional emails: ${allUrl}`,
    headers: {
      "List-Unsubscribe": `<${categoryUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
