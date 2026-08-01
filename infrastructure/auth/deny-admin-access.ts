import type { AdminAccessBoundary } from "@/application/admin/admin-access";
import { success } from "@/shared/result/result";

export class DenyAdminAccess implements AdminAccessBoundary {
  async resolveCurrentAdmin() {
    return success(null);
  }
}
