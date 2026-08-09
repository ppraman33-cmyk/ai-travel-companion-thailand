import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingFlow } from "@/components/traveler/onboarding-flow";
import { TravelerLocaleProvider } from "@/components/traveler/locale-provider";

async function reachProfileStep(user: ReturnType<typeof userEvent.setup>) {
  for (const choice of [
    "Public transit",
    "Budget",
    "Solo traveler",
    "Low — relaxed pace",
  ]) {
    await user.click(screen.getByRole("button", { name: choice }));
    await user.click(screen.getByRole("button", { name: "Next" }));
  }
}

describe("multi-profile onboarding", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
  });
  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  it("starts with accessible transportation choices and progress", () => {
    render(<OnboardingFlow onComplete={() => undefined} />);
    expect(screen.getByText("Step 1 of 5")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByRole("button", { name: "Public transit" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("Skip All is local-only and performs no network request", async () => {
    const complete = vi.fn();
    render(<OnboardingFlow onComplete={complete} />);
    await userEvent.click(screen.getByRole("button", { name: "Skip all" }));
    expect(complete).toHaveBeenCalledOnce();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shares Thai onboarding and preference labels without changing stored values", async () => {
    window.localStorage.setItem("atct-locale", "th");
    render(
      <TravelerLocaleProvider>
        <OnboardingFlow onComplete={() => undefined} />
      </TravelerLocaleProvider>,
    );
    expect(
      await screen.findByRole("heading", { name: "คุณจะเดินทางอย่างไร" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "ขนส่งสาธารณะ" })).toBeVisible();
    window.localStorage.removeItem("atct-locale");
  });

  it("persists a named active profile before completing", async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    render(<OnboardingFlow onComplete={complete} />);
    await reachProfileStep(user);
    await user.type(
      screen.getByRole("textbox", { name: /Profile name/ }),
      "Solo Thailand",
    );
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(
      "/api/v1/profiles",
      expect.objectContaining({ body: expect.stringContaining('"active":true') }),
    );
  });

  it("preserves input for retry when profile persistence fails", async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);
    render(<OnboardingFlow onComplete={complete} />);
    await reachProfileStep(user);
    const input = screen.getByRole("textbox", { name: /Profile name/ });
    await user.type(input, "Family holiday");
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("selections are safe");
    expect(input).toHaveValue("Family holiday");
    expect(complete).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
  });

  it("blocks rapid duplicate final submissions", async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    let resolveProfile: (value: Response) => void = () => undefined;
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveProfile = resolve;
          }),
      );
    render(<OnboardingFlow onComplete={complete} />);
    await reachProfileStep(user);
    await user.type(screen.getByRole("textbox", { name: /Profile name/ }), "Road trip");
    const save = screen.getByRole("button", { name: "Save profile" });
    fireEvent.click(save);
    fireEvent.click(save);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    resolveProfile({ ok: true } as Response);
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
