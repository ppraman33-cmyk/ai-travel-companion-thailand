import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileClient } from "@/components/traveler/profile-client";

const json = (data: unknown) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data }),
  } as Response);

describe("ProfileClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("shows a loading state, then displays saved preference badges", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      json({
        transportation: "walking",
        travelStyle: "nature",
        companions: "solo",
      }),
    );

    render(<ProfileClient />);

    expect(
      (await screen.findAllByText("Walking / hiking")).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Nature & outdoors").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Solo traveler").length).toBeGreaterThanOrEqual(1);
  });

  it("shows an empty state when no preferences are set", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(json({}));

    render(<ProfileClient />);

    expect(
      (await screen.findAllByText(/No preferences set/)).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows an error state when preferences endpoint is unavailable", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);

    render(<ProfileClient />);

    expect(
      (await screen.findAllByText("Profile unavailable")).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("enters edit mode when Edit preferences is clicked", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      json({ transportation: "walking" }),
    );

    render(<ProfileClient />);

    await screen.findAllByText("Walking / hiking");
    const editButtons = screen.getAllByRole("button", { name: "Edit preferences" });
    await user.click(editButtons[0]);

    expect(screen.getAllByText("Save preferences").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Reset all").length).toBeGreaterThanOrEqual(1);
  });
});
