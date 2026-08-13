import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Fact,
  FactsGrid,
  HorizontalRail,
  MascotSlot,
  PageHeader,
  SectionHeader,
} from "@/components/ui/design-system";

describe("reference UI design system", () => {
  it("exposes reusable semantic page and section landmarks", () => {
    render(
      <>
        <PageHeader eyebrow="Synthetic preview" title="Thailand" />
        <section>
          <SectionHeader href="/explore" title="Recommended" />
          <HorizontalRail label="Recommended journeys">
            <article role="listitem">Demo journey</article>
          </HorizontalRail>
        </section>
      </>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Thailand" })).toBeVisible();
    expect(screen.getByRole("link", { name: /See all/ })).toHaveAttribute(
      "href",
      "/explore",
    );
    expect(screen.getByRole("list", { name: "Recommended journeys" })).toBeVisible();
  });

  it("labels facts and preserves the unlicensed mascot as a placement slot", () => {
    render(
      <>
        <FactsGrid>
          <Fact label="Evidence" value="Synthetic demo" />
        </FactsGrid>
        <MascotSlot label="Official mascot placement slot" />
      </>,
    );
    expect(screen.getByText("Evidence")).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Official mascot placement slot" }),
    ).toBeVisible();
  });
});
