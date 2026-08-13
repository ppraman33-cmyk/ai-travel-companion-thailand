import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DiscoveryDirectory } from "@/components/traveler/discovery-directory";
import { SyntheticCatalogPage } from "@/components/traveler/synthetic-catalog-page";
describe("reference discovery hierarchy", () => {
  it("presents six regions without turning reference totals into facts", () => {
    render(<DiscoveryDirectory kind="regions" />);
    expect(screen.getAllByText(/Verified totals unavailable/)).toHaveLength(6);
    expect(screen.getByRole("heading", { name: "Explore by region" })).toBeVisible();
  });
  it("keeps the province directory synthetic and the verified 77-province contract suppressed", () => {
    render(<DiscoveryDirectory kind="provinces" />);
    expect(screen.getByText(/77-province contract/)).toBeVisible();
    expect(screen.getAllByText(/synthetic/i).length).toBeGreaterThan(1);
  });
  it("uses one catalog template for food and events", () => {
    const { rerender } = render(
      <SyntheticCatalogPage
        categories={["events"]}
        title="Festivals and events"
        description="Demo"
      />,
    );
    expect(screen.getByRole("link", { name: "Moon Market" })).toHaveAttribute(
      "href",
      "/thailand/northern/demo-lanna-province/events/moon-market",
    );
    rerender(
      <SyntheticCatalogPage
        categories={["restaurants", "foods"]}
        title="Food and restaurants"
        description="Demo"
      />,
    );
    expect(screen.getByRole("link", { name: "River Leaf Kitchen" })).toBeVisible();
  });
});
