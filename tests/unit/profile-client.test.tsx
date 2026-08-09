import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileClient } from "@/components/traveler/profile-client";

const response = (data: unknown, ok = true) =>
  Promise.resolve({ ok, json: () => Promise.resolve({ data }) } as Response);

const activeProfile = {
  id: "profile-a",
  name: "Solo Thailand",
  transportation: "walking",
  travelStyle: "nature",
  companions: "solo",
  activityLevel: "moderate",
  interests: [],
  active: true,
};

describe("ProfileClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
    global.fetch = vi.fn((input) =>
      String(input).endsWith("/profiles")
        ? response([activeProfile])
        : response([
            {
              id: "trip-a",
              title: "Northern loop",
              travelerProfileId: "profile-a",
              status: "draft",
            },
          ]),
    ) as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  it("shows the active profile, preference summary, and linked Trip count", async () => {
    render(<ProfileClient />);
    expect((await screen.findAllByText("Solo Thailand")).length).toBe(2);
    expect(screen.getByText("Walking / hiking")).toBeVisible();
    expect(screen.getByText("Nature & outdoors")).toBeVisible();
    expect(screen.getByText("1 linked Trips")).toBeVisible();
  });

  it("supports an empty no-personalization state", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(await response([]))
      .mockResolvedValueOnce(await response([]));
    render(<ProfileClient />);
    expect(await screen.findByText("No travel profiles")).toBeVisible();
    expect(screen.getByText("No personalization")).toBeVisible();
  });

  it("fails safely when the profile endpoint is unavailable", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(await response(undefined, false))
      .mockResolvedValueOnce(await response([]));
    render(<ProfileClient />);
    expect(await screen.findByText("Travel profiles unavailable")).toBeVisible();
  });

  it("opens the selected profile editor without exposing its UUID", async () => {
    const user = userEvent.setup();
    render(<ProfileClient />);
    await screen.findAllByText("Solo Thailand");
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("dialog", { name: "Edit travel profile" })).toBeVisible();
    expect(screen.getByLabelText("Profile name")).toHaveValue("Solo Thailand");
    expect(screen.queryByText("profile-a")).not.toBeInTheDocument();
  });
});
