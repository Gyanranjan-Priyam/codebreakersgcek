import { getBatches } from "./actions";
import { BatchesClient } from "./_components/batches-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Batches | Admin Panel",
  description: "Manage student cohorts and batches, assign members, and target activities.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminBatchesPage() {
  const result = await getBatches();
  const batches = result.data || [];
  const stats = result.stats;

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-2 py-3 sm:py-6 max-w-8xl">
      <PageHeader
        title="Batches"
        description="Organize students into batches. Assign tasks, attendance sessions, quizzes, and leaderboards to specific batches."
        showBackButton={false}
      />

      <div className="mt-6 sm:mt-8">
        <BatchesClient initialBatches={batches} stats={stats} />
      </div>
    </div>
  );
}
