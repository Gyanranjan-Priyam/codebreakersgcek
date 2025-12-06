"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Ban, 
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { MemberData, toggleMemberBan, deleteMember } from "../actions";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

interface MembersTableProps {
  members: MemberData[];
}

export default function MembersTable({ members }: MembersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState(members);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredMembers(members);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = members.filter((member) => {
      return (
        member.name.toLowerCase().includes(lowercaseQuery) ||
        member.email.toLowerCase().includes(lowercaseQuery) ||
        member.username?.toLowerCase().includes(lowercaseQuery) ||
        member.registration?.toLowerCase().includes(lowercaseQuery) ||
        member.rollNumber?.toLowerCase().includes(lowercaseQuery) ||
        member.branch?.toLowerCase().includes(lowercaseQuery) ||
        member.collegeName?.toLowerCase().includes(lowercaseQuery)
      );
    });

    setFilteredMembers(filtered);
  };

  const handleToggleBan = async () => {
    if (!selectedMember) return;
    
    if (!selectedMember.banned && !banReason.trim()) {
      toast.error("Please provide a reason for banning");
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleMemberBan(selectedMember.id, banReason);
      
      if (result.status === "success") {
        toast.success(result.message);
        setBanReason("");
        setShowBanDialog(false);
        setSelectedMember(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    try {
      const result = await deleteMember(selectedMember.id);
      
      if (result.status === "success") {
        toast.success(result.message);
        setShowDeleteDialog(false);
        setSelectedMember(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>All Members ({filteredMembers.length})</CardTitle>
          
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Registration</TableHead>
                <TableHead className="min-w-[120px]">Roll Number</TableHead>
                <TableHead className="min-w-[100px]">Branch</TableHead>
                <TableHead className="min-w-[120px]">Mobile</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Joined</TableHead>
                <TableHead className="text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No members found matching your search." : "No members registered yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/admin/members/${member.registration || member.username || member.id}`}
                        className="flex items-center gap-2 hover:underline cursor-pointer"
                      >
                        {member.name}
                        {member.emailVerified && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{member.email}</TableCell>
                    <TableCell className="text-sm">
                      {member.registration || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {member.rollNumber || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {member.branch || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {member.mobileNumber || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {member.banned ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          Banned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(member.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/members/${member.registration || member.username || member.id}`} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowBanDialog(true);
                            }}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {member.banned ? "Unban" : "Ban"} Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="cursor-pointer text-destructive"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Ban Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedMember?.banned ? "Unban Member?" : "Ban Member?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedMember?.banned ? (
                <>
                  This will restore <strong>{selectedMember.name}</strong>'s access to the platform.
                </>
              ) : (
                <>
                  This will restrict <strong>{selectedMember?.name}</strong>'s access to the platform.
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="banReason">Reason for banning (required)</Label>
                    <Input
                      id="banReason"
                      placeholder="Enter reason..."
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                    />
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setBanReason("");
              setSelectedMember(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleToggleBan();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${selectedMember?.banned ? "Unban" : "Ban"}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedMember?.name}</strong> ({selectedMember?.email}) from the system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMember(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
