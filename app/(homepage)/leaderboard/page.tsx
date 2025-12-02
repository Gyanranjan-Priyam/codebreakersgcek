import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar } from "lucide-react";
import { getOverallLeaderboard, getMonthlyLeaderboard } from "./actions";
import OverallLeaderboard from "./_components/overall-leaderboard";
import MonthlyLeaderboard from "./_components/monthly-leaderboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "View top performers and your ranking based on points earned",
};

// Disable caching for this page to ensure leaderboard updates immediately
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const overallResult = await getOverallLeaderboard();
  const overallData = overallResult.status === "success" ? overallResult.data : [];

  const monthlyResult = await getMonthlyLeaderboard(currentYear, currentMonth);
  const monthlyData = monthlyResult.status === "success" ? monthlyResult.data : [];

  return (
    <div className="min-h-svh bg-black flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Track top performers based on points earned
        </p>
      </div>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overall" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Overall Leaderboard</span>
            <span className="sm:hidden">Overall</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Monthly Leaderboard</span>
            <span className="sm:hidden">Monthly</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Top Performers</CardTitle>
              <CardDescription>
                All-time leaderboard based on total points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OverallLeaderboard data={overallData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Top Performers</CardTitle>
              <CardDescription>
                Leaderboard for selected month based on points earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyLeaderboard 
                initialData={monthlyData}
                currentYear={currentYear}
                currentMonth={currentMonth}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}