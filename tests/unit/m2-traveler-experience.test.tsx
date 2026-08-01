import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  demoItems,
  demoProvince,
  findDemoItem,
} from "@/application/traveler/synthetic-content";
import {
  LanguageSwitch,
  TravelerLocaleProvider,
} from "@/components/traveler/locale-provider";
import { TravelerNavigation } from "@/components/traveler/traveler-navigation";
import { Dialog, StatusState } from "@/components/ui/design-system";

vi.mock("next/navigation", () => ({ usePathname: () => "/explore" }));

describe("M2 traveler experience", () => {
  beforeEach(() => {
    window.localStorage.clear();
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
  });

  it("uses one locale source for shared navigation and switches to Thai", async () => {
    const user = userEvent.setup();
    render(
      <TravelerLocaleProvider>
        <LanguageSwitch />
        <TravelerNavigation mobile />
      </TravelerLocaleProvider>,
    );
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await user.click(screen.getByRole("button", { name: "TH" }));
    expect(screen.getByRole("link", { name: "สำรวจ" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("th");
  });

  it("exposes accessible empty and error states without relying on color", () => {
    const { rerender } = render(
      <StatusState
        state="empty"
        title="No verified records"
        description="Evidence pending"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Evidence pending");
    rerender(
      <StatusState state="error" title="Unavailable" description="Try again safely" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Try again safely");
  });

  it("labels dialogs and responds to native cancel", () => {
    const close = vi.fn();
    render(
      <Dialog onClose={close} open title="Confirm external map">
        <button>Continue</button>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Confirm external map" });
    expect(dialog).toBeInTheDocument();
    fireEvent(dialog, new Event("cancel"));
    expect(close).toHaveBeenCalled();
  });

  it("keeps every M2 fixture synthetic and canonical-slug addressable", () => {
    expect(demoProvince.slug).toMatch(/^[a-z0-9-]+$/);
    expect(demoItems).toHaveLength(5);
    for (const item of demoItems)
      expect(findDemoItem(item.category, item.slug)).toBe(item);
    expect(demoItems.find((item) => item.category === "emergency")?.summary).toMatch(
      /Not a real emergency service/,
    );
  });
});
