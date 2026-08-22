"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPusherClient } from "@/lib/pusher-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  FileText,
  Loader2,
  Inbox,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  updateFormResponseStatus,
  updateFormResponsesStatus,
  deleteFormResponse,
  deleteFormResponses,
  type FormResponseSummary,
  type FormDetail,
} from "@/app/admin/forms/actions";

function getResponseName(answers: Record<string, unknown> | null | undefined): string {
  if (!answers) return "N/A";
  if (typeof answers.name === "string" && answers.name.trim()) return answers.name;
  for (const [k, v] of Object.entries(answers)) {
    if (k.toLowerCase().includes("name") && typeof v === "string" && v.trim()) return v;
  }
  return "N/A";
}

function getResponseEmail(answers: Record<string, unknown> | null | undefined): string {
  if (!answers) return "N/A";
  if (typeof answers.email === "string" && answers.email.trim()) return answers.email;
  for (const [k, v] of Object.entries(answers)) {
    if (k.toLowerCase().includes("email") && typeof v === "string" && v.trim()) return v;
  }
  return "N/A";
}

function extractAnswerValue(
  answers: Record<string, unknown> | null | undefined,
  fieldId: string,
  subId?: string,
  subLabel?: string
): string {
  if (!answers) return "—";

  if (fieldId === "name") return getResponseName(answers);
  if (fieldId === "email") return getResponseEmail(answers);

  const raw = answers[fieldId];
  if (raw === undefined || raw === null) return "—";

  if (subId || subLabel) {
    if (typeof raw === "object" && !Array.isArray(raw)) {
      const subObj = raw as Record<string, unknown>;
      const val = subId ? subObj[subId] ?? (subLabel ? subObj[subLabel] : undefined) : subLabel ? subObj[subLabel] : undefined;
      if (val !== undefined && val !== null && String(val).trim()) {
        return String(val).trim();
      }
    }
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return "—";
  }

  if (Array.isArray(raw)) return raw.length > 0 ? raw.join(", ") : "—";
  if (typeof raw === "object") {
    const pairs: string[] = [];
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (v !== undefined && v !== null && String(v).trim()) {
        pairs.push(`${k}: ${String(v).trim()}`);
      }
    }
    return pairs.length > 0 ? pairs.join(" • ") : "—";
  }

  return String(raw).trim() || "—";
}

function exportResponsesToExcel(form: FormDetail, responses: FormResponseSummary[]) {
  if (!responses || responses.length === 0) {
    toast.error("No responses available to export.");
    return;
  }

  const columns: Array<{
    header: string;
    getValue: (res: FormResponseSummary, index: number) => string;
  }> = [
    { header: "S.No.", getValue: (_, i) => String(i + 1) },
    { header: "Response ID", getValue: (r) => `#${r.id.slice(0, 8).toUpperCase()}` },
    {
      header: "Submitted Date & Time",
      getValue: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : "N/A"),
    },
  ];

  const formHasPayment = form.definition?.sections?.some((s) =>
    s.fields?.some((f) => f.type === "payment")
  );

  if (formHasPayment || responses.some((r) => r.transactionId)) {
    columns.push(
      { header: "Payment Status", getValue: (r) => r.paymentStatus || "pending" },
      { header: "Transaction ID", getValue: (r) => r.transactionId || "—" }
    );
  }

  if (form.definition?.settings?.collectName) {
    columns.push({
      header: "Full Name",
      getValue: (r) => getResponseName(r.answers as Record<string, unknown>),
    });
  }

  if (form.definition?.settings?.collectEmail) {
    columns.push({
      header: "Email Address",
      getValue: (r) => getResponseEmail(r.answers as Record<string, unknown>),
    });
  }

  // Iterate sections in order, fields in order
  const sortedSections = (form.definition?.sections || []).slice().sort((a, b) => a.order - b.order);
  sortedSections.forEach((sec) => {
    const sortedFields = (sec.fields || []).slice().sort((a, b) => a.order - b.order);
    sortedFields.forEach((f) => {
      if (f.type === "button" || f.type === "payment") return;

      if (f.type === "multi_input" && f.subQuestions && f.subQuestions.length > 0) {
        f.subQuestions.forEach((sub) => {
          const headerLabel = f.label ? `${f.label} - ${sub.label}` : sub.label;
          columns.push({
            header: headerLabel,
            getValue: (r) =>
              extractAnswerValue(
                r.answers as Record<string, unknown>,
                f.id,
                sub.id,
                sub.label
              ),
          });
        });
      } else {
        columns.push({
          header: f.label || "Untitled Question",
          getValue: (r) => extractAnswerValue(r.answers as Record<string, unknown>, f.id),
        });
      }
    });
  });

  const headers = columns.map((c) => c.header);
  const rows = responses.map((r, idx) => columns.map((c) => c.getValue(r, idx)));

  const sheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Auto-adjust column widths
  const colWidths = columns.map((col, colIdx) => {
    let maxLen = col.header.length;
    rows.forEach((row) => {
      const val = String(row[colIdx] || "");
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 4, 12), 70) };
  });

  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

  const cleanTitle = (form.title || "Form").replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `${cleanTitle}_Responses_${new Date().toISOString().split("T")[0]}.xlsx`;

  XLSX.writeFile(workbook, fileName);
  toast.success(`Exported ${responses.length} responses to Excel (.xlsx)`);
}

interface ResponsesClientProps {
  form: FormDetail;
}

export default function ResponsesClient({ form }: ResponsesClientProps) {
  const router = useRouter();
  const responses = form.responses || [];
  const formHasPayment = form.definition?.sections?.some((s) =>
    s.fields?.some((f) => f.type === "payment")
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "rejected" | "pending">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingResponse, setViewingResponse] = useState<FormResponseSummary | null>(null);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 0ms Real-time WebSockets subscription for instant form responses
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel1 = pusher.subscribe(`form-${form.id}`);
    const channel2 = pusher.subscribe(`form-${form.formId}`);

    const handleNewResponse = () => {
      toast.info("New form response received in real-time!");
      router.refresh();
    };

    channel1.bind("response-submitted", handleNewResponse);
    channel2.bind("response-submitted", handleNewResponse);

    return () => {
      channel1.unbind_all();
      channel2.unbind_all();
      pusher.unsubscribe(`form-${form.id}`);
      pusher.unsubscribe(`form-${form.formId}`);
    };
  }, [form.id, form.formId, router]);

  // Build ordered field list (questions and sub-questions in exact form order)
  const fieldMap = useMemo(() => {
    const list: Array<{
      fieldId: string;
      subId?: string;
      subLabel?: string;
      label: string;
      sectionTitle: string;
    }> = [];

    if (form.definition?.settings?.collectName) {
      list.push({ fieldId: "name", label: "Full Name", sectionTitle: "Personal Information" });
    }
    if (form.definition?.settings?.collectEmail) {
      list.push({ fieldId: "email", label: "Email Address", sectionTitle: "Personal Information" });
    }

    const sortedSections = (form.definition?.sections || []).slice().sort((a, b) => a.order - b.order);
    sortedSections.forEach((sec) => {
      const sortedFields = (sec.fields || []).slice().sort((a, b) => a.order - b.order);
      sortedFields.forEach((f) => {
        if (f.type === "button" || f.type === "payment") return;
        if (f.type === "multi_input" && f.subQuestions && f.subQuestions.length > 0) {
          f.subQuestions.forEach((sub) => {
            list.push({
              fieldId: f.id,
              subId: sub.id,
              subLabel: sub.label,
              label: f.label ? `${f.label} → ${sub.label}` : sub.label,
              sectionTitle: sec.title,
            });
          });
        } else {
          list.push({
            fieldId: f.id,
            label: f.label || "Untitled Question",
            sectionTitle: sec.title,
          });
        }
      });
    });

    return list;
  }, [form.definition]);

  // Filtered responses
  const filteredResponses = useMemo(() => {
    return responses.filter((res) => {
      if (statusFilter !== "all") {
        if (statusFilter === "pending" && res.paymentStatus !== "pending" && res.paymentStatus !== "submitted") return false;
        if (statusFilter === "verified" && res.paymentStatus !== "verified") return false;
        if (statusFilter === "rejected" && res.paymentStatus !== "rejected") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = getResponseName(res.answers as Record<string, unknown>).toLowerCase();
        const email = getResponseEmail(res.answers as Record<string, unknown>).toLowerCase();
        const txId = (res.transactionId || "").toLowerCase();
        return res.id.toLowerCase().includes(q) || name.includes(q) || email.includes(q) || txId.includes(q);
      }
      return true;
    });
  }, [responses, statusFilter, searchQuery]);

  const isAllSelected = filteredResponses.length > 0 && filteredResponses.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResponses.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSingleStatusUpdate = async (id: string, status: string) => {
    setIsLoading(true);
    const r = await updateFormResponseStatus(id, status);
    if (r.status === "success") { toast.success(r.message); router.refresh(); }
    else toast.error(r.message);
    setIsLoading(false);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.size === 0) return;
    setIsLoading(true);
    const r = await updateFormResponsesStatus(Array.from(selectedIds), status);
    if (r.status === "success") { toast.success(r.message); setSelectedIds(new Set()); router.refresh(); }
    else toast.error(r.message);
    setIsLoading(false);
  };

  const handleSingleDelete = async () => {
    if (!singleDeleteId) return;
    setIsLoading(true);
    const r = await deleteFormResponse(singleDeleteId);
    if (r.status === "success") { toast.success(r.message); setSingleDeleteId(null); router.refresh(); }
    else toast.error(r.message);
    setIsLoading(false);
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    const r = await deleteFormResponses(Array.from(selectedIds));
    if (r.status === "success") {
      toast.success(r.message);
      setSelectedIds(new Set());
      setShowBulkDeleteDialog(false);
      router.refresh();
    } else toast.error(r.message);
    setIsLoading(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>
              Responses ({filteredResponses.length})
            </CardTitle>

            <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3 sm:items-center">
              {/* Bulk actions */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-md">
                  <span className="text-xs font-semibold text-primary mr-1">{selectedIds.size} selected</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                    onClick={() => handleBulkStatusUpdate("verified")} disabled={isLoading}>
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                    onClick={() => handleBulkStatusUpdate("rejected")} disabled={isLoading}>
                    <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs"
                    onClick={() => setShowBulkDeleteDialog(true)} disabled={isLoading}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              )}

              {/* Status filter */}
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="verified">Approved / Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Export to Excel button */}
              <Button
                type="button"
                onClick={() => exportResponsesToExcel(form, filteredResponses)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 rounded-md shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export to Excel
              </Button>

              {/* Search */}
              <div className="relative w-full sm:w-auto sm:min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search name, email, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-16">S.No.</TableHead>
                  <TableHead className="min-w-28">Response ID</TableHead>
                  <TableHead className="min-w-40">Name</TableHead>
                  <TableHead className="min-w-48">Email</TableHead>
                  {(formHasPayment || responses.some((r) => r.transactionId)) && (
                    <TableHead className="min-w-36">Transaction ID</TableHead>
                  )}
                  <TableHead className="min-w-24">Status</TableHead>
                  <TableHead className="min-w-28">Submitted</TableHead>
                  <TableHead className="text-right min-w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox className="h-8 w-8 opacity-30" />
                        <p>{searchQuery || statusFilter !== "all" ? "No responses match your filters." : "No responses yet."}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResponses.map((res, index) => {
                    const resAns = (res.answers as Record<string, unknown>) || {};
                    const nameStr = getResponseName(resAns);
                    const emailStr = getResponseEmail(resAns);
                    const isChecked = selectedIds.has(res.id);

                    return (
                      <TableRow key={res.id} className={isChecked ? "bg-primary/5" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleSelect(res.id)}
                            aria-label={`Select response ${res.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm font-semibold">
                          #{res.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="font-medium">{nameStr}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{emailStr}</TableCell>

                        {(formHasPayment || responses.some((r) => r.transactionId)) && (
                          <TableCell className="font-mono text-sm">
                            {res.transactionId ? (
                              <span className="bg-muted px-2 py-0.5 rounded-md font-semibold">{res.transactionId}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        )}

                        <TableCell>
                          <Badge
                            variant={res.paymentStatus === "verified" ? "default" : res.paymentStatus === "rejected" ? "destructive" : "secondary"}
                            className="capitalize"
                          >
                            {res.paymentStatus === "verified" ? "Approved" : res.paymentStatus}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(res.createdAt).toLocaleDateString("en-IN")}
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
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setViewingResponse(res)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              {res.paymentStatus === "verified" && Boolean(res.transactionId) && (
                                <DropdownMenuItem className="cursor-pointer"
                                  onClick={() => router.push(`/admin/receipt/${res.id}`)}>
                                  <FileText className="mr-2 h-4 w-4" /> View Receipt
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-emerald-600"
                                onClick={() => handleSingleStatusUpdate(res.id, "verified")} disabled={isLoading}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-amber-600"
                                onClick={() => handleSingleStatusUpdate(res.id, "rejected")} disabled={isLoading}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => setSingleDeleteId(res.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── RESPONSE DETAILS SHEET ─── */}
      <Sheet open={Boolean(viewingResponse)} onOpenChange={(open) => { if (!open) setViewingResponse(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl p-0 flex h-dvh max-h-screen flex-col overflow-hidden">
          <div className="shrink-0 border-b bg-background">
            <SheetHeader className="px-6 pt-6 pb-4">
              <SheetTitle className="flex items-center justify-between">
                <span>Response {viewingResponse ? `#${viewingResponse.id.slice(0, 8).toUpperCase()}` : ""}</span>
                {viewingResponse && (
                  <Badge
                    variant={viewingResponse.paymentStatus === "verified" ? "default" : viewingResponse.paymentStatus === "rejected" ? "destructive" : "secondary"}
                    className="text-xs capitalize mr-12"
                  >
                    {viewingResponse.paymentStatus === "verified" ? "Approved" : viewingResponse.paymentStatus}
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription>
                Submitted on {viewingResponse ? new Date(viewingResponse.createdAt).toLocaleString("en-IN") : ""}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4"
            onWheel={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            {viewingResponse && (
              <div className="space-y-4">
                {viewingResponse.transactionId && (
                  <div className="rounded-md border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Transaction ID</p>
                      <p className="text-sm font-mono font-semibold">{viewingResponse.transactionId}</p>
                    </div>
                    {viewingResponse.paymentStatus === "verified" && (
                      <Button type="button" size="sm" variant="outline"
                        onClick={() => router.push(`/admin/receipt/${viewingResponse.id}`)}>
                        <FileText className="mr-1.5 h-3.5 w-3.5" /> View Receipt
                      </Button>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Submitted Answers (In Question Order)</p>
                  <div className="rounded-md border divide-y bg-background">
                    {fieldMap.map((item) => {
                      const ansVal = extractAnswerValue(
                        viewingResponse.answers as Record<string, unknown>,
                        item.fieldId,
                        item.subId,
                        item.subLabel
                      );
                      return (
                        <div
                          key={item.subId ? `${item.fieldId}:${item.subId}` : item.fieldId}
                          className="px-3.5 py-2.5 space-y-1"
                        >
                          <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium text-foreground">{ansVal}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {viewingResponse && (
            <div className="shrink-0 border-t p-4 bg-background flex gap-2">
              <Button size="sm" variant="outline" className="flex-1"
                onClick={() => handleSingleStatusUpdate(viewingResponse.id, "verified")} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />}
                Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1"
                onClick={() => handleSingleStatusUpdate(viewingResponse.id, "rejected")} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <XCircle className="mr-1.5 h-3.5 w-3.5 text-destructive" />}
                Reject
              </Button>
              <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => { setSingleDeleteId(viewingResponse.id); setViewingResponse(null); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Single Delete Dialog */}
      <AlertDialog open={Boolean(singleDeleteId)} onOpenChange={(open) => { if (!open) setSingleDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this form response. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSingleDelete} disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Responses?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {selectedIds.size} selected responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Delete (${selectedIds.size})`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
