"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle,
  BookOpen,
  Home,
  IdCard,
} from "lucide-react";

interface MemberDetailsProps {
  member: {
    id: string;
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
    address: string | null;
    postOffice: string | null;
    policeStation: string | null;
    block: string | null;
    pinCode: string | null;
    aadhaarNumber: string | null;
    banned: boolean | null;
    banReason: string | null;
  };
}

export default function MemberDetails({ member }: MemberDetailsProps) {
  const InfoItem = ({ 
    icon: Icon, 
    label, 
    value 
  }: { 
    icon: any; 
    label: string; 
    value: string | null | undefined;
  }) => (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium wrap-break-word">
          {value || <span className="text-muted-foreground italic">Not provided</span>}
        </p>
      </div>
    </div>
  );

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get profile image URL
  const getImageUrl = (imageKey: string) => {
    // Use the correct S3 URL format - registration.t3.storage.dev
    return `https://registration.t3.storage.dev/${imageKey}`;
  };

  const profileImageUrl = member.profileImageKey 
    ? getImageUrl(member.profileImageKey)
    : null;

  return (
    <div className="space-y-6">
      {/* Profile Image Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              {profileImageUrl ? (
                <AvatarImage src={profileImageUrl} alt={member.name} />
              ) : null}
              <AvatarFallback className="text-3xl font-bold bg-linear-to-br from-blue-500 to-purple-500 text-white">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold">{member.name}</h2>
              {member.username && (
                <p className="text-sm text-muted-foreground">@{member.username}</p>
              )}
              {member.registration && (
                <Badge variant="outline" className="mt-2">
                  {member.registration}
                </Badge>
              )}
            </div>
          </div>

          {member.banned && member.banReason && (
            <div className="mt-4 flex items-start gap-3 p-3 rounded-lg border border-destructive bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-sm font-medium text-destructive">Ban Reason</p>
                <p className="text-sm">{member.banReason}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Basic details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem icon={User} label="First Name" value={member.firstName} />
            <InfoItem icon={User} label="Middle Name" value={member.middleName} />
            <InfoItem icon={User} label="Last Name" value={member.lastName} />
            <InfoItem icon={Mail} label="Email Address" value={member.email} />
            <InfoItem icon={Phone} label="Mobile Number" value={member.mobileNumber} />
            <InfoItem icon={Phone} label="WhatsApp Number" value={member.whatsappNumber} />
          </div>
          <Separator />
          <InfoItem icon={IdCard} label="Aadhaar Number" value={member.aadhaarNumber} />
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Academic Information
          </CardTitle>
          <CardDescription>Educational and registration details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem icon={Hash} label="Registration Number" value={member.registration} />
            <InfoItem icon={Hash} label="Roll Number" value={member.rollNumber} />
            <InfoItem icon={School} label="Branch/Department" value={member.branch} />
            <InfoItem icon={School} label="Admission Year" value={member.admissionYear} />
          </div>
          <Separator />
          <div className="space-y-4">
            <InfoItem icon={School} label="College Name" value={member.collegeName} />
            <InfoItem icon={MapPin} label="College Address" value={member.collegeAddress} />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Address Information
          </CardTitle>
          <CardDescription>Residential address and location details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem icon={MapPin} label="Full Address" value={member.address} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem icon={MapPin} label="Post Office" value={member.postOffice} />
            <InfoItem icon={MapPin} label="Police Station" value={member.policeStation} />
            <InfoItem icon={MapPin} label="Block" value={member.block} />
            <InfoItem icon={Hash} label="PIN Code" value={member.pinCode} />
            <InfoItem icon={MapPin} label="State" value={member.state} />
            <InfoItem icon={MapPin} label="District" value={member.district} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
