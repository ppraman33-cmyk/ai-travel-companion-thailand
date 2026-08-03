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
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("loads and displays existing trips from the session-owned store", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (init?.signal?.aborted) return new Promise(() => {});
        if (url.includes("/days") || url.includes("/items"))
          return tripsResponse([]);
        return tripsResponse([
          { id: "trip-1", title: "Chiang Mai weekend", status: "active" },
        ]);
      },
    );

    render(<TripsClient />);

    expect(
      (await screen.findAllByText("Chiang Mai weekend")).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows an empty state when no trips have been created", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.signal?.aborted) return new Promise(() => {});
        return tripsResponse([]);
      },
    );

    render(<TripsClient />);

    expect(
      (await screen.findAllByText("No trips yet")).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows an error state when the trips endpoint is unavailable", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.signal?.aborted) return new Promise(() => {});
        return Promise.resolve({ ok: false, json: () => Promise.resolve({}) } as Response);
      },
    );

    render(<TripsClient />);

    expect(
      (await screen.findAllByText("Trips are unavailable")).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("selects a trip and shows the Add day button", async () => {
    const user = userEvent.setup();
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (init?.signal?.aborted) return new Promise(() => {});
        if (url.includes("/days") || url.includes("/items"))
          return tripsResponse([]);
        return tripsResponse([
          { id: "trip-2", title: "Bangkok day tour", status: "draft" },
        ]);
      },
    );

    render(<TripsClient />);

    const tripButtons = await screen.findAllByText("Bangkok day tour");
    await user.click(tripButtons[0]);

    expect(screen.getAllByRole("button", { name: "Add day" }).length).toBeGreaterThanOrEqual(1);
  });

  it("deletes a trip and removes it from the list", async () => {
    const user = userEvent.setup();
    let trips = [{ id: "trip-3", title: "Island hop", status: "active" }];
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";
        if (init?.signal?.aborted) return new Promise(() => {});
        if (method === "DELETE" && url.includes("trip-3")) {
          trips = [];
          return Promise.resolve({ ok: true } as Response);
        }
        if (url.includes("/days") || url.includes("/items"))
          return tripsResponse([]);
        return tripsResponse(trips);
      },
    );

    render(<TripsClient />);

    await screen.findAllByText("Island hop");
    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete trip Island hop",
    });
    await user.click(deleteButtons[0]);

    expect(
      (await screen.findAllByText(/was deleted/)).length,
    ).toBeGreaterThanOrEqual(1);
  });
});
