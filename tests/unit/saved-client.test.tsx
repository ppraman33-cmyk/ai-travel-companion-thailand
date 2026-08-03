import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { demoItems } from "@/application/traveler/synthetic-content";
import { SavedClient } from "@/components/traveler/saved-client";

const json = (data: unknown) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data }),
  } as Response);

describe("SavedClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("shows a loading state, then a resolved demo place card with a detail link", async () => {
    const demoPlace = demoItems[0];
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      json([{ placeId: demoPlace.id }]),
    );

    render(<SavedClient />);

    expect(await screen.findByText(demoPlace.name)).toBeInTheDocument();
    expect(screen.getByText(demoPlace.thaiName)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: demoPlace.name }),
    ).toHaveAttribute(
      "href",
      `/thailand/northern/demo-lanna-province/${demoPlace.category}/${demoPlace.slug}`,
    );
  });

  it("shows an empty state when no places are saved", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(json([]));

    render(<SavedClient />);

    expect(await screen.findByText("No saved places yet")).toBeInTheDocument();
  });

  it("shows an error state when the saved-places endpoint is unavailable", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);

    render(<SavedClient />);

    expect(await screen.findByText("Saved places are unavailable")).toBeInTheDocument();
  });

  it("calls the DELETE endpoint when Remove is clicked", async () => {
    const user = userEvent.setup();
    const demoPlace = demoItems[0];
    const deleteSpy = vi.fn(() =>
      Promise.resolve({ ok: true } as Response),
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const method = init?.method ?? "GET";
        if (method === "DELETE") {
          return deleteSpy();
        }
        if (init?.signal?.aborted) {
          return new Promise(() => {});
        }
        return json([{ placeId: demoPlace.id }]);
      },
    );

    render(<SavedClient />);

    const card = await screen.findByText(demoPlace.name);
    const removeButton = within(
      card.closest("article")!,
    ).getByRole("button", { name: "Remove" });
    await user.click(removeButton);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("renders an emergency demo card with the danger badge", async () => {
    const emergencyItem = demoItems.find((item) => item.category === "emergency")!;
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      json([{ placeId: emergencyItem.id }]),
    );

    render(<SavedClient />);

    expect(await screen.findByText(emergencyItem.name)).toBeInTheDocument();
    const badges = screen.getAllByText("Synthetic demo");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
