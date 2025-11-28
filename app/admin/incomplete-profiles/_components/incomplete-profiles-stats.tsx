"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertCircle } from "lucide-react";

interface IncompleteProfilesStatsProps {
  stats: {
    totalIncomplete: number;
    recentIncomplete: number;
    oldIncomplete: number;
  };
}

export default function IncompleteProfilesStats({ stats }: IncompleteProfilesStatsProps) {
  const statsData = [
    {
      title: "Total Incomplete",
      value: stats.totalIncomplete,
      icon: Users,
      description: "Total incomplete profiles",
    },
    {
      title: "Recent (Last 7 Days)",
      value: stats.recentIncomplete,
      icon: Clock,
      description: "Incomplete in last week",
    },
    {
      title: "Old (30+ Days)",
      value: stats.oldIncomplete,
      icon: AlertCircle,
      description: "Incomplete for over a month",
      highlighted: stats.oldIncomplete > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={stat.highlighted ? "border-yellow-500" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.highlighted ? "text-yellow-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
