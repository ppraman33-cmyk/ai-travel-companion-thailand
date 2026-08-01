import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { DenyAdminAccess } from "@/infrastructure/auth/deny-admin-access";

describe("Admin security and operations UI", () => {
  it("denies Admin access when authentication is not configured", async () => {
    const result = await new DenyAdminAccess().resolveCurrentAdmin();
    expect(result).toEqual({ ok: true, value: null });
  });

  it("uses non-green warning treatment for blocked publication", () => {
    render(
      <AdminDashboard
        eligibility={{
          eligible: false,
          reasons: ["EMERGENCY_PHONE_UNVERIFIED"],
          warnings: [],
          missingRequirements: [],
          staleRequirements: [],
          rightsIssues: [],
          emergencyCriticalFailures: ["Emergency phone is not verified"],
        }}
        summary={{
          draft: 1,
          evidencePending: 2,
          reviewPending: 3,
          stale: 4,
          suppressed: 5,
          emergencyVerification: 6,
          expiringLicenses: 7,
          openReports: 8,
        }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Publication blocked");
    expect(screen.getAllByText("Emergency verification")).toHaveLength(2);
  });
});
