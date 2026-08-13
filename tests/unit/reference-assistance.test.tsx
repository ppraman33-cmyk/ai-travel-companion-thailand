import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AssistantPage from "@/app/assistant/page";
import { HelpArticle } from "@/components/traveler/help-article";
vi.mock("next/navigation", () => ({ usePathname: () => "/assistant" }));
describe("reference assistance surfaces", () => {
  it("keeps AI input disabled and promises no provider request", () => {
    render(<AssistantPage />);
    expect(screen.getByLabelText("Ask the assistant")).toBeDisabled();
    expect(screen.getByText(/No provider is active/)).toBeVisible();
    expect(screen.queryByText(/recent chat/i)).not.toBeInTheDocument();
  });
  it("documents only supported safe workflows", () => {
    render(<HelpArticle slug="safe-traveler-features" />);
    expect(screen.getByText(/Secure anonymous-session ownership/)).toBeVisible();
    expect(screen.getByText(/Only trusted Google Maps or Apple Maps/)).toBeVisible();
  });
});
