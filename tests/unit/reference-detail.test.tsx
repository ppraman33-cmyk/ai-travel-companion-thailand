import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoItems } from "@/application/traveler/synthetic-content";
import { DetailExperience } from "@/components/traveler/detail-experience";
vi.mock("@/components/traveler/locale-provider", () => ({
  useTravelerLocale: () => ({
    strings: {
      externalMaps: "External maps",
      reportInformation: "Report",
      leaveApp: "Leave app",
      closeDialog: "Close",
      mapExplanation: "Choose a trusted provider",
      reportTitle: "Report",
      reportQuestion: "Category",
      reportDetails: "Details",
      reportHint: "Explain",
      submitReport: "Submit",
    },
  }),
}));
afterEach(cleanup);
describe("reference entity detail", () => {
  it("suppresses unevidenced facts and synthetic reviews", () => {
    render(<DetailExperience item={demoItems[0]} />);
    expect(screen.getByText("Unavailable · evidence required")).toBeVisible();
    expect(screen.getByText("No verified reviews")).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: /External maps/ }).length,
    ).toBeGreaterThan(0);
  });
  it("keeps emergency contact and map actions disabled", () => {
    render(<DetailExperience item={demoItems[4]} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Not a real emergency service");
    for (const button of screen.getAllByRole("button", { name: /External maps/ }))
      expect(button).toBeDisabled();
  });
});
