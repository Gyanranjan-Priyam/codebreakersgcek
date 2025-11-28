import { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Users, TrendingUp, Activity } from "lucide-react";
import { getMembersReportData } from "./actions";
import MembersReportTable from "./_components/members-report-table";

export const metadata: Metadata = {
  title: "Reports | Admin Panel",
  description: "Generate and view platform reports.",
};

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function MemberCount() {
  const result = await getMembersReportData();
  
  if (result.status === "error") {
    return <div className="text-2xl font-bold">Error</div>;
  }
  
  return (
    <>
      <div className="text-2xl font-bold">{result.data.length}</div>
      <p className="text-xs text-muted-foreground">Active members</p>
    </>
  );
}

async function MembersReportSection() {
  const result = await getMembersReportData();

  if (result.status === "error") {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{result.message}</p>
        </CardContent>
      </Card>
    );
  }

  return <MembersReportTable members={result.data} />;
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl space-y-6">
      <PageHeader
        title="Reports"
        showBackButton={false}
        description="Generate and export comprehensive platform reports"
      />
      {/* Members Report Table */}
      <Suspense fallback={<TableSkeleton />}>
        <MembersReportSection />
      </Suspense>
    </div>
  );
}
