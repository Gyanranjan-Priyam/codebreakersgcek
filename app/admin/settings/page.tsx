import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Shield, Bell, UserCheck } from "lucide-react";
import { ProfileForm } from "./_components/profile-form";
import { ProfileImageUpload } from "./_components/profile-image-upload";
import { RegistrationToggle } from "./_components/registration-toggle";
import { DataCleanup } from "./_components/data-cleanup";
import { GitHubOrgSettings } from "./_components/github-org-settings";
import { LinkedAccountsSection } from "./_components/linked-accounts-section";
import { getCurrentUserProfile, getRegistrationSetting, getGitHubOrgSetting } from "./actions";

export default async function AdminSettingsPage() {
  const profileResult = await getCurrentUserProfile();
  const registrationSettingResult = await getRegistrationSetting();
  const githubOrgResult = await getGitHubOrgSetting();

  if (profileResult.status === "error") {
    redirect("/login");
  }

  const userProfile = profileResult.data;
  const isRegistrationEnabled = registrationSettingResult.status === "success" 
    ? registrationSettingResult.data 
    : true; // Default to enabled if error
  const githubOrgName = githubOrgResult.status === "success"
    ? githubOrgResult.data
    : "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8" />
            Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Separator />

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Image Section */}
        <div className="lg:col-span-1">
          <ProfileImageUpload 
            currentImageKey={userProfile.profileImageKey}
            userName={userProfile.name}
          />
        </div>

        {/* Profile Information Section */}
        <div className="lg:col-span-2">
          <ProfileForm initialData={userProfile} />
        </div>
      </div>

      {/* GitHub Linked Accounts */}
      <LinkedAccountsSection githubUsername={userProfile.githubUsername} />

      {/* Additional Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RegistrationToggle initialValue={isRegistrationEnabled} />
            <Separator />
            <GitHubOrgSettings initialValue={githubOrgName} />
            <div className="pt-4">
              <DataCleanup />
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.email} {/* Add verification status here if available */}
                </p>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Verified ✓
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Role</p>
                <p className="text-sm text-muted-foreground">
                  Your current access level
                </p>
              </div>
              <div className="text-sm font-medium capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {userProfile.role || 'User'}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Created</p>
                <p className="text-sm text-muted-foreground">
                  Member since
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(userProfile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
                {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Enabled ✓
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">WhatsApp Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.whatsappNumber ? 
                    `Notifications to ${userProfile.whatsappNumber}` : 
                    'Add WhatsApp number to enable'
                  }
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {userProfile.whatsappNumber ? 'Available' : 'Not Set'}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.mobileNumber ? 
                    `SMS to ${userProfile.mobileNumber}` : 
                    'Add mobile number to enable'
                  }
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {userProfile.mobileNumber ? 'Available' : 'Not Set'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Information */}
      {userProfile.upiId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Your configured payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">UPI ID</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.upiId}
                </p>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Configured ✓
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}