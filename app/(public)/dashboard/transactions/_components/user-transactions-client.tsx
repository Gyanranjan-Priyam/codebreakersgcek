"use client";

import { useState, useMemo } from "react";
import {
  ReceiptText,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Printer,
  Copy,
  Check,
  Mail,
  Calendar,
  Bell,
  Send,
  Eye,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Image from "next/image";
import type {
  UserTransactionsResponse,
  UserTransactionItem,
  TransactionNotification,
} from "../actions";

interface UserTransactionsClientProps {
  initialData: UserTransactionsResponse;
}

export function UserTransactionsClient({
  initialData,
}: UserTransactionsClientProps) {
  const { transactions, summary } = initialData;
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<UserTransactionItem | null>(null);
  const [receiptModalItem, setReceiptModalItem] =
    useState<UserTransactionItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.formTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.transactionId &&
          tx.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.recipientEmail &&
          tx.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === "verified") return tx.paymentStatus === "verified";
      if (activeTab === "pending") return tx.paymentStatus === "pending";
      if (activeTab === "rejected") return tx.paymentStatus === "rejected";
      return true;
    });
  }, [transactions, searchTerm, activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 font-medium">
            <CreditCard className="w-3.5 h-3.5" />
            Submitted
          </Badge>
        );
    }
  };

  const getNotificationIcon = (type: TransactionNotification["type"]) => {
    switch (type) {
      case "PAYMENT_VERIFIED":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case "EMAIL_SENT":
        return <Mail className="w-4 h-4 text-blue-500" />;
      case "PAYMENT_PENDING":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "PAYMENT_REJECTED":
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Send className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* ── Top Header & Title ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ReceiptText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Transaction History
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your payment records, view transaction receipts, and track
            verification updates.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="self-start md:self-auto gap-2 border-border/80"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* ── Metrics Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Transactions
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {summary.totalTransactions}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ReceiptText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Amount Paid
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                ₹{summary.totalPaidAmount.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Verified Payments
              </p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                {summary.verifiedCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Pending / In Review
              </p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {summary.pendingCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filter Bar & Tabs ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 sm:flex w-full sm:w-auto">
            <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({summary.verifiedCount})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({summary.pendingCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, Form, Ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-9 bg-card border-border/80"
          />
        </div>
      </div>

      {/* ── Transactions List ── */}
      {filteredTransactions.length === 0 ? (
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <ReceiptText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No Transactions Found
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1">
              {searchTerm
                ? "No transactions matched your search query. Try searching with different terms."
                : "You haven't submitted any payment-linked forms yet. Your transactions will appear here once submitted."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTransactions.map((tx) => (
            <Card
              key={tx.id}
              className="border-border/60 hover:border-primary/40 transition-colors shadow-xs group"
            >
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Title & Reference Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground truncate">
                        {tx.formTitle}
                      </h3>
                      {getStatusBadge(tx.paymentStatus)}
                      {tx.paymentAmount > 0 && (
                        <span className="font-bold text-base text-foreground sm:hidden">
                          ₹{tx.paymentAmount}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-medium text-foreground">
                          {tx.referenceNumber}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(tx.referenceNumber, `ref-${tx.id}`)
                          }
                          className="hover:text-foreground cursor-pointer transition-colors"
                          title="Copy reference number"
                        >
                          {copiedKey === `ref-${tx.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {tx.transactionId && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">
                            UPI Ref:
                          </span>
                          <span className="font-mono text-foreground font-medium">
                            {tx.transactionId}
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(tx.transactionId!, `tx-${tx.id}`)
                            }
                            className="hover:text-foreground cursor-pointer transition-colors"
                            title="Copy transaction ID"
                          >
                            {copiedKey === `tx-${tx.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(tx.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Latest status / message notification snippet */}
                    {tx.notifications.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">
                          {
                            tx.notifications[tx.notifications.length - 1]
                              .message
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Amount & Action Buttons */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                    <div className="hidden sm:block text-right mr-3">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-xl font-bold text-foreground">
                        ₹{tx.paymentAmount.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTransaction(tx)}
                        className="text-xs h-9 gap-1.5 flex-1 sm:flex-none border-border/80"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details & Msgs
                      </Button>

                      {tx.paymentStatus === "verified" ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setReceiptModalItem(tx)}
                          className="text-xs h-9 gap-1.5 flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          View Receipt
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setReceiptModalItem(tx)}
                          className="text-xs h-9 gap-1.5 flex-1 sm:flex-none"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Transaction Details & Notifications Dialog ── */}
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTransaction && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 pr-4">
                  <DialogTitle className="text-lg font-bold">
                    {selectedTransaction.formTitle}
                  </DialogTitle>
                  {getStatusBadge(selectedTransaction.paymentStatus)}
                </div>
                <DialogDescription>
                  Invoice Ref: {selectedTransaction.referenceNumber} • Submitted
                  on {new Date(selectedTransaction.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-2">
                {/* Key Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/60">
                    <p className="text-xs text-muted-foreground">Amount Paid</p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      ₹{selectedTransaction.paymentAmount}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/60">
                    <p className="text-xs text-muted-foreground">
                      Transaction ID
                    </p>
                    <p className="text-xs font-mono font-bold text-foreground mt-1 truncate">
                      {selectedTransaction.transactionId || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/60 col-span-2 sm:col-span-1">
                    <p className="text-xs text-muted-foreground">
                      Verification Date
                    </p>
                    <p className="text-xs font-medium text-foreground mt-1">
                      {selectedTransaction.verifiedAt
                        ? new Date(
                            selectedTransaction.verifiedAt,
                          ).toLocaleDateString()
                        : "Pending"}
                    </p>
                  </div>
                </div>

                {/* Messages & Notifications Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold text-foreground">
                      Messages & Notification Timeline
                    </h4>
                  </div>

                  <div className="space-y-2.5 border-l-2 border-primary/20 pl-4 ml-2">
                    {selectedTransaction.notifications.map((notif) => (
                      <div key={notif.id} className="relative group space-y-1">
                        <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-background border-2 border-primary flex items-center justify-center" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            {getNotificationIcon(notif.type)}
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submitted Answers Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground">
                    Submitted Form Answers
                  </h4>
                  <div className="rounded-xl border border-border/60 divide-y divide-border/60 max-h-56 overflow-y-auto">
                    {Object.entries(selectedTransaction.answers).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-muted/30"
                        >
                          <span className="text-muted-foreground font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}:
                          </span>
                          <span className="font-semibold text-foreground sm:text-right break-all">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTransaction(null)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const tx = selectedTransaction;
                      setSelectedTransaction(null);
                      setReceiptModalItem(tx);
                    }}
                    className="gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    Open Receipt
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Official Printable Receipt Viewer Dialog ── */}
      <Dialog
        open={!!receiptModalItem}
        onOpenChange={(open) => !open && setReceiptModalItem(null)}
      >
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:border-none print:shadow-none">
          {receiptModalItem && (
            <div className="space-y-6">
              {/* Receipt Header Toolbar */}
              <div className="flex items-center justify-between gap-4 print:hidden border-b border-border/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Official Payment Receipt
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ref: {receiptModalItem.referenceNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReceiptModalItem(null)}
                    className="h-8 text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* Printable Receipt Paper Body */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs print:border-none print:p-0">
                {/* Organization Header */}
                <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-6">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/assets/logo.png"
                      alt="CodeBreakers Logo"
                      width={44}
                      height={44}
                      className="rounded-lg shrink-0"
                    />
                    <div>
                      <h2 className="text-base font-bold tracking-tight text-foreground">
                        CodeBreakers Club
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Govt. College of Engineering Kalahandi
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                      Receipt Reference
                    </span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {receiptModalItem.referenceNumber}
                    </span>
                  </div>
                </div>

                {/* Participant Details & Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">
                      Issued To:
                    </span>
                    <span className="font-bold text-foreground text-sm block">
                      {receiptModalItem.recipientName}
                    </span>
                    <span className="text-muted-foreground block">
                      {receiptModalItem.recipientEmail}
                    </span>
                    {receiptModalItem.recipientPhone && (
                      <span className="text-muted-foreground block">
                        {receiptModalItem.recipientPhone}
                      </span>
                    )}
                  </div>

                  <div className="text-right space-y-1">
                    <div>
                      <span className="text-muted-foreground">Date: </span>
                      <span className="font-semibold text-foreground">
                        {new Date(
                          receiptModalItem.createdAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">
                        {receiptModalItem.paymentStatus}
                      </span>
                    </div>
                    {receiptModalItem.transactionId && (
                      <div>
                        <span className="text-muted-foreground">UPI Ref: </span>
                        <span className="font-mono font-semibold text-foreground">
                          {receiptModalItem.transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Line Item Table */}
                <div className="rounded-xl border border-border/80 overflow-hidden">
                  <div className="bg-muted/60 p-3 text-xs font-bold text-muted-foreground grid grid-cols-3">
                    <span className="col-span-2">Item Description</span>
                    <span className="text-right">Amount</span>
                  </div>
                  <div className="p-3.5 text-xs grid grid-cols-3 items-center border-t border-border/60">
                    <div className="col-span-2 space-y-0.5">
                      <span className="font-bold text-foreground block">
                        {receiptModalItem.formTitle}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Official Registration & Participation Fee
                      </span>
                    </div>
                    <span className="font-bold text-foreground text-right">
                      ₹{receiptModalItem.paymentAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-muted/40 p-3 text-xs font-bold grid grid-cols-3 items-center border-t border-border/80">
                    <span className="col-span-2 text-foreground">
                      Total Paid:
                    </span>
                    <span className="text-right text-sm font-bold text-primary">
                      ₹{receiptModalItem.paymentAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Authorized Seal and Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/80 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Digital Receipt</span>
                  </div>
                  <div className="text-right font-medium">
                    <span>CodeBreakers Tech Community</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
