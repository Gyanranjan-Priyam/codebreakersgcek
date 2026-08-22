"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Ban, 
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  User,
  QrCode,
} from "lucide-react";
import { MemberData, toggleMemberBan, deleteMember, deleteMembers, getMemberBySlugId } from "../actions";
import Link from "next/link";
import { toast } from "sonner";
import AddMemberSidebar from "@/app/admin/members/_components/add-member-sidebar";
import MemberDetails from "@/app/admin/members/[id]/_components/member-details";
import MemberQRDialog from "@/app/admin/members/_components/member-qr-dialog";

interface MembersTableProps {
  members: MemberData[];
}

type GetMemberBySlugResult = Awaited<ReturnType<typeof getMemberBySlugId>>;
type MemberFullDetails = Extract<GetMemberBySlugResult, { status: "success" }>["data"];

export default function MembersTable({ members }: MembersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<MemberFullDetails | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [showMemberSidebar, setShowMemberSidebar] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showAddMemberSidebar, setShowAddMemberSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "pending">("all");
  const [banReason, setBanReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [qrMember, setQrMember] = useState<MemberData | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const pendingMembers = members.filter((member) => !member.profileComplete).length;

  const filteredMembers = useMemo(() => {
    const modeFiltered =
      viewMode === "pending"
        ? members.filter((member) => !member.profileComplete)
        : members;

    if (!searchQuery.trim()) {
      return modeFiltered;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    return modeFiltered.filter((member) => {
      return (
        member.cbUserId?.toLowerCase().includes(lowercaseQuery) ||
        member.name.toLowerCase().includes(lowercaseQuery) ||
        member.email.toLowerCase().includes(lowercaseQuery) ||
        member.role?.toLowerCase().includes(lowercaseQuery) ||
        member.username?.toLowerCase().includes(lowercaseQuery) ||
        member.firstName?.toLowerCase().includes(lowercaseQuery) ||
        member.lastName?.toLowerCase().includes(lowercaseQuery) ||
        member.registration?.toLowerCase().includes(lowercaseQuery) ||
        member.rollNumber?.toLowerCase().includes(lowercaseQuery) ||
        member.branch?.toLowerCase().includes(lowercaseQuery) ||
        member.collegeName?.toLowerCase().includes(lowercaseQuery)
      );
    });
  }, [members, searchQuery, viewMode]);

  const allVisibleSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((member) => selectedMemberIds.has(member.id));

  const someVisibleSelected =
    filteredMembers.some((member) => selectedMemberIds.has(member.id)) &&
    !allVisibleSelected;

  const toggleSelectAllVisible = (checked: boolean) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);

      if (checked) {
        filteredMembers.forEach((member) => next.add(member.id));
      } else {
        filteredMembers.forEach((member) => next.delete(member.id));
      }

      return next;
    });
  };

  const toggleSelectMember = (memberId: string, checked: boolean) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);

      if (checked) {
        next.add(memberId);
      } else {
        next.delete(memberId);
      }

      return next;
    });
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
    } catch {
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
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openMemberSidebar = async (member: MemberData) => {
    setSelectedMember(member);
    setSelectedMemberDetails(null);
    setShowMemberSidebar(true);

    setIsDetailsLoading(true);
    try {
      const result = await getMemberBySlugId(member.id);
      if (result.status === "success") {
        setSelectedMemberDetails(result.data);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to load member details.");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const openBanDialogFromSidebar = () => {
    setShowMemberSidebar(false);
    setShowBanDialog(true);
  };

  const openDeleteDialogFromSidebar = () => {
    setShowMemberSidebar(false);
    setShowDeleteDialog(true);
  };

  const handleMemberSidebarOpenChange = (open: boolean) => {
    if (!open) {
      closeMemberSidebar();
      return;
    }

    setShowMemberSidebar(true);
  };

  const closeMemberSidebar = () => {
    setShowMemberSidebar(false);
    setSelectedMember(null);
    setSelectedMemberDetails(null);
  };

  useEffect(() => {
    if (!showMemberSidebar) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [showMemberSidebar]);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedMemberIds);
    if (ids.length === 0) return;

    setIsLoading(true);
    try {
      const result = await deleteMembers(ids);

      if (result.status === "success") {
        toast.success(result.message);
        setSelectedMemberIds(new Set());
        setShowBulkDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>
            {viewMode === "pending" ? "Pending Members" : "All Members"} ({filteredMembers.length})
          </CardTitle>

          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              type="button"
              variant={viewMode === "pending" ? "default" : "outline"}
              onClick={() => setViewMode(viewMode === "pending" ? "all" : "pending")}
              className="w-full sm:w-auto"
            >
              Pending Members
              <Badge variant="secondary" className="ml-2">
                {pendingMembers}
              </Badge>
            </Button>

            <Button
              type="button"
              onClick={() => setShowAddMemberSidebar(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add New Member
            </Button>

            {selectedMemberIds.size > 0 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedMemberIds.size})
              </Button>
            )}

            <div className="relative w-full sm:w-auto sm:min-w-75">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                    onCheckedChange={(checked) => toggleSelectAllVisible(checked === true)}
                    aria-label="Select all members"
                  />
                </TableHead>
                <TableHead className="w-16">S.No.</TableHead>
                <TableHead className="min-w-37.5">Name</TableHead>
                <TableHead className="min-w-28">User ID</TableHead>
                <TableHead className="min-w-20">Role</TableHead>
                <TableHead className="min-w-50">Email</TableHead>
                <TableHead className="min-w-30">WhatsApp</TableHead>
                <TableHead className="min-w-25">Branch</TableHead>
                <TableHead className="min-w-30">Mobile</TableHead>
                <TableHead className="min-w-25">Status</TableHead>
                <TableHead className="text-right min-w-25">Actions</TableHead>
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
                filteredMembers.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMemberIds.has(member.id)}
                        onCheckedChange={(checked) => toggleSelectMember(member.id, checked === true)}
                        aria-label={`Select ${member.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/admin/members/${member.cbUserId || member.registration || member.username || member.id}`}
                        className="flex items-center gap-2 hover:underline cursor-pointer"
                      >
                        {member.name}
                        {member.emailVerified && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm font-mono font-medium">
                      {member.cbUserId || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {member.role === "admin" ? (
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-none">Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Member</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{member.email}</TableCell>
                    <TableCell className="text-sm">
                      {member.whatsappNumber || <span className="text-muted-foreground">-</span>}
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
                      ) : !member.profileComplete ? (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Active
                        </Badge>
                      )}
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
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => openMemberSidebar(member)}
                          >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setQrMember(member);
                              setShowQrDialog(true);
                            }}
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR
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
                              setSelectedMemberIds(new Set());
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
                  This will restore <strong>{selectedMember.name}</strong>&apos;s access to the platform.
                </>
              ) : (
                <>
                  This will restrict <strong>{selectedMember?.name}</strong>&apos;s access to the platform.
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

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Members?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMemberIds.size} selected member{selectedMemberIds.size > 1 ? "s" : ""} from the system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
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
                "Delete Selected"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={showMemberSidebar} onOpenChange={handleMemberSidebarOpenChange} modal>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex h-dvh max-h-screen flex-col overflow-hidden">
          <div className="shrink-0 border-b bg-background">
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {selectedMember?.name || "Member Details"}
              </SheetTitle>
              <SheetDescription>
                Quick member actions and profile summary.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-6" onWheel={(event) => event.stopPropagation()} onTouchMoveCapture={(event) => event.stopPropagation()}>
            {isDetailsLoading && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading member details...
              </div>
            )}

            {!isDetailsLoading && selectedMemberDetails && (
              <MemberDetails member={selectedMemberDetails} />
            )}

            {!isDetailsLoading && !selectedMemberDetails && (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Unable to load member details.
              </div>
            )}
          </div>

          <div className="shrink-0 border-t bg-background px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={openBanDialogFromSidebar}
                disabled={!selectedMember || isLoading}
                className="flex-1"
              >
                <Ban className="h-4 w-4 mr-2" />
                {selectedMember?.banned ? "Unban" : "Ban"}
              </Button>
              <Button
                variant="destructive"
                onClick={openDeleteDialogFromSidebar}
                disabled={!selectedMember || isLoading}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={closeMemberSidebar}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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

      <AddMemberSidebar
        isOpen={showAddMemberSidebar}
        onClose={() => setShowAddMemberSidebar(false)}
      />

      {qrMember && (
        <MemberQRDialog
          open={showQrDialog}
          onOpenChange={(open) => {
            setShowQrDialog(open);
            if (!open) setQrMember(null);
          }}
          member={qrMember}
        />
      )}
    </Card>
  );
}
