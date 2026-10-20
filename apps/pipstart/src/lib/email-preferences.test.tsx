import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmailPreferenceFields } from "../components/email-preference-fields";
import { EMAIL_PREFERENCE_MODEL, readEmailPreferenceForm, readStoredEmailPreferences } from "./email-preferences";

function form(learning = true, partner = true, frequency = "all") {
  const data = new FormData();
  data.set("emailPreferenceModel", EMAIL_PREFERENCE_MODEL);
  data.set("learningFrequency", frequency);
  if (learning) data.set("educationalEmails", "on");
  if (partner) data.set("marketingEmails", "on");
  return data;
}
const read = (relative: string) => readFileSync(resolve(process.cwd(), relative), "utf8");

describe("M21 owner-selected optional-email preference model", () => {
  it.each([[true,true],[true,false],[false,true],[false,false]])(
    "preserves the submitted learning=%s partner=%s values", (learning, partner) => {
      expect(readEmailPreferenceForm(form(learning, partner))).toEqual({ ok: true, value: {
        educationalEmails: learning, marketingEmails: partner, learningFrequency: "all",
      } });
    },
  );
  it.each(["all","weekly"])("accepts the supported frequency %s", (frequency) => {
    const result = readEmailPreferenceForm(form(false, false, frequency));
    expect(result).toEqual({ ok: true, value: {
      educationalEmails: false, marketingEmails: false, learningFrequency: frequency,
    } });
  });
  it("defaults both optional categories ON for older signup submissions only", () => {
    const old = new FormData();
    expect(readEmailPreferenceForm(old, true)).toEqual({ ok: true, value: {
      educationalEmails: true, marketingEmails: true, learningFrequency: "all",
    } });
    expect(readEmailPreferenceForm(old).ok).toBe(false);
  });
  it("honours both unchecked registration controls", () => {
    expect(readEmailPreferenceForm(form(false, false), true)).toEqual({ ok: true, value: {
      educationalEmails: false, marketingEmails: false, learningFrequency: "all",
    } });
  });
  it("does not accept a signup frequency the registration workflow cannot persist", () => {
    expect(readEmailPreferenceForm(form(true, true, "weekly"), true).ok).toBe(false);
  });
  it.each(["", "unknown", "consent-v1"])("rejects an unrecognised model %#", (model) => {
    const data = form(); data.set("emailPreferenceModel", model);
    expect(readEmailPreferenceForm(data).ok).toBe(false);
  });
  it.each(["emailPreferenceModel","learningFrequency","educationalEmails","marketingEmails"])(
    "rejects duplicated %s fields", (field) => {
      const data = form(); data.append(field, data.get(field)!);
      expect(readEmailPreferenceForm(data).ok).toBe(false);
    },
  );
  it.each(["educationalEmails","marketingEmails"])("rejects invalid checkbox values for %s", (field) => {
    const data = form(); data.set(field, "true");
    expect(readEmailPreferenceForm(data).ok).toBe(false);
  });
  it.each(["instant","daily","","WEEKLY"])("rejects unsupported frequency %#", (frequency) => {
    expect(readEmailPreferenceForm(form(true, true, frequency)).ok).toBe(false);
  });
  it("rejects a missing frequency instead of inventing a saved preference", () => {
    const data = form(); data.delete("learningFrequency");
    expect(readEmailPreferenceForm(data).ok).toBe(false);
  });
  it.each([null,undefined,{},false,{ educational_emails: true },
    { educational_emails: "true", marketing_emails: false, learning_frequency: "all" },
    { educational_emails: true, marketing_emails: null, learning_frequency: "all" },
    { educational_emails: true, marketing_emails: false, learning_frequency: "daily" },
  ])("does not turn missing or invalid stored data into ON defaults %#", (value) => {
    expect(readStoredEmailPreferences(value)).toBeNull();
  });
  it.each([[true,true],[true,false],[false,true],[false,false]])(
    "reads stored learning=%s partner=%s without changing it", (learning, partner) => {
      expect(readStoredEmailPreferences({ educational_emails: learning,
        marketing_emails: partner, learning_frequency: "weekly" })).toEqual({
        educationalEmails: learning, marketingEmails: partner, learningFrequency: "weekly",
      });
    },
  );
  it.each([[true,true],[false,false],[true,false],[false,true]])(
    "renders learning=%s partner=%s with real native checkbox state", (learning, partner) => {
      const html = renderToStaticMarkup(<EmailPreferenceFields educational={learning} marketing={partner} />);
      const input = (name: string) => html.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0] ?? "";
      expect(input("educationalEmails").includes('checked=""')).toBe(learning);
      expect(input("marketingEmails").includes('checked=""')).toBe(partner);
      expect(html).toContain("Partner offers from PipStart");
      expect(html).toContain("not directly by partners");
      expect(html).toContain(`value="${EMAIL_PREFERENCE_MODEL}"`);
      expect(html).not.toContain("I consent");
    },
  );
  it("renders weekly frequency without re-enabling either category", () => {
    const html = renderToStaticMarkup(<EmailPreferenceFields educational={false} marketing={false} frequency="weekly" showFrequency />);
    expect(html).toContain('aria-label="Learning email frequency"');
    expect(html).toMatch(/<input[^>]*value="weekly"[^>]*checked=""|<input[^>]*checked=""[^>]*value="weekly"/);
    expect(html).toContain("does not turn learning emails back on");
    expect((html.match(/checked=""/g) ?? []).length).toBe(1);
  });
  it("keeps signup choices in client state and separate from mandatory terms", () => {
    const forms = read("src/components/account-forms.tsx");
    expect(forms).toContain("const [educationalEmails, setEducationalEmails] = useState(true)");
    expect(forms).toContain("const [marketingEmails, setMarketingEmails] = useState(true)");
    expect(forms).toContain("onEducationalChange={setEducationalEmails}");
    expect(forms).toContain("onMarketingChange={setMarketingEmails}");
    expect(forms).toContain("checked={termsAccepted}");
    expect(forms).toContain("Optional emails will include an unsubscribe option.");
  });
  it("does not invent preference settings if the account read fails", () => {
    const page = read("src/app/account/email-preferences/page.tsx");
    expect(page).toContain("readStoredEmailPreferences(result.data)");
    expect(page).toContain('role="alert"');
    expect(page).not.toContain("?? true");
    expect(page).not.toContain("?? false");
    expect(page).toContain("No settings have been changed.");
    const dashboard = read("src/lib/dashboard-server.ts");
    expect(dashboard).toContain("!preferenceResult.data");
    expect(dashboard).not.toContain("preferenceResult.data?.educational_emails ?? true");
  });
  it("saves only validated fields against the authenticated user's row", () => {
    const actions = read("src/app/account/actions.ts");
    const update = actions.slice(actions.indexOf("export async function updateEmailPreferencesAction"),actions.indexOf("export async function changePasswordAction"));
    expect(update).toContain('requireUser("/account/email-preferences")');
    expect(update).toContain("readEmailPreferenceForm(formData)");
    expect(update).toContain("learning_frequency: preferences.value.learningFrequency");
    expect(update).toContain('.eq("user_id", user.id)');
    expect(update).toContain('revalidatePath("/dashboard")');
    expect(update).not.toContain("createSupabaseAdminClient");
    expect(actions).toContain("pipstart_learning_emails: emailPreferences.value.educationalEmails");
    expect(actions).toContain("pipstart_partner_emails: emailPreferences.value.marketingEmails");
  });
});
