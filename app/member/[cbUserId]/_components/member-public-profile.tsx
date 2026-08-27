/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/static-components */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  School,
  Hash,
  User,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { parseMemberRoles, getRoleBadgeClasses } from "@/lib/member-roles";
import { parseSpecializedDomains, getDomainBadgeClasses } from "@/lib/specialized-domains";
import GitHubContributionCalendar from "@/components/member/github-contribution-calendar";
import MemberSocialLinksCard, {
  SocialLinksData,
  CustomLinkItem,
} from "@/components/member/member-social-links-card";

interface MemberPublicProfileProps {
  member: {
    id: string;
    cbUserId: string | null;
    name: string;
    email: string;
    username: string | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    profileImageKey: string | null;
    registration: string | null;
    rollNumber: string | null;
    branch: string | null;
    admissionYear: string | null;
    mobileNumber: string | null;
    whatsappNumber: string | null;
    collegeName: string | null;
    collegeAddress: string | null;
    state: string | null;
    district: string | null;
    address?: string | null;
    postOffice?: string | null;
    policeStation?: string | null;
    block?: string | null;
    pinCode?: string | null;
    aadhaarNumber?: string | null;
    githubUsername?: string | null;
    specializedDomain?: string | null;
    socialLinks?: any;
    customLinks?: any;
    profileComplete?: boolean;
    batch?: {
      id: string;
      name: string;
      code: string;
    } | null;
    createdAt: Date;
    role?: string | null;
    banned: boolean | null;
  };
}

export default function MemberPublicProfile({ member }: MemberPublicProfileProps) {
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get profile image URL
  const getImageUrl = (imageKey: string) => {
    return `https://codebreakers.t3.storage.dev/${imageKey}`;
  };

  const profileImageUrl = member.profileImageKey
    ? getImageUrl(member.profileImageKey)
    : null;

  const domains = parseSpecializedDomains(member.specializedDomain);

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | null | undefined;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm font-medium break-words">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="CodeBreakers" className="h-8 w-8" />
            <span className="font-semibold text-sm">CodeBreakers GCEK</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Header Card */}
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                {profileImageUrl ? (
                  <AvatarImage src={profileImageUrl} alt={member.name} />
                ) : null}
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center space-y-2.5 max-w-md">
                <h1 className="text-2xl font-bold tracking-tight">{member.name}</h1>
                {member.username && (
                  <p className="text-sm text-muted-foreground font-mono">@{member.username}</p>
                )}

                {/* Top-to-bottom: 1. ID, 2. Role, 3. Role (if any) */}
                <div className="flex flex-col items-center justify-center gap-1.5 pt-1.5">
                  {member.cbUserId && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {member.cbUserId}
                    </Badge>
                  )}

                  {/* Member Roles */}
                  {parseMemberRoles(member.role).map((role, idx) => {
                    const { badgeClass } = getRoleBadgeClasses(role);
                    return (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={`text-xs font-normal ${badgeClass}`}
                      >
                        {role}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={Mail} label="Email" value={member.email} />
              <InfoItem icon={Phone} label="Mobile" value={member.mobileNumber} />
              <InfoItem icon={Phone} label="WhatsApp" value={member.whatsappNumber} />
            </div>
          </CardContent>
        </Card>

        {/* Social Media & Custom Links Card (Placed Below Contact Info) */}
        {/* Note: If no links are given by user, this card is completely NOT visible */}
        <MemberSocialLinksCard
          socialLinks={member.socialLinks as SocialLinksData}
          customLinks={member.customLinks as CustomLinkItem[]}
          githubUsername={member.githubUsername}
          memberName={member.name}
          username={member.username}
        />

        {/* GitHub Live Contribution Activity Graph */}
        {member.githubUsername && (
          <GitHubContributionCalendar
            username={member.githubUsername}
          />
        )}

        {/* Academic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={Hash} label="Registration No." value={member.registration} />
              <InfoItem icon={Hash} label="Roll Number" value={member.rollNumber} />
              <InfoItem icon={School} label="Branch" value={member.branch} />
              <InfoItem icon={Calendar} label="Admission Year" value={member.admissionYear} />
              {member.batch && (
                <InfoItem
                  icon={Layers}
                  label="Assigned Batch"
                  value={`${member.batch.name} (${member.batch.code})`}
                />
              )}
              {domains.length > 0 && (
                <InfoItem
                  icon={Target}
                  label={domains.length > 1 ? "Specialized Domains" : "Specialized Domain"}
                  value={domains.join(", ")}
                />
              )}
            </div>
            {(member.collegeName || member.collegeAddress) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <InfoItem icon={School} label="College" value={member.collegeName} />
                  <InfoItem icon={MapPin} label="College Address" value={member.collegeAddress} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        {(member.state || member.district) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem icon={MapPin} label="State" value={member.state} />
                <InfoItem icon={MapPin} label="District" value={member.district} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Member since {format(new Date(member.createdAt), "MMMM yyyy")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            CodeBreakers — Government College of Engineering Kalahandi
          </p>
        </div>
      </div>
    </div>
  );
}
