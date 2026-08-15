"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TransactionItem, PaymentFormOption, resendTransactionReceipt } from "../actions";
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
  AlertTriangle,
  IndianRupee,
  Filter,
  ExternalLink,
  X,
  FileSpreadsheet,
} from "lucide-react";

interface TransactionsClientProps {
  initialTransactions: TransactionItem[];
  initialPaymentForms?: PaymentFormOption[];
}

export function TransactionsClient({
  initialTransactions,
  initialPaymentForms = [],
}: TransactionsClientProps) {
  const router = useRouter();
  const [transactions] = useState<TransactionItem[]>(initialTransactions);
  const [paymentForms] = useState<PaymentFormOption[]>(initialPaymentForms);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formFilter, setFormFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Overall Statistics calculation
  const stats = useMemo(() => {
    let totalVerifiedRevenue = 0;
    let verifiedCount = 0;
    let pendingCount = 0;
    let fakeCount = 0;

    for (const tx of transactions) {
      if (tx.paymentStatus === "verified") {
        totalVerifiedRevenue += tx.paymentAmount;
        verifiedCount++;
      } else if (tx.paymentStatus === "pending") {
        pendingCount++;
      }
      if (tx.isFakeOrSuspicious) {
        fakeCount++;
      }
    }

    return {
      totalVerifiedRevenue,
      verifiedCount,
      pendingCount,
      fakeCount,
      totalCount: transactions.length,
    };
  }, [transactions]);

  // Selected Form Payment Details Overview
  const selectedFormInfo = useMemo(() => {
    if (formFilter === "all") return null;
    const formOpt = paymentForms.find((f) => f.formId === formFilter);
    const formTxs = transactions.filter((tx) => tx.formId === formFilter);
    const formTitle = formOpt?.title || formTxs[0]?.formTitle || "Selected Form";
    const formAmount = formOpt?.paymentAmount || formTxs[0]?.paymentAmount || 0;

    let verifiedCount = 0;
    let pendingCount = 0;
    let fakeCount = 0;
    let totalVerifiedRevenue = 0;

    for (const tx of formTxs) {
      if (tx.paymentStatus === "verified") {
        verifiedCount++;
        totalVerifiedRevenue += tx.paymentAmount;
      } else if (tx.paymentStatus === "pending") {
        pendingCount++;
      }
      if (tx.isFakeOrSuspicious) {
        fakeCount++;
      }
    }

    return {
      formId: formFilter,
      title: formTitle,
      paymentAmount: formAmount,
      totalCount: formTxs.length,
      verifiedCount,
      pendingCount,
      fakeCount,
      totalVerifiedRevenue,
    };
  }, [formFilter, paymentForms, transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.recipientName.toLowerCase().includes(q) ||
        tx.recipientEmail.toLowerCase().includes(q) ||
        tx.receiptNumber.toLowerCase().includes(q) ||
        (tx.transactionId && tx.transactionId.toLowerCase().includes(q)) ||
        tx.formTitle.toLowerCase().includes(q) ||
        tx.formId.toLowerCase().includes(q);

      const matchesForm = formFilter === "all" || tx.formId === formFilter;

      let matchesStatus = true;
      if (statusFilter === "verified") {
        matchesStatus = tx.paymentStatus === "verified";
      } else if (statusFilter === "pending") {
        matchesStatus = tx.paymentStatus === "pending";
      } else if (statusFilter === "rejected") {
        matchesStatus = tx.paymentStatus === "rejected";
      } else if (statusFilter === "fake") {
        matchesStatus = tx.isFakeOrSuspicious || (!tx.transactionId && tx.paymentStatus !== "verified");
      }

      return matchesSearch && matchesForm && matchesStatus;
    });
  }, [transactions, searchQuery, formFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      "Sl No.",
      "Name",
      "Email",
      "Form / Remark",
      "Form ID",
      "Receipt Number",
      "Transaction ID",
      "Amount (INR)",
      "Status",
      "Validity",
      "Submitted At",
      "Verified At",
    ];
    const rows = filteredTransactions.map((tx, idx) => [
      idx + 1,
      `"${tx.recipientName.replace(/"/g, '""')}"`,
      `"${tx.recipientEmail.replace(/"/g, '""')}"`,
      `"${tx.formTitle.replace(/"/g, '""')}"`,
      `"${tx.formId}"`,
      `"${tx.receiptNumber}"`,
      `"${tx.transactionId || "N/A"}"`,
      tx.paymentAmount.toFixed(2),
      tx.paymentStatus.toUpperCase(),
      tx.paymentStatus === "verified" ? "VALID" : tx.isFakeOrSuspicious ? "SUSPICIOUS/FAKE" : "UNVERIFIED",
      `"${new Date(tx.createdAt).toLocaleString("en-IN")}"`,
      `"${tx.verifiedAt ? new Date(tx.verifiedAt).toLocaleString("en-IN") : "N/A"}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const formPrefix = selectedFormInfo ? selectedFormInfo.title.replace(/[^a-zA-Z0-9]/g, "_") : "All_Forms";
    link.setAttribute("download", `Transactions_${formPrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="space-y-6">
      {/* ═══ STATS CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Verified Revenue</p>
              <h3 className="text-xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                ₹{stats.totalVerifiedRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Verified & Valid</p>
              <h3 className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {stats.verifiedCount} <span className="text-xs font-normal text-muted-foreground">/ {stats.totalCount}</span>
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending Verification</p>
              <h3 className="text-xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {stats.pendingCount}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Unverified / Dummy ID</p>
              <h3 className="text-xl font-bold mt-1 text-red-600 dark:text-red-400">
                {stats.fakeCount}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ SELECTED FORM PAYMENT DETAILS PANEL ═══ */}
      {selectedFormInfo && (
        <Card className="border-primary/30 bg-primary/5 dark:bg-primary/10 transition-all shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary text-primary-foreground text-xs font-semibold">Selected Form Payment Details</Badge>
                  <Badge variant="outline" className="font-mono text-xs">{selectedFormInfo.formId}</Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground">{selectedFormInfo.title}</h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/admin/forms/${selectedFormInfo.formId}/responses`)}
                  className="h-8 text-xs gap-1.5 bg-background"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Responses & Form
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Export Selected Form CSV ({filteredTransactions.length})
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setFormFilter("all")}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title="Clear Form Filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-primary/15 text-xs">
              <div>
                <p className="text-muted-foreground font-medium">Standard Payment Fee</p>
                <p className="text-sm font-bold font-mono mt-0.5">₹{selectedFormInfo.paymentAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Total Form Submissions</p>
                <p className="text-sm font-bold font-mono mt-0.5">{selectedFormInfo.totalCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Verified Payments</p>
                <p className="text-sm font-bold font-mono mt-0.5 text-emerald-600 dark:text-emerald-400">
                  {selectedFormInfo.verifiedCount} ({selectedFormInfo.totalCount > 0 ? Math.round((selectedFormInfo.verifiedCount / selectedFormInfo.totalCount) * 100) : 0}%)
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Verified Collection</p>
                <p className="text-sm font-bold font-mono mt-0.5 text-emerald-600 dark:text-emerald-400">
                  ₹{selectedFormInfo.totalVerifiedRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ MAIN TRANSACTIONS CARD ═══ */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div>
              <CardTitle className="text-lg">
                {selectedFormInfo ? `${selectedFormInfo.title} Transactions` : "Form Payment Transactions"} ({filteredTransactions.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedFormInfo
                  ? `Showing transaction records for ${selectedFormInfo.title} (${selectedFormInfo.formId}).`
                  : "Only showing form responses that have payment fields or transactions."}
              </p>
            </div>

            <div className="flex w-full xl:w-auto flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
              {/* Form Filter Selector */}
              {paymentForms.length > 0 && (
                <Select value={formFilter} onValueChange={setFormFilter}>
                  <SelectTrigger className="w-full sm:w-[220px] text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="All Payment Forms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Forms ({paymentForms.length})</SelectItem>
                    {paymentForms.map((pf) => (
                      <SelectItem key={pf.formId} value={pf.formId}>
                        {pf.title} (₹{pf.paymentAmount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Status & Validity Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[170px] text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses & Validity</SelectItem>
                  <SelectItem value="verified">Verified / Valid</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="fake">Dummy / Unverified ID</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative w-full sm:w-auto min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search name, email, Tx ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Export Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="w-full sm:w-auto h-9 text-xs gap-1.5 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                {selectedFormInfo ? "Export Selected Form CSV" : "Export CSV"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Sl</TableHead>
                  <TableHead className="min-w-40">Participant</TableHead>
                  <TableHead className="min-w-32">Receipt No.</TableHead>
                  <TableHead className="min-w-36">Transaction ID</TableHead>
                  <TableHead className="min-w-36">Form Details</TableHead>
                  <TableHead className="min-w-24 text-right">Amount</TableHead>
                  <TableHead className="min-w-28">Status</TableHead>
                  <TableHead className="min-w-36">Submitted Date</TableHead>
                  <TableHead className="text-right min-w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="h-8 w-8 opacity-30" />
                        <p className="text-sm">
                          {searchQuery || statusFilter !== "all" || formFilter !== "all"
                            ? "No payment transactions found matching your selected form / search criteria."
                            : "No form transactions recorded yet."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>

                      <TableCell className="font-medium">
                        <div className="text-sm">{tx.recipientName}</div>
                        <div className="text-xs text-muted-foreground font-normal">{tx.recipientEmail}</div>
                      </TableCell>

                      <TableCell className="text-xs font-mono">#{tx.receiptNumber}</TableCell>

                      <TableCell className="text-xs font-mono">
                        {tx.transactionId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="bg-muted px-2 py-0.5 rounded font-semibold text-foreground">
                              {tx.transactionId}
                            </span>
                            {tx.isFakeOrSuspicious && tx.paymentStatus !== "verified" && (
                              <span title="Unverified or suspicious transaction ID format" className="text-amber-500">
                                <AlertTriangle className="h-3.5 w-3.5 inline" />
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">— No Tx ID —</span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs">
                        <Badge variant="outline" className="font-normal text-xs">
                          {tx.formTitle}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{tx.formId}</div>
                      </TableCell>

                      <TableCell className="text-sm font-mono text-right font-semibold">
                        ₹{tx.paymentAmount.toFixed(2)}
                      </TableCell>

                      <TableCell>
                        {tx.paymentStatus === "verified" ? (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 w-fit text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-xs"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </Badge>
                        ) : tx.paymentStatus === "rejected" ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit text-xs">
                            <XCircle className="h-3 w-3" /> Rejected
                          </Badge>
                        ) : tx.isFakeOrSuspicious ? (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-xs">
                            <AlertTriangle className="h-3 w-3" /> Dummy / Pending
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit text-xs">
                            <Clock className="h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-xs"
                              onClick={() => setSelectedTx(tx)}
                            >
                              <Eye className="mr-2 h-3.5 w-3.5" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-xs"
                              onClick={() => router.push(`/admin/receipt/${tx.id}`)}
                            >
                              <FileText className="mr-2 h-3.5 w-3.5" />
                              View Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-xs"
                              disabled={resendingId === tx.id}
                              onClick={() => handleResendReceipt(tx.id)}
                            >
                              {resendingId === tx.id ? (
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="mr-2 h-3.5 w-3.5" />
                              )}
                              Resend Email Receipt
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
                {/* Form Details */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Form Details
                  </p>
                  <div className="rounded-md border p-3 bg-muted/40 text-sm space-y-1">
                    <p className="font-semibold">{selectedTx.formTitle}</p>
                    <p className="text-xs font-mono text-muted-foreground">Form ID: {selectedTx.formId}</p>
                  </div>
                </div>

                {/* Participant Info */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Participant Details
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
                      <span className="text-muted-foreground">Mobile / Contact</span>
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

                {/* Payment Info */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Payment & Transaction Info
                  </p>
                  <div className="rounded-md border divide-y text-sm">
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-mono font-semibold">₹{selectedTx.paymentAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono text-xs font-semibold">
                        {selectedTx.transactionId || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2">
                      <span className="text-muted-foreground">Verification Status</span>
                      {selectedTx.paymentStatus === "verified" ? (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" /> Verified Real Transaction
                        </Badge>
                      ) : selectedTx.paymentStatus === "rejected" ? (
                        <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                          <XCircle className="h-3 w-3" /> Rejected
                        </Badge>
                      ) : selectedTx.isFakeOrSuspicious ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40 flex items-center gap-1 text-xs">
                          <AlertTriangle className="h-3 w-3" /> Unverified / Dummy ID
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" /> Pending Verification
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between px-3 py-2">
                      <span className="text-muted-foreground">Receipt Reference</span>
                      <span className="font-mono text-xs">#{selectedTx.receiptNumber}</span>
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
    </div>
  );
}
