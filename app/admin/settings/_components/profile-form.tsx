"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Save, User, Mail, Phone, MessageCircle, CreditCard, GraduationCap, MapPin } from "lucide-react";
import { updateUserProfile, type ProfileUpdateData } from "../actions";
import statesDistrictsData from "@/lib/new/states-districts.json";

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    mobileNumber?: string | null;
    whatsappNumber?: string | null;
    upiId?: string | null;
    username?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    aadhaarNumber?: string | null;
    registration?: string | null;
    rollNumber?: string | null;
    branch?: string | null;
    admissionYear?: string | null;
    collegeName?: string | null;
    collegeAddress?: string | null;
    address?: string | null;
    postOffice?: string | null;
    policeStation?: string | null;
    block?: string | null;
    pinCode?: string | null;
    state?: string | null;
    district?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: initialData.name || "",
    email: initialData.email || "",
    mobileNumber: initialData.mobileNumber || "",
    whatsappNumber: initialData.whatsappNumber || "",
    upiId: initialData.upiId || "",
    username: initialData.username || "",
    firstName: initialData.firstName || "",
    middleName: initialData.middleName || "",
    lastName: initialData.lastName || "",
    aadhaarNumber: initialData.aadhaarNumber || "",
    registration: initialData.registration || "",
    rollNumber: initialData.rollNumber || "",
    branch: initialData.branch || "",
    admissionYear: initialData.admissionYear || "",
    collegeName: initialData.collegeName || "",
    collegeAddress: initialData.collegeAddress || "",
    address: initialData.address || "",
    postOffice: initialData.postOffice || "",
    policeStation: initialData.policeStation || "",
    block: initialData.block || "",
    pinCode: initialData.pinCode || "",
    state: initialData.state || "",
    district: initialData.district || "",
  });

  const [selectedState, setSelectedState] = useState(initialData.state || "");
  const [selectedCollege, setSelectedCollege] = useState(
    initialData.collegeName === "GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA"
      ? initialData.collegeName
      : initialData.collegeName
      ? "Other"
      : ""
  );

  const [pending, startTransition] = useTransition();

  const availableDistricts = useMemo(() => {
    if (!selectedState) return [];
    const stateData = statesDistrictsData.states.find(
      (s) => s.state === selectedState
    );
    return stateData?.districts || [];
  }, [selectedState]);

  // Generate admission years from 2023 to current year + 1
  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: currentYear - 2022 + 2 }, (_, i) => 2023 + i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const result = await updateUserProfile(formData);
        
        if (result.status === "success") {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setFormData(prev => ({
      ...prev,
      state: value,
      district: "",
    }));
  };

  const handleCollegeChange = (value: string) => {
    setSelectedCollege(value);
    
    if (value === "GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA") {
      setFormData(prev => ({
        ...prev,
        collegeName: value,
        collegeAddress: "AT-KANDHABANDO PALA, PO- RISIGAON, BHWANIPATNA, KALAHANDI, ODISHA, 766003",
      }));
    } else if (value === "Other") {
      setFormData(prev => ({
        ...prev,
        collegeName: "",
        collegeAddress: "",
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            <Separator />

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Enter your username"
                disabled={pending}
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="First name"
                  disabled={pending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  placeholder="Middle name"
                  disabled={pending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Last name"
                  disabled={pending}
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={pending}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Mobile Number
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  placeholder="+91 9876543210"
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                  placeholder="+91 9876543210"
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                <Input
                  id="aadhaarNumber"
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange("aadhaarNumber", e.target.value)}
                  placeholder="Enter Aadhaar number"
                  disabled={pending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upiId" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                UPI ID
              </Label>
              <Input
                id="upiId"
                type="text"
                value={formData.upiId}
                onChange={(e) => handleInputChange("upiId", e.target.value)}
                placeholder="yourname@paytm, yourname@ybl"
                disabled={pending}
              />
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Academic Information</h3>
            </div>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admissionYear">Admission Year</Label>
                <Select
                  value={formData.admissionYear}
                  onValueChange={(value) => handleInputChange("admissionYear", value)}
                  disabled={pending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {admissionYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration">Registration No</Label>
                <Input
                  id="registration"
                  type="text"
                  value={formData.registration}
                  onChange={(e) => handleInputChange("registration", e.target.value)}
                  placeholder="Registration number"
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll No</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                  placeholder="Roll number"
                  disabled={pending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => handleInputChange("branch", value)}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="EE">EE</SelectItem>
                  <SelectItem value="ME">ME</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collegeName">College Name</Label>
              <Select
                value={selectedCollege}
                onValueChange={handleCollegeChange}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA">
                    GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA
                  </SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {selectedCollege === "Other" && (
                <Input
                  placeholder="Enter college name"
                  value={formData.collegeName}
                  onChange={(e) => handleInputChange("collegeName", e.target.value)}
                  disabled={pending}
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="collegeAddress">College Address</Label>
              <Input
                id="collegeAddress"
                type="text"
                value={formData.collegeAddress}
                onChange={(e) => handleInputChange("collegeAddress", e.target.value)}
                placeholder="College address"
                disabled={pending || selectedCollege === "GOVERNMENT COLLEGE OF ENGINEERING KALAHANDI, BHAWANIPATNA"}
              />
            </div>
          </div>

          {/* Address Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Address Information</h3>
            </div>
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your address"
                disabled={pending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postOffice">Post Office</Label>
                <Input
                  id="postOffice"
                  type="text"
                  value={formData.postOffice}
                  onChange={(e) => handleInputChange("postOffice", e.target.value)}
                  placeholder="Post office"
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policeStation">Police Station</Label>
                <Input
                  id="policeStation"
                  type="text"
                  value={formData.policeStation}
                  onChange={(e) => handleInputChange("policeStation", e.target.value)}
                  placeholder="Police station"
                  disabled={pending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block">Block</Label>
                <Input
                  id="block"
                  type="text"
                  value={formData.block}
                  onChange={(e) => handleInputChange("block", e.target.value)}
                  placeholder="Block"
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinCode">Pin Code</Label>
                <Input
                  id="pinCode"
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => handleInputChange("pinCode", e.target.value)}
                  placeholder="Pin code"
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={handleStateChange}
                  disabled={pending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {statesDistrictsData.states.map((stateItem) => (
                      <SelectItem key={stateItem.state} value={stateItem.state}>
                        {stateItem.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Select
                value={formData.district}
                onValueChange={(value) => handleInputChange("district", value)}
                disabled={!selectedState || pending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={pending} className="min-w-[120px]">
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}