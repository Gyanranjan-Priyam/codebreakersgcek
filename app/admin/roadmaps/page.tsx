import { Metadata } from "next";
import { getAdminRoadmaps } from "./actions";
import { AdminRoadmapsClient } from "./_components/admin-roadmaps-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Roadmaps Management | Admin Panel",
  description: "Create, edit, and publish interactive visual learning roadmaps with zero redeployments.",
};

export const dynamic = "force-dynamic";

export default async function AdminRoadmapsPage() {
  const result = await getAdminRoadmaps();
  const roadmaps = result.status === "success" ? result.data : [];

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-2 py-3 sm:py-6 max-w-8xl space-y-6">
      <PageHeader
        title="Visual Roadmaps"
        description="Create and customize interactive node roadmaps. Changes take effect immediately without redeploying."
        showBackButton={false}
      />

      <AdminRoadmapsClient initialRoadmaps={roadmaps} />
    </div>
  );
}
