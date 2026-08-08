import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OnboardingFlow } from "@/components/traveler/onboarding-flow";

describe("OnboardingFlow", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders the first step with progress indicator", () => {
    const { container } = render(<OnboardingFlow onComplete={() => {}} />);

    expect(container.textContent).toContain("Step 1 of 5");
    expect(container.textContent).toContain("Preferred transportation");
  });

  it("calls onComplete when Skip all is clicked", async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    const { container } = render(<OnboardingFlow onComplete={complete} />);

    const allButtons = container.querySelectorAll("button");
    const skipAll = Array.from(allButtons).find(
      (b) => b.textContent === "Skip all",
    ) as HTMLButtonElement;

    await user.click(skipAll);

    await waitFor(
      () => {
        expect(complete).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("advances to the next step when Skip is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingFlow onComplete={() => {}} />);

    const allButtons = container.querySelectorAll("button");
    const skip = Array.from(allButtons).find(
      (b) => b.textContent === "Skip" && !b.hasAttribute("disabled"),
    ) as HTMLButtonElement;

    await user.click(skip);

    await waitFor(() => {
      expect(container.textContent).toContain("Step 2 of 5");
    });
  });

  it("can navigate back to the previous step", async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingFlow onComplete={() => {}} />);

    const allButtons = container.querySelectorAll("button");
    const skip = Array.from(allButtons).find(
      (b) => b.textContent === "Skip" && !b.hasAttribute("disabled"),
    ) as HTMLButtonElement;
    await user.click(skip);

    await waitFor(() => {
      expect(container.textContent).toContain("Step 2 of 5");
    });

    const backButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent === "Back" && !b.hasAttribute("disabled"),
    );
    if (backButtons.length > 0) await user.click(backButtons[0]);

    await waitFor(() => {
      expect(container.textContent).toContain("Step 1 of 5");
    });
  });

  it("disables the Back button on the first step", () => {
    const { container } = render(<OnboardingFlow onComplete={() => {}} />);
    const backButtons = Array.from(container.querySelectorAll("button")).filter(
      (b) => b.textContent === "Back",
    );
    expect(backButtons.some((b) => b.hasAttribute("disabled"))).toBe(true);
  });

  it("does not complete when preference persistence fails and allows retry", async () => {
    const user = userEvent.setup();
    const complete = vi.fn();
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);
    const { container } = render(<OnboardingFlow onComplete={complete} />);

    for (let step = 0; step < 4; step += 1) {
      const skip = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent === "Skip" && !button.hasAttribute("disabled"),
      ) as HTMLButtonElement;
      await user.click(skip);
    }
    let finishSkip = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Skip" && !button.hasAttribute("disabled"),
    ) as HTMLButtonElement;
    await user.click(finishSkip);

    await waitFor(() => {
      expect(container.querySelector('[role="alert"]')).toHaveTextContent(
        "Your preferences could not be saved",
      );
    });
    expect(complete).not.toHaveBeenCalled();

    finishSkip = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Skip" && !button.hasAttribute("disabled"),
    ) as HTMLButtonElement;
    await user.click(finishSkip);
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1));
  });
});
