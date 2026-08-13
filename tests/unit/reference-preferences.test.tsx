import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PreferencePage } from "@/components/traveler/preference-page";
describe("reference traveler preference pages", () => {
  it("does not imply registered-account controls", () => {
    render(<PreferencePage kind="privacy" />);
    expect(screen.getByText("No registered account or password")).toBeVisible();
    expect(screen.queryByText(/2FA/)).not.toBeInTheDocument();
  });
  it("labels unsupported notification persistence honestly", () => {
    render(<PreferencePage kind="notifications" />);
    expect(screen.getByText(/No notification persistence/)).toBeVisible();
    expect(screen.getAllByText("MVP").length).toBeGreaterThan(0);
  });
});
