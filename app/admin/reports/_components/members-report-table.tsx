"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Settings2, 
  Search, 
  CheckCircle2,
  XCircle,
  Download,
  Trophy,
  Medal,
  Award,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import type { MemberReportData } from "../actions";

interface MembersReportTableProps {
  members: MemberReportData[];
}

interface ColumnVisibility {
  email: boolean;
  mobileNumber: boolean;
  registration: boolean;
  branch: boolean;
  points: boolean;
  rank: boolean;
  githubUsername: boolean;
}

export default function MembersReportTable({ members }: MembersReportTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    email: true,
    mobileNumber: true,
    registration: true,
    branch: true,
    points: true,
    rank: true,
    githubUsername: true,
  });

  // Get unique branches
  const branches = useMemo(() => {
    const uniqueBranches = Array.from(
      new Set(members.map((m) => m.branch).filter(Boolean))
    ).sort();
    return uniqueBranches as string[];
  }, [members]);

  const toggleColumn = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const filteredMembers = members.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.username?.toLowerCase().includes(searchLower) ||
      member.registration?.toLowerCase().includes(searchLower) ||
      member.mobileNumber?.toLowerCase().includes(searchLower) ||
      member.branch?.toLowerCase().includes(searchLower);

    const matchesBranch = selectedBranch === "all" || member.branch === selectedBranch;

    return matchesSearch && matchesBranch;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-orange-600" />;
    return null;
  };

  const exportToCSV = () => {
    const headers = ["Name", "Username"];
    if (columnVisibility.email) headers.push("Email");
    if (columnVisibility.mobileNumber) headers.push("Mobile Number");
    if (columnVisibility.registration) headers.push("Registration");
    if (columnVisibility.branch) headers.push("Branch");
    if (columnVisibility.rank) headers.push("Rank");
    if (columnVisibility.points) headers.push("Points");
    if (columnVisibility.githubUsername) headers.push("GitHub Username");
    headers.push("Verified", "Joined Date");

    const rows = filteredMembers.map((member) => {
      const row = [
        member.name,
        member.username || "N/A",
      ];
      if (columnVisibility.email) row.push(member.email);
      if (columnVisibility.mobileNumber) row.push(member.mobileNumber || "N/A");
      if (columnVisibility.registration) row.push(member.registration || "N/A");
      if (columnVisibility.branch) row.push(member.branch || "N/A");
      if (columnVisibility.rank) row.push(member.rank.toString());
      if (columnVisibility.points) row.push(member.totalPoints.toString());
      if (columnVisibility.githubUsername) row.push(member.githubUsername || "N/A");
      row.push(
        member.emailVerified ? "Yes" : "No",
        format(new Date(member.createdAt), "MMM dd, yyyy")
      );
      return row;
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl">Members Report</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial min-w-[180px] sm:min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Settings2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Columns</span>
                  <span className="sm:hidden">View</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.email}
                  onCheckedChange={() => toggleColumn("email")}
                >
                  Email
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.mobileNumber}
                  onCheckedChange={() => toggleColumn("mobileNumber")}
                >
                  Mobile Number
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.registration}
                  onCheckedChange={() => toggleColumn("registration")}
                >
                  Registration Number
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.branch}
                  onCheckedChange={() => toggleColumn("branch")}
                >
                  Branch
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.points}
                  onCheckedChange={() => toggleColumn("points")}
                >
                  Points
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.rank}
                  onCheckedChange={() => toggleColumn("rank")}
                >
                  Rank
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.githubUsername}
                  onCheckedChange={() => toggleColumn("githubUsername")}
                >
                  GitHub Username
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">CSV</span>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredMembers.length} of {members.length} members
          {selectedBranch !== "all" && ` • Filtered by ${selectedBranch}`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Username</TableHead>
                {columnVisibility.email && <TableHead className="min-w-[200px]">Email</TableHead>}
                {columnVisibility.mobileNumber && <TableHead className="min-w-[120px]">Mobile</TableHead>}
                {columnVisibility.registration && <TableHead className="min-w-[140px]">Registration</TableHead>}
                {columnVisibility.branch && <TableHead className="min-w-[100px]">Branch</TableHead>}
                {columnVisibility.rank && <TableHead className="text-center min-w-20">Rank</TableHead>}
                {columnVisibility.points && <TableHead className="text-center min-w-20">Points</TableHead>}
                {columnVisibility.githubUsername && <TableHead className="min-w-[120px]">GitHub</TableHead>}
                <TableHead className="text-center min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      9 +
                      (columnVisibility.email ? 1 : 0) +
                      (columnVisibility.mobileNumber ? 1 : 0) +
                      (columnVisibility.registration ? 1 : 0) +
                      (columnVisibility.branch ? 1 : 0) +
                      (columnVisibility.rank ? 1 : 0) +
                      (columnVisibility.points ? 1 : 0) +
                      (columnVisibility.githubUsername ? 1 : 0)
                    }
                    className="text-center text-muted-foreground py-8"
                  >
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      {member.username ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {member.username}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-xs">N/A</span>
                      )}
                    </TableCell>
                    {columnVisibility.email && (
                      <TableCell className="text-sm">{member.email}</TableCell>
                    )}
                    {columnVisibility.mobileNumber && (
                      <TableCell>
                        {member.mobileNumber || (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    )}
                    {columnVisibility.registration && (
                      <TableCell>
                        {member.registration ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {member.registration}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    )}
                    {columnVisibility.branch && (
                      <TableCell>
                        {member.branch ? (
                          <Badge variant="outline" className="text-xs">
                            {member.branch}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    )}
                    {columnVisibility.rank && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getRankIcon(member.rank)}
                          <span className="font-bold">#{member.rank}</span>
                        </div>
                      </TableCell>
                    )}
                    {columnVisibility.points && (
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold">
                          {member.totalPoints}
                        </Badge>
                      </TableCell>
                    )}
                    {columnVisibility.githubUsername && (
                      <TableCell>
                        {member.githubUsername ? (
                          <a
                            href={`https://github.com/${member.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center gap-1"
                          >
                            @{member.githubUsername}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      {member.emailVerified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(member.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
