"use client";

import { useEffect, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Github, AlertCircle, CalendarDays } from "lucide-react";
import type { ThemeInput } from "react-activity-calendar";

interface GitHubContributionCalendarProps {
  username: string;
  className?: string;
  showCardWrapper?: boolean;
}

// Exact GitHub Dark Mode palette
const GITHUB_DARK_COLORS = [
  "#161b22", // 0 contributions (empty dark square)
  "#0e4429", // 1-3 contributions
  "#006d32", // 4-6 contributions
  "#26a641", // 7-9 contributions
  "#39d353", // 10+ contributions
];

// Exact GitHub Light Mode palette
const GITHUB_LIGHT_COLORS = [
  "#ebedf0", // 0 contributions (empty light square)
  "#9be9a8", // 1-3 contributions
  "#40c463", // 4-6 contributions
  "#30a14e", // 7-9 contributions
  "#216e39", // 10+ contributions
];

const GITHUB_DARK_THEME: ThemeInput = {
  dark: GITHUB_DARK_COLORS,
  light: GITHUB_DARK_COLORS,
};

const GITHUB_LIGHT_THEME: ThemeInput = {
  dark: GITHUB_LIGHT_COLORS,
  light: GITHUB_LIGHT_COLORS,
};

export default function GitHubContributionCalendar({
  username,
  className = "",
  showCardWrapper = true,
}: GitHubContributionCalendarProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("last");

  useEffect(() => {
    setMounted(true);
    setHasError(false);

    // Reactive theme detector listening to documentElement class changes
    const detectTheme = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    detectTheme();

    const observer = new MutationObserver(() => {
      detectTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [username]);

  const cleanUsername = username.trim().replace(/^@/, "");

  if (!cleanUsername) return null;

  // Generate list of available years for dropdown (current year down to 2020)
  const currentYear = new Date().getFullYear();
  const availableYears = [
    { label: "Last 12 Months", value: "last" },
    ...Array.from({ length: currentYear - 2019 }, (_, i) => {
      const yr = String(currentYear - i);
      return { label: yr, value: yr };
    }),
  ];

  const currentTheme = isDark ? GITHUB_DARK_THEME : GITHUB_LIGHT_THEME;
  const yearProp = selectedYear === "last" ? "last" : parseInt(selectedYear, 10);

  const content = (
    <div className="space-y-4">
      {/* Global CSS for scrollbar suppression and tooltip styling */}
      <style jsx global>{`
        .github-calendar-scroll-wrapper,
        .github-calendar-scroll-wrapper .react-activity-calendar,
        .github-calendar-scroll-wrapper .react-activity-calendar__container,
        .github-calendar-scroll-wrapper .react-activity-calendar__scroll-container,
        .github-calendar-scroll-wrapper * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .github-calendar-scroll-wrapper::-webkit-scrollbar,
        .github-calendar-scroll-wrapper .react-activity-calendar::-webkit-scrollbar,
        .github-calendar-scroll-wrapper .react-activity-calendar__scroll-container::-webkit-scrollbar,
        .github-calendar-scroll-wrapper *::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
          background: transparent !important;
        }
        .react-activity-calendar__tooltip {
          background-color: #1f2328 !important;
          color: #ffffff !important;
          font-size: 11px !important;
          font-family: inherit !important;
          font-weight: 500 !important;
          padding: 5px 10px !important;
          border-radius: 6px !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
          pointer-events: none !important;
          z-index: 9999 !important;
        }
        .react-activity-calendar__tooltip-arrow {
          fill: #1f2328 !important;
        }
      `}</style>

      {/* Header with Title, Year Selector Dropdown & Profile Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            <Github className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              GitHub Contributions
              <span className="text-xs text-muted-foreground font-mono">
                @{cleanUsername}
              </span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Public activity & commit history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Year Selection Dropdown */}
          <Select value={selectedYear} onValueChange={(val) => setSelectedYear(val)}>
            <SelectTrigger className="h-7 text-xs w-[130px] rounded-lg bg-background border-border/80 cursor-pointer">
              <CalendarDays className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent align="end">
              {availableYears.map((yr) => (
                <SelectItem key={yr.value} value={yr.value} className="text-xs cursor-pointer">
                  {yr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View GitHub Profile Link */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 rounded-lg border-border/80"
            asChild
          >
            <a
              href={`https://github.com/${cleanUsername}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Profile</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>

      {/* Calendar Area with Interactive Tooltips */}
      <div 
        className="github-calendar-scroll-wrapper w-full overflow-x-auto py-2 flex justify-start lg:justify-center items-center min-h-[140px]"
      >
        {!mounted ? (
          <div className="w-full space-y-2 py-4">
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ) : hasError ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Could not load GitHub contributions for @{cleanUsername}. Profile may be private or username invalid.</span>
          </div>
        ) : (
          <div className="w-full flex justify-start lg:justify-center">
            <GitHubCalendar
              key={`${cleanUsername}-${selectedYear}-${isDark ? "dark" : "light"}`}
              username={cleanUsername}
              year={yearProp}
              blockSize={10.2}
              blockMargin={2.4}
              blockRadius={2}
              fontSize={10.5}
              theme={currentTheme}
              colorScheme={isDark ? "dark" : "light"}
              showWeekdayLabels={["mon", "wed", "fri"]}
              labels={{
                totalCount: selectedYear === "last" 
                  ? "{{count}} contributions in the last year" 
                  : `{{count}} contributions in ${selectedYear}`,
                legend: {
                  less: "Less",
                  more: "More",
                },
              }}
              tooltips={{
                activity: {
                  hoverRestMs: 50,
                  withArrow: true,
                  text: (activity) => {
                    const [year, month, day] = activity.date.split("-").map(Number);
                    const dateObj = new Date(year, month - 1, day);
                    const formattedDate = dateObj.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    if (activity.count === 0) {
                      return `No contributions on ${formattedDate}`;
                    }
                    return `${activity.count} contribution${activity.count === 1 ? "" : "s"} on ${formattedDate}`;
                  },
                },
              }}
              throwOnError={false}
              errorMessage={`Could not load GitHub contributions for @${cleanUsername}`}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        {content}
      </CardContent>
    </Card>
  );
}
