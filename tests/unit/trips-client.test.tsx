import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TripsClient } from "@/components/traveler/trips-client";

const tripsResponse = (data: unknown) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data }),
  } as Response);

describe("TripsClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("loads and displays existing trips from the session-owned store", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      tripsResponse([
        { id: "trip-1", title: "Chiang Mai weekend", status: "active" },
      ]),
    );

    render(<TripsClient />);

    expect(await screen.findByText("Chiang Mai weekend")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows an empty state when no trips have been created", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      tripsResponse([]),
    );

    render(<TripsClient />);

    expect(await screen.findByText("No trips yet")).toBeInTheDocument();
  });

  it("shows an error state when the trips endpoint is unavailable", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);

    render(<TripsClient />);

    expect(await screen.findByText("Trips are unavailable")).toBeInTheDocument();
  });

  it("selects a trip and opens the add-item dialog", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      tripsResponse([
        { id: "trip-2", title: "Bangkok day tour", status: "draft" },
      ]),
    );

    render(<TripsClient />);

    const tripButton = await screen.findByText("Bangkok day tour");
    await user.click(tripButton);

    expect(screen.getAllByText("Bangkok day tour").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByRole("button", { name: "Add item" }),
    ).toBeInTheDocument();
  });

  it("deletes a trip and removes it from the list", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/v1/trips") && !url.includes("trip-3")) {
          return tripsResponse([
            { id: "trip-3", title: "Island hop", status: "active" },
          ]);
        }
        if (url.includes("trip-3")) {
          return Promise.resolve({ ok: true } as Response);
        }
        return tripsResponse([]);
      },
    );

    render(<TripsClient />);

    await screen.findByText("Island hop");
    await user.click(
      screen.getByRole("button", { name: "Delete trip Island hop" }),
    );

    expect(
      await screen.findByText(/was deleted/),
    ).toBeInTheDocument();
  });
});
