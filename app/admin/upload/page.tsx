import type { Metadata } from "next";
import RoleGate from "@/components/access/RoleGate";
import PageHeader from "@/components/shared/PageHeader";
import UploadView from "@/components/upload/UploadView";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Upload sheet" };

export default function UploadPage() {
  return (
    <RoleGate requiredRole="admin">
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <PageHeader
          title="Upload a sheet"
          description="Choose an .xlsx file, check the preview, and import it."
          backHref={ROUTES.admin}
          backLabel="All sheets"
        />
        <UploadView />
      </main>
    </RoleGate>
  );
}