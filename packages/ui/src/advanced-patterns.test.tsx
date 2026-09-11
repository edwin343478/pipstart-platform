import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "./accordion";
import { EmailCapture } from "./email-capture";
import { Modal } from "./modal";
import { Tab, Tabs } from "./tabs";
describe("advanced accessible UI patterns", () => {
  it("uses native disclosure semantics", () => {
    const markup = renderToStaticMarkup(
      <Accordion summary="Risk">Details</Accordion>,
    );
    expect(markup).toContain("<details");
    expect(markup).toContain("<summary");
  });
  it("connects tabs to panels", () => {
    const markup = renderToStaticMarkup(
      <Tabs aria-label="Markets">
        <Tab controls="forex-panel" selected>
          Forex
        </Tab>
      </Tabs>,
    );
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-controls="forex-panel"');
    expect(markup).toContain('aria-selected="true"');
  });
  it("labels modal dialogs", () => {
    const markup = renderToStaticMarkup(
      <Modal open={false} title="Notice" onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(markup).toContain("<dialog");
    expect(markup).toContain('aria-label="Notice"');
    expect(markup).toContain("Close");
  });
  it("connects email labels and descriptions", () => {
    const markup = renderToStaticMarkup(
      <EmailCapture
        inputId="course-email"
        description="Free lessons by email."
      />,
    );
    expect(markup).toContain('for="course-email"');
    expect(markup).toContain('type="email"');
    expect(markup).toContain('aria-describedby="course-email-description"');
  });
});
