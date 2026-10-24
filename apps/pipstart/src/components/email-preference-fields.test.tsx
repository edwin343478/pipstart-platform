import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmailPreferenceFields } from "./email-preference-fields";

const render = (educational = false, marketing = false) =>
  renderToStaticMarkup(
    <EmailPreferenceFields
      educational={educational}
      marketing={marketing}
      frequency="weekly"
      showFrequency
    />,
  );
const inputs = (html: string) => html.match(/<input\b[^>]*>/g) ?? [];
const attribute = (tag: string, name: string) =>
  tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const textFor = (html: string, id: string | undefined) => {
  expect(id).toBeTruthy();
  const escaped = id!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.match(new RegExp(`<[^>]+id="${escaped}"[^>]*>([^<]*)<`))?.[1];
};

describe("M21 C04 native preference accessibility", () => {
  it("gives each category a concise name and a separate helper description", () => {
    const html = render();
    const learning = inputs(html).find((tag) =>
      tag.includes('name="educationalEmails"'),
    )!;
    const partner = inputs(html).find((tag) =>
      tag.includes('name="marketingEmails"'),
    )!;
    expect(textFor(html, attribute(learning, "aria-labelledby"))).toBe(
      "Learning emails",
    );
    expect(textFor(html, attribute(partner, "aria-labelledby"))).toBe(
      "Partner offers from PipStart",
    );
    expect(textFor(html, attribute(learning, "aria-describedby"))).toContain(
      "Course guidance",
    );
    expect(textFor(html, attribute(partner, "aria-describedby"))).toContain(
      "not directly by partners",
    );
  });

  it("describes the named native radio group and both radios with the OFF explanation", () => {
    const html = render();
    const group = html.match(/<div[^>]*role="radiogroup"[^>]*>/)?.[0] ?? "";
    expect(group).toContain('aria-label="Learning email frequency"');
    const description = attribute(group, "aria-describedby");
    expect(textFor(html, description)).toContain(
      "does not turn learning emails back on",
    );
    const radios = inputs(html).filter((tag) => tag.includes('type="radio"'));
    expect(radios).toHaveLength(2);
    for (const radio of radios) {
      expect(attribute(radio, "aria-describedby")).toBe(description);
      expect(attribute(radio, "name")).toBe("learningFrequency");
    }
  });

  it("keeps IDs unique and references local when two instances share a document", () => {
    const html = renderToStaticMarkup(
      <>
        <EmailPreferenceFields educational marketing showFrequency />
        <EmailPreferenceFields
          educational={false}
          marketing={false}
          showFrequency
        />
      </>,
    );
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(ids.length);
    for (const match of html.matchAll(
      /aria-(?:labelledby|describedby)="([^"]+)"/g,
    )) {
      expect(ids.filter((id) => id === match[1])).toHaveLength(1);
    }
  });

  it.each([
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ])(
    "retains native saved choices learning=%s partner=%s and independent Weekly",
    (learning, partner) => {
      const tags = inputs(render(learning, partner));
      expect(
        tags
          .find((tag) => tag.includes('name="educationalEmails"'))
          ?.includes('checked=""'),
      ).toBe(learning);
      expect(
        tags
          .find((tag) => tag.includes('name="marketingEmails"'))
          ?.includes('checked=""'),
      ).toBe(partner);
      expect(tags.find((tag) => tag.includes('value="weekly"'))).toContain(
        'checked=""',
      );
      expect(tags.find((tag) => tag.includes('value="all"'))).not.toContain(
        'checked=""',
      );
    },
  );

  it("keeps signup frequency hidden and default-ON values supplied by the parent", () => {
    const html = renderToStaticMarkup(
      <EmailPreferenceFields educational marketing />,
    );
    expect(
      inputs(html).filter(
        (tag) => tag.includes('type="checkbox"') && tag.includes('checked=""'),
      ),
    ).toHaveLength(2);
    expect(
      inputs(html).find((tag) => tag.includes('name="learningFrequency"')),
    ).toContain('type="hidden"');
    expect(html).not.toContain('role="radiogroup"');
    expect(html).not.toContain("tabindex");
    expect(html).not.toContain('role="switch"');
  });

  it("scopes a visible keyboard outline and keeps radios out of text-input styling", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/components/account-forms.module.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.preference input:focus-visible,\s*\.frequency input:focus-visible\s*\{[^}]*outline: 2px solid var\(--brand-accent\);[^}]*outline-offset: 3px;/,
    );
    expect(render()).not.toMatch(/class="[^"]*\bfield\b[^>]*role="radiogroup"/);
    expect(css).not.toContain(".frequency input {");
  });

  it("retains live action feedback and pending submit disable without moving focus", () => {
    const forms = readFileSync(
      resolve(process.cwd(), "src/components/account-forms.tsx"),
      "utf8",
    );
    expect(forms).toContain(
      'role={state.status === "error" ? "alert" : "status"}',
    );
    expect(forms).toContain("disabled={pending}");
    expect(forms).toContain('pending ? "Working…"');
    const fields = readFileSync(
      resolve(process.cwd(), "src/components/email-preference-fields.tsx"),
      "utf8",
    );
    expect(fields).not.toContain("onKeyDown");
    expect(fields).not.toContain("tabIndex");
    expect(fields).not.toContain("autoFocus");
  });
});
