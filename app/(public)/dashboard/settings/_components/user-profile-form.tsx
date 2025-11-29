"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Save, User, Mail, Phone, MessageCircle, IdCard, MapPin, Building, BookOpen } from "lucide-react";
import { updateUserProfileData, type UserProfileData } from "../actions";
import statesDistrictsData from "@/lib/new/states-districts.json";

interface UserProfileFormProps {
  initialData: {
    name: string;
    email: string;
    mobileNumber?: string | null;
    whatsappNumber?: string | null;
    aadhaarNumber?: string | null;
    state?: string | null;
    district?: string | null;
    collegeName?: string | null;
    collegeAddress?: string | null;
    username?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    registration?: string | null;
    rollNumber?: string | null;
    branch?: string | null;
    address?: string | null;
    admissionYear?: string | null;
    postOffice?: string | null;
    policeStation?: string | null;
    block?: string | null;
    pinCode?: string | null;
  };
}

export function UserProfileForm({ initialData }: UserProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    mobileNumber: initialData.mobileNumber || "",
    whatsappNumber: initialData.whatsappNumber || "",
    aadhaarNumber: initialData.aadhaarNumber || "",
    state: initialData.state || "",
    district: initialData.district || "",
    collegeName: initialData.collegeName || "",
    collegeAddress: initialData.collegeAddress || "",
    username: initialData.username || "",
    firstName: initialData.firstName || "",
    middleName: initialData.middleName || "",
    lastName: initialData.lastName || "",
    registration: initialData.registration || "",
    rollNumber: initialData.rollNumber || "",
    admissionYear: initialData.admissionYear || "",
    branch: initialData.branch || "",
    address: initialData.address || "",
    postOffice: initialData.postOffice || "",
    policeStation: initialData.policeStation || "",
    block: initialData.block || "",
    pinCode: initialData.pinCode || "",
  });

  const [selectedState, setSelectedState] = useState(initialData.state || "");
  const [pending, startTransition] = useTransition();

  const availableDistricts = useMemo(() => {
    if (!selectedState) return [];
    const stateData = statesDistrictsData.states.find(
      (s) => s.state === selectedState
    );
    return stateData?.districts || [];
  }, [selectedState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const result = await updateUserProfileData(formData as any);
        
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

  const handleInputChange = (field: string, value: string) => {
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
      district: "", // Reset district when state changes
    }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-sm">
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Enter your username"
                disabled={pending}
                className="h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="First name"
                  required
                  disabled={pending}
                  className="h-10 text-sm"
                />
              </div>

              {/* Middle Name */}
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-sm">Middle Name</Label>
                <Input
                  id="middleName"
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  placeholder="Middle name"
                  disabled={pending}
                  className="h-10 text-sm"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Last name"
                  required
                  disabled={pending}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
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
                  className="h-10 text-sm"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="flex items-center gap-2 text-sm">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  Mobile Number *
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                  placeholder="+91 9876543210"
                  required
                  disabled={pending}
                  className="h-10 text-sm"
                />
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="flex items-center gap-2 text-sm">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                  placeholder="+91 9876543210"
                  disabled={pending}
                  className="h-10 text-sm"
                />
              </div>

              {/* Aadhaar Number */}
              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber" className="flex items-center gap-2 text-sm">
                  <IdCard className="w-3 h-3 sm:w-4 sm:h-4" />
                  Aadhaar Number *
                </Label>
                <Input
                  id="aadhaarNumber"
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange("aadhaarNumber", e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="123456789012"
                  required
                  disabled={pending}
                  maxLength={12}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              Academic Information
            </CardTitle>
            <CardDescription className="text-sm">
              Your educational and academic details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Registration Number */}
              <div className="space-y-2">
                <Label htmlFor="registration" className="text-sm">Registration No</Label>
                <Input
                  id="registration"
                  type="text"
                  value={formData.registration}
                  onChange={(e) => handleInputChange("registration", e.target.value)}
                  placeholder="Registration number"
                  disabled={pending}
                  className="h-10 text-sm"
                />
              </div>

              {/* Roll Number */}
              <div className="space-y-2">
                <Label htmlFor="rollNumber" className="text-sm">Roll No</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                  placeholder="Roll number"
                  disabled={pending}
                  className="h-10 text-sm"
                />
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label htmlFor="branch" className="text-sm">Branch</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => handleInputChange("branch", value)}
                  disabled={pending}
                >
                  <SelectTrigger className="h-10 text-sm">
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
            </div>

            <Separator className="my-4" />

            {/* College Information */}
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName" className="flex items-center gap-2 text-sm">
                  <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                  College Name *
                </Label>
                <Input
                  id="collegeName"
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => handleInputChange("collegeName", e.target.value)}
                  placeholder="Enter your college name"
                  required
                  disabled={pending}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collegeAddress" className="flex items-center gap-2 text-sm">
                  <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                  College Address *
                </Label>
                <Textarea
                  id="collegeAddress"
                  value={formData.collegeAddress}
                  onChange={(e) => handleInputChange("collegeAddress", e.target.value)}
                  placeholder="Enter your college address"
                  required
                  disabled={pending}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              Address Information
            </CardTitle>
            <CardDescription className="text-sm">
              Your residential address details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {/* Full Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street address"
                  disabled={pending}
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Post Office */}
                <div className="space-y-2">
                  <Label htmlFor="postOffice" className="text-sm">Post Office</Label>
                  <Input
                    id="postOffice"
                    type="text"
                    value={formData.postOffice}
                    onChange={(e) => handleInputChange("postOffice", e.target.value)}
                    placeholder="Post office"
                    disabled={pending}
                    className="h-10 text-sm"
                  />
                </div>

                {/* Police Station */}
                <div className="space-y-2">
                  <Label htmlFor="policeStation" className="text-sm">Police Station</Label>
                  <Input
                    id="policeStation"
                    type="text"
                    value={formData.policeStation}
                    onChange={(e) => handleInputChange("policeStation", e.target.value)}
                    placeholder="Police station"
                    disabled={pending}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Block */}
                <div className="space-y-2">
                  <Label htmlFor="block" className="text-sm">Block</Label>
                  <Input
                    id="block"
                    type="text"
                    value={formData.block}
                    onChange={(e) => handleInputChange("block", e.target.value)}
                    placeholder="Block"
                    disabled={pending}
                    className="h-10 text-sm"
                  />
                </div>

                {/* PIN Code */}
                <div className="space-y-2">
                  <Label htmlFor="pinCode" className="text-sm">PIN Code</Label>
                  <Input
                    id="pinCode"
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => handleInputChange("pinCode", e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="PIN code"
                    disabled={pending}
                    maxLength={6}
                    className="h-10 text-sm"
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm">State *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={handleStateChange}
                    disabled={pending}
                  >
                    <SelectTrigger className="h-10 text-sm">
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

                {/* District */}
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm">District *</Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => handleInputChange("district", value)}
                    disabled={!selectedState || pending}
                  >
                    <SelectTrigger className="h-10 text-sm">
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
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={pending} 
            className="w-full sm:w-auto min-w-40 h-10 text-sm cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-2" />
                Updating Profile...
              </>
            ) : (
              <>
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Update Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}