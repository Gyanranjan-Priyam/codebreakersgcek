"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  createMember,
  getFormCandidateByResponseId,
  FormCandidateItem,
} from "../actions";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  UserPlus,
  Mail,
  Phone,
  GraduationCap,
  User,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Hash,
  Search,
} from "lucide-react";
import { getActiveBatchesList } from "@/app/admin/batches/actions";

interface AddMemberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const branchOptions = ["CSE", "EE", "ME", "CE", "ECE"];

export default function AddMemberSidebar({ isOpen, onClose }: AddMemberSidebarProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sameNumber, setSameNumber] = useState(true);
  const [branch, setBranch] = useState("");
  const [batchId, setBatchId] = useState<string>("none");
  const [batchesList, setBatchesList] = useState<{ id: string; name: string; code: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Response ID Auto-fill States
  const [responseIdInput, setResponseIdInput] = useState<string>("");
  const [isFetchingResponseId, setIsFetchingResponseId] = useState(false);
  const [autoFilledFrom, setAutoFilledFrom] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getActiveBatchesList().then((list) => setBatchesList(list));
    }
  }, [isOpen]);

  const applyCandidateData = (cand: FormCandidateItem & { formTitle?: string }) => {
    setFirstName(cand.firstName || cand.name);
    setMiddleName(cand.middleName || "");
    setLastName(cand.lastName || "");
    setEmail(cand.email || "");
    setMobileNumber(cand.mobileNumber || "");
    setWhatsappNumber(cand.whatsappNumber || cand.mobileNumber || "");
    setSameNumber(
      !cand.whatsappNumber || cand.whatsappNumber === cand.mobileNumber
    );
    if (cand.branch) {
      setBranch(cand.branch);
    }

    const sourceLabel = cand.formTitle
      ? `${cand.name} (${cand.formTitle})`
      : `${cand.name} (Response: ${cand.id.slice(0, 8)})`;
    setAutoFilledFrom(sourceLabel);

    if (cand.isAlreadyMember) {
      toast.warning(`${cand.name} is already registered as a member.`);
    } else {
      toast.success(`Auto-filled details for ${cand.name}!`);
    }
  };

  const handleFetchByResponseId = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!responseIdInput.trim()) {
      toast.error("Please enter a Response ID or Transaction ID.");
      return;
    }

    setIsFetchingResponseId(true);
    try {
      const res = await getFormCandidateByResponseId(responseIdInput.trim());
      if (res.success && res.data) {
        applyCandidateData(res.data);
      } else {
        toast.error(res.error || "No form response found with this ID.");
      }
    } catch {
      toast.error("An error occurred while fetching response.");
    } finally {
      setIsFetchingResponseId(false);
    }
  };

  const clearAutoFill = () => {
    setResponseIdInput("");
    setAutoFilledFrom(null);
    resetForm();
    toast.info("Form details reset.");
  };

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setMobileNumber("");
    setWhatsappNumber("");
    setSameNumber(true);
    setBranch("");
    setBatchId("none");
    setResponseIdInput("");
    setAutoFilledFrom(null);
  };

  useEffect(() => {
    if (sameNumber) {
      setWhatsappNumber(mobileNumber);
    }
  }, [mobileNumber, sameNumber]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !mobileNumber.trim() || !whatsappNumber.trim() || !branch.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createMember({
        firstName,
        middleName,
        lastName,
        email,
        mobileNumber,
        whatsappNumber: sameNumber ? mobileNumber : whatsappNumber,
        branch,
        batchId: batchId && batchId !== "none" ? batchId : null,
      });

      if (result.status === "success") {
        toast.success(result.message);
        resetForm();
        onClose();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while adding the member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-background border-b">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Member
            </SheetTitle>
            <SheetDescription>
              Create a new member manually or auto-fill details from any form submission.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-5 pb-4">
            {/* Auto-Fill by Response ID Card */}
            <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Auto-Fill by Response ID</span>
                </div>
                {autoFilledFrom && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAutoFill}
                    className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">
                  Enter Response ID or Transaction ID
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="e.g. #8B29FA1C, UUID, or Txn ID"
                      value={responseIdInput}
                      onChange={(e) => setResponseIdInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleFetchByResponseId();
                        }
                      }}
                      disabled={isSubmitting || isFetchingResponseId}
                      className="pl-9 h-8 text-xs font-mono"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleFetchByResponseId()}
                    disabled={isSubmitting || isFetchingResponseId || !responseIdInput.trim()}
                    className="h-8 text-xs px-3 gap-1 shrink-0"
                  >
                    {isFetchingResponseId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-3.5 w-3.5" />
                        <span>Fetch</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {autoFilledFrom && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-500/10 px-2.5 py-1.5 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Auto-filled: <strong>{autoFilledFrom}</strong></span>
                </div>
              )}
            </div>

            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  placeholder="Enter middle name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberEmail">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="memberEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sameNumber"
                checked={sameNumber}
                onCheckedChange={setSameNumber}
                disabled={isSubmitting}
              />
              <Label htmlFor="sameNumber" className="cursor-pointer text-sm font-normal">
                WhatsApp number is same as mobile number
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberWhatsapp">
                WhatsApp Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="memberWhatsapp"
                  type="tel"
                  placeholder="Enter WhatsApp number"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  disabled={isSubmitting || sameNumber}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">
                  Branch <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Select value={branch} onValueChange={setBranch} disabled={isSubmitting}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch">Assign Batch</Label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Select value={batchId} onValueChange={setBatchId} disabled={isSubmitting}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select Batch (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Batch (Unassigned)</SelectItem>
                      {batchesList.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 px-6 py-4 border-t bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Member"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}