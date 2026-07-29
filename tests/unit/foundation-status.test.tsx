import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FoundationStatus } from "@/components/ui/foundation-status";

describe("FoundationStatus", () => {
  it("identifies the implementation-only scope", () => {
    render(<FoundationStatus />);

    expect(
      screen.getByRole("heading", { name: "Implementation foundation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No travel content or business features/i),
    ).toBeInTheDocument();
  });
});
