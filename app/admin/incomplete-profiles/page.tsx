import { Suspense } from "react";
import { getAllIncompleteProfiles, getIncompleteProfilesStats } from "./actions";
import IncompleteProfilesTable from "./_components/incomplete-profiles-table";
import IncompleteProfilesStats from "./_components/incomplete-profiles-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Incomplete Profiles",
  description: "Manage incomplete user profiles",
};

export default async function IncompleteProfilesPage() {
  const [profilesResult, statsResult] = await Promise.all([
    getAllIncompleteProfiles(),
    getIncompleteProfilesStats(),
  ]);

  if (profilesResult.status === "error" || statsResult.status === "error") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>
              {profilesResult.status === "error" ? profilesResult.message : statsResult.message}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Incomplete Profiles
        </h1>
        <p className="text-muted-foreground mt-2">
          Users who have not completed their registration process
        </p>
      </div>

      <Suspense fallback={<StatsLoading />}>
        <IncompleteProfilesStats stats={statsResult.data} />
      </Suspense>

      <Suspense fallback={<TableLoading />}>
        <IncompleteProfilesTable profiles={profilesResult.data} />
      </Suspense>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
