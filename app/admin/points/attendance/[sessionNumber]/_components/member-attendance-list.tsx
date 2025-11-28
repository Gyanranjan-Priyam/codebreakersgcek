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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { MemberForAttendance, markAttendance } from "../../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MemberAttendanceListProps {
  members: MemberForAttendance[];
  sessionId: string;
  initialAttendance: Record<string, string>;
  adminId: string;
}

export default function MemberAttendanceList({ members, sessionId, initialAttendance, adminId }: MemberAttendanceListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>(initialAttendance);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleAttendanceChange = async (userId: string, status: string) => {
    setUpdatingId(userId);
    setAttendanceStatus((prev) => ({
      ...prev,
      [userId]: status,
    }));

    try {
      const result = await markAttendance(sessionId, userId, status, adminId);

      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
        // Revert on error
        setAttendanceStatus((prev) => ({
          ...prev,
          [userId]: initialAttendance[userId] || "pending",
        }));
      }
    } catch (error) {
      toast.error("Failed to mark attendance");
      // Revert on error
      setAttendanceStatus((prev) => ({
        ...prev,
        [userId]: initialAttendance[userId] || "pending",
      }));
    } finally {
      setUpdatingId(null);
    }
  };

  // Extract unique years and branches
  const admissionYears = useMemo(() => {
    const years = new Set(
      members
        .map((m) => m.admissionYear)
        .filter((year): year is string => year !== null)
    );
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [members]);

  const branches = useMemo(() => {
    const branchSet = new Set(
      members
        .map((m) => m.branch)
        .filter((branch): branch is string => branch !== null)
    );
    return Array.from(branchSet).sort();
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.username?.toLowerCase().includes(searchLower) ||
        member.registration?.toLowerCase().includes(searchLower) ||
        member.rollNumber?.toLowerCase().includes(searchLower);

      // Year filter
      const matchesYear =
        selectedYear === "all" || member.admissionYear === selectedYear;

      // Branch filter
      const matchesBranch =
        selectedBranch === "all" || member.branch === selectedBranch;

      return matchesSearch && matchesYear && matchesBranch;
    });
  }, [members, searchQuery, selectedYear, selectedBranch]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, username, registration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Admission Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {admissionYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Branch" />
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
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredMembers.length} of {members.length} members
      </div>

      {/* Table */}
      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
          <p className="text-muted-foreground">No members found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Attendance</TableHead>
                <TableHead className="text-center">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    {member.username ? (
                      <Badge variant="outline">@{member.username}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.registration || (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.rollNumber || (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.branch ? (
                      <Badge variant="secondary">{member.branch}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.admissionYear || (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {member.mobileNumber || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select
                      value={attendanceStatus[member.id] || "pending"}
                      onValueChange={(value) => handleAttendanceChange(member.id, value)}
                      disabled={updatingId === member.id}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="present">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Present
                          </div>
                        </SelectItem>
                        <SelectItem value="absent">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            Absent
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    {(attendanceStatus[member.id] || "pending") === "pending" ? (
                      <Badge variant="outline" className="bg-yellow-50">
                        Pending
                      </Badge>
                    ) : (attendanceStatus[member.id] || "pending") === "present" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        +10 pts
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        0 pts
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
