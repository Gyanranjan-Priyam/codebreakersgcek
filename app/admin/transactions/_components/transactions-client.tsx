"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TransactionItem, resendTransactionReceipt } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Search,
  Download,
  FileText,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
  Calendar,
  User,
  CreditCard,
  Tag,
  Loader2,
  MoreVertical,
} from "lucide-react";

interface TransactionsClientProps {
  initialTransactions: TransactionItem[];
}

export function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
  const router = useRouter();
  const [transactions] = useState<TransactionItem[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        tx.recipientName.toLowerCase().includes(q) ||
        tx.recipientEmail.toLowerCase().includes(q) ||
        tx.receiptNumber.toLowerCase().includes(q) ||
        (tx.transactionId && tx.transactionId.toLowerCase().includes(q)) ||
        tx.formTitle.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || tx.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      "Sl No.", "Name", "Email", "Form / Remark",
      "Receipt Number", "Transaction ID", "Amount (INR)",
      "Status", "Submitted At", "Verified At",
    ];
    const rows = filteredTransactions.map((tx, idx) => [
      idx + 1,
      `"${tx.recipientName.replace(/"/g, '""')}"`,
      `"${tx.recipientEmail.replace(/"/g, '""')}"`,
      `"${tx.formTitle.replace(/"/g, '""')}"`,
      `"${tx.receiptNumber}"`,
      `"${tx.transactionId || "N/A"}"`,
      tx.paymentAmount.toFixed(2),
      tx.paymentStatus.toUpperCase(),
      `"${new Date(tx.createdAt).toLocaleString("en-IN")}"`,
      `"${tx.verifiedAt ? new Date(tx.verifiedAt).toLocaleString("en-IN") : "N/A"}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResendReceipt = async (txId: string) => {
    setResendingId(txId);
    try {
      const res = await resendTransactionReceipt(txId);
      if (res.success) {
        alert(res.message || "Receipt re-sent successfully!");
      } else {
        alert(res.error || "Failed to resend receipt.");
      }
    } catch {
      alert("An unexpected error occurred.");
    } finally {
      setResendingId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>

            <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3 sm:items-center">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative w-full sm:w-auto sm:min-w-75">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search name, email, receipt #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Export */}
              <Button
                type="button"
                variant="outline"
                onClick={handleExportCSV}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Sl No.</TableHead>
                  <TableHead className="min-w-40">Name</TableHead>
                  <TableHead className="min-w-32">Receipt No.</TableHead>
                  <TableHead className="min-w-36">Transaction ID</TableHead>
                  <TableHead className="min-w-36">Remark</TableHead>
                  <TableHead className="min-w-24 text-right">Amount</TableHead>
                  <TableHead className="min-w-24">Status</TableHead>
                  <TableHead className="min-w-36">Date & Time</TableHead>
                  <TableHead className="text-right min-w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchQuery || statusFilter !== "all"
                        ? "No transactions found matching your search."
                        : "No transactions recorded yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm text-muted-foreground">{index + 1}</TableCell>

                      <TableCell className="font-medium">
                        <div>{tx.recipientName}</div>
                        <div className="text-xs text-muted-foreground font-normal">{tx.recipientEmail}</div>
                      </TableCell>

                      <TableCell className="text-sm font-mono">#{tx.receiptNumber}</TableCell>

                      <TableCell className="text-sm font-mono">
                        {tx.transactionId || <span className="text-muted-foreground">—</span>}
                      </TableCell>

                      <TableCell className="text-sm">
                        <Badge variant="outline">{tx.formTitle}</Badge>
                      </TableCell>

                      <TableCell className="text-sm font-mono text-right">
                        ₹{tx.paymentAmount.toFixed(2)}
                      </TableCell>

                      <TableCell>
                        {tx.paymentStatus === "verified" && (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                        {tx.paymentStatus === "pending" && (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Clock className="h-3 w-3" /> Pending
                          </Badge>
                        )}
                        {tx.paymentStatus === "rejected" && (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" /> Rejected
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString("en-IN", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit", hour12: true,
                        })}
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
                              onClick={() => setSelectedTx(tx)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => router.push(`/admin/receipt/${tx.id}`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              disabled={resendingId === tx.id}
                              onClick={() => handleResendReceipt(tx.id)}
                            >
                              {resendingId === tx.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="mr-2 h-4 w-4" />
                              )}
                              Resend Receipt Email
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
      </Card>

      {/* ═══ TRANSACTION DETAILS SHEET ═══ */}
      <Sheet open={Boolean(selectedTx)} onOpenChange={(open) => { if (!open) setSelectedTx(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex h-dvh max-h-screen flex-col overflow-hidden">
          {selectedTx && (
            <>
              {/* Fixed Header */}
              <div className="shrink-0 border-b bg-background">
                <SheetHeader className="px-6 pt-6 pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Transaction Details
                  </SheetTitle>
                  <SheetDescription>
                    Receipt #{selectedTx.receiptNumber}
                  </SheetDescription>
                </SheetHeader>
              </div>

              {/* Scrollable Body */}
              <div
                data-lenis-prevent
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-6"
                onWheel={(e) => e.stopPropagation()}
                onTouchMoveCapture={(e) => e.stopPropagation()}
              >
                {/* Remark */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Remark
                  </p>
                  <div className="rounded-md border p-3 bg-muted/40 text-sm">
                    Payment for <span className="font-semibold">{selectedTx.formTitle}</span>
                  </div>
                </div>

                {/* Participant */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Participant
                  </p>
                  <div className="rounded-md border divide-y text-sm">
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{selectedTx.recipientName}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-mono text-xs">{selectedTx.recipientEmail}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Mobile</span>
                      {(() => {
                        const entry = Object.entries(selectedTx.answers).find(([key]) =>
                          ["mobile", "phone", "contact", "mob", "number", "whatsapp"].some((kw) =>
                            key.toLowerCase().includes(kw)
                          )
                        );
                        const mobile = entry ? String(entry[1]).trim() : null;
                        return mobile ? (
                          <span className="font-mono text-xs">{mobile}</span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Not Available</span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Payment
                  </p>
                  <div className="rounded-md border divide-y text-sm">
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-mono font-semibold">₹{selectedTx.paymentAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono text-xs">{selectedTx.transactionId || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2">
                      <span className="text-muted-foreground">Status</span>
                      {selectedTx.paymentStatus === "verified" && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </Badge>
                      )}
                      {selectedTx.paymentStatus === "pending" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending
                        </Badge>
                      )}
                      {selectedTx.paymentStatus === "rejected" && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Rejected
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Receipt No.</span>
                      <span className="font-mono text-xs">#{selectedTx.receiptNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Form Reference */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Form Reference
                  </p>
                  <div className="rounded-md border divide-y text-sm">
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Form ID</span>
                      <span className="font-mono text-xs">{selectedTx.formId}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Response ID</span>
                      <span className="font-mono text-xs">#{selectedTx.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Timeline
                  </p>
                  <div className="rounded-md border divide-y text-sm">
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Submitted At</span>
                      <span className="font-mono text-xs">{new Date(selectedTx.createdAt).toLocaleString("en-IN")}</span>
                    </div>
                    {selectedTx.verifiedAt && (
                      <div className="flex justify-between px-3 py-2">
                        <span className="text-muted-foreground">Verified At</span>
                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                          {new Date(selectedTx.verifiedAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="shrink-0 border-t p-4 bg-background flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/receipt/${selectedTx.id}`)}
                >
                  <FileText className="h-4 w-4" />
                  View Receipt
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={resendingId === selectedTx.id}
                  onClick={() => handleResendReceipt(selectedTx.id)}
                >
                  {resendingId === selectedTx.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Resend Email
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
