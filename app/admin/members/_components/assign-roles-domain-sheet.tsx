"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  UserCheck,
  Target,
  Loader2,
  Sparkles,
  ShieldAlert,
  Check,
  RotateCcw,
  Plus,
  X,
} from "lucide-react";
import {
  ASSIGNABLE_ROLES,
  AssignableRole,
  MAX_MEMBER_ROLES,
  parseMemberRoles,
  isSystemAdminRole,
  getRoleBadgeClasses,
} from "@/lib/member-roles";
import {
  PREDEFINED_DOMAINS,
  parseSpecializedDomains,
  serializeSpecializedDomains,
  getDomainBadgeClasses,
} from "@/lib/specialized-domains";
import { updateMemberRolesAndDomain } from "../actions";

interface AssignRolesDomainSheetProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    email?: string;
    cbUserId?: string | null;
    role?: string | null;
    specializedDomain?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function AssignRolesDomainSheet({
  isOpen,
  onClose,
  member,
  onSuccess,
}: AssignRolesDomainSheetProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Member"]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [customDomainInput, setCustomDomainInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSystemAdmin = member ? isSystemAdminRole(member.role) : false;

  useEffect(() => {
    if (member) {
      const parsedRoles = parseMemberRoles(member.role);
      const clubRoles = parsedRoles.filter((r) => r !== "Admin");
      setSelectedRoles(
        clubRoles.length > 0
          ? clubRoles
          : isSystemAdminRole(member.role)
          ? []
          : ["Member"]
      );
      setSelectedDomains(parseSpecializedDomains(member.specializedDomain));
      setCustomDomainInput("");
    }
  }, [member]);

  if (!member) return null;

  const handleToggleRole = (role: AssignableRole) => {
    if (role === "Member") {
      setSelectedRoles(isSystemAdmin ? [] : ["Member"]);
      return;
    }

    const withoutMember = selectedRoles.filter((r) => r !== "Member" && r !== "Admin");

    if (withoutMember.includes(role)) {
      const next = withoutMember.filter((r) => r !== role);
      setSelectedRoles(next.length === 0 ? (isSystemAdmin ? [] : ["Member"]) : next);
    } else {
      if (withoutMember.length >= MAX_MEMBER_ROLES) {
        toast.error(
          `A member can have a maximum of ${MAX_MEMBER_ROLES} club roles.`
        );
        return;
      }
      setSelectedRoles([...withoutMember, role]);
    }
  };

  const handleRemoveRole = (role: string) => {
    if (role === "Member" || role === "Admin") return;
    const next = selectedRoles.filter((r) => r !== role && r !== "Admin");
    setSelectedRoles(next.length === 0 ? (isSystemAdmin ? [] : ["Member"]) : next);
  };

  const handleToggleDomain = (domain: string) => {
    const trimmed = domain.trim();
    if (!trimmed) return;

    if (selectedDomains.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedDomains(
        selectedDomains.filter((d) => d.toLowerCase() !== trimmed.toLowerCase())
      );
    } else {
      setSelectedDomains([...selectedDomains, trimmed]);
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setSelectedDomains(
      selectedDomains.filter((d) => d.toLowerCase() !== domain.toLowerCase())
    );
  };

  const handleAddCustomDomain = () => {
    const trimmed = customDomainInput.trim();
    if (!trimmed) return;

    if (selectedDomains.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already added.`);
      setCustomDomainInput("");
      return;
    }

    setSelectedDomains([...selectedDomains, trimmed]);
    setCustomDomainInput("");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const serializedDomain = serializeSpecializedDomains(selectedDomains);
      const res = await updateMemberRolesAndDomain(
        member.id,
        selectedRoles,
        serializedDomain
      );
      if (res.status === "success") {
        toast.success(res.message);
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("An error occurred while updating roles and domain.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRoleCount = selectedRoles.filter((r) => r !== "Member" && r !== "Admin").length;
  const isMaxRolesReached = currentRoleCount >= MAX_MEMBER_ROLES;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()} modal>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex h-dvh max-h-screen flex-col overflow-hidden"
      >
        {/* Sticky Header */}
        <div className="shrink-0 bg-background border-b px-6 py-4 space-y-1">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>Assign Roles & Specialized Domains</span>
            </SheetTitle>
            <SheetDescription className="text-xs">
              Configure assigned club roles (up to {MAX_MEMBER_ROLES}) and multiple technical domains for{" "}
              <strong className="text-foreground">{member.name}</strong>
              {member.cbUserId && ` (${member.cbUserId})`}.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Scrollable Content (Hidden Scrollbar + Lenis Prevent) */}
        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-6 no-scrollbar"
          onWheel={(event) => event.stopPropagation()}
          onTouchMoveCapture={(event) => event.stopPropagation()}
        >
          {/* SECTION 1: MEMBER ROLES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-primary" />
                1. Member Roles
              </Label>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                {isSystemAdmin
                  ? `${currentRoleCount} / ${MAX_MEMBER_ROLES} club roles (+ Admin)`
                  : currentRoleCount === 0
                  ? "1 (Member)"
                  : `${currentRoleCount} / ${MAX_MEMBER_ROLES} selected`}
              </span>
            </div>

            {isSystemAdmin && (
              <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldAlert className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>System Admin (Permanent)</span>
                </div>
                <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-md font-semibold">
                  Admin
                </span>
              </div>
            )}

            <div className="space-y-2.5">
              {/* Active Selected Roles Badges */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-muted/30 border min-h-[38px]">
                <span className="text-[11px] text-muted-foreground mr-1">Active:</span>
                {isSystemAdmin && (
                  <Badge
                    variant="outline"
                    className="text-xs gap-1 py-0.5 px-2 font-semibold bg-purple-600 text-white border-none"
                  >
                    <span>Admin</span>
                  </Badge>
                )}
                {selectedRoles.map((role) => {
                  if (role === "Admin") return null;
                  const { badgeClass } = getRoleBadgeClasses(role);
                  return (
                    <Badge
                      key={role}
                      variant="outline"
                      className={`text-xs gap-1 py-0.5 pl-2 pr-1.5 font-normal ${badgeClass}`}
                    >
                      <span>{role}</span>
                      {role !== "Member" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  );
                })}
              </div>

              {/* Role Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ASSIGNABLE_ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  const isMemberRole = role === "Member";
                  const isMemberActive =
                    !isSystemAdmin &&
                    isMemberRole &&
                    (selectedRoles.length === 0 || selectedRoles.includes("Member"));

                  const disabled =
                    !isSelected && !isMemberRole && isMaxRolesReached;

                  const { badgeClass } = getRoleBadgeClasses(role);

                  return (
                    <label
                      key={role}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-medium ${
                        isSelected || isMemberActive
                          ? "border-primary/50 bg-primary/5 shadow-2xs"
                          : disabled
                          ? "opacity-50 cursor-not-allowed border-border/40 bg-muted/20"
                          : "border-border/70 hover:border-border hover:bg-muted/40"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected || isMemberActive}
                        disabled={disabled || isSubmitting}
                        onCheckedChange={() =>
                          !disabled && handleToggleRole(role)
                        }
                        className="h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-normal py-0.5 px-2 truncate max-w-full block ${badgeClass}`}
                        >
                          {role}
                        </Badge>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* SECTION 2: SPECIALIZED DOMAINS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Target className="h-4 w-4 text-indigo-500" />
                2. Specialized Domains
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {selectedDomains.length} assigned
                </span>
                {selectedDomains.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDomains([])}
                    disabled={isSubmitting}
                    className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Assign one or more specialized technical domains. Click preset pills to toggle or add custom domains.
            </p>

            <div className="space-y-3">
              {/* Active Assigned Domains Badges */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-muted/30 border min-h-[38px]">
                <span className="text-[11px] text-muted-foreground mr-1">Active:</span>
                {selectedDomains.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">
                    None selected
                  </span>
                ) : (
                  selectedDomains.map((dom) => {
                    const { badgeClass } = getDomainBadgeClasses(dom);
                    return (
                      <Badge
                        key={dom}
                        variant="outline"
                        className={`text-xs gap-1 py-0.5 pl-2 pr-1.5 font-normal ${badgeClass}`}
                      >
                        <span>{dom}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(dom)}
                          className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })
                )}
              </div>

              {/* Add Custom Domain Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type a custom domain (e.g. AR/VR, Rust Developer)..."
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomDomain();
                    }
                  }}
                  disabled={isSubmitting}
                  className="text-xs h-9 flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddCustomDomain}
                  disabled={!customDomainInput.trim() || isSubmitting}
                  className="h-9 text-xs gap-1 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Predefined Domain Pills Grid */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-border/70 bg-muted/20">
                  {PREDEFINED_DOMAINS.map((d) => {
                    const isSelected = selectedDomains.some(
                      (dom) => dom.toLowerCase() === d.toLowerCase()
                    );
                    const { badgeClass } = getDomainBadgeClasses(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleToggleDomain(d)}
                        disabled={isSubmitting}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : `${badgeClass} opacity-75 hover:opacity-100 hover:scale-[1.02]`
                        }`}
                      >
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3 w-3 opacity-60" />
                        )}
                        <span>{d}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="shrink-0 border-t bg-background px-6 py-4 flex items-center justify-end gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            className="min-w-36 gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save Roles & Domains</span>
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AssignRolesDomainSheet;
