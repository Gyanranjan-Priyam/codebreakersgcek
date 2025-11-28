import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserProfileForm } from "./_components/user-profile-form";
import { UserProfileImageUpload } from "./_components/user-profile-image-upload";
import { LinkedAccountsSection } from "./_components/linked-accounts-section";
import { getCurrentUserProfileData } from "./actions";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { User, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | Dashboard",
  description: "Manage your profile settings and preferences",
};

export default async function SettingsPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user profile data
  const profileResult = await getCurrentUserProfileData();

  if (profileResult.status === "error") {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{profileResult.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const userData = profileResult.data;

  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-6 sm:space-y-8 px-4 sm:px-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Settings
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your profile information and account settings. Updates will be
          reflected across all your event registrations.
        </p>
      </div>

      <Separator />

      <div className="flex items-center justify-center lg:gap-6">
        {/* Profile Information Section */}
        <div className="lg:col-span-2 lg:order-2 items-center lg:justify-center w-full">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Profile Information
                {(userData.aadhaarNumber ||
                  userData.state ||
                  userData.district ||
                  userData.collegeName) && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Auto-synced
                  </span>
                )}
                {userData.githubUsername && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {userData.aadhaarNumber ||
                userData.state ||
                userData.district ||
                userData.collegeName
                  ? "Your profile has been automatically updated from your latest event registration. You can modify these details below if needed."
                  : "Update your personal information. These changes will be synced across all your event registrations and team memberships."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <UserProfileImageUpload
                currentImageKey={userData.profileImageKey}
                userName={userData.name || "User"}
              />
              <UserProfileForm
                initialData={{
                  name: userData.name || "",
                  email: userData.email || "",
                  mobileNumber: userData.mobileNumber || "",
                  whatsappNumber: userData.whatsappNumber || "",
                  aadhaarNumber: userData.aadhaarNumber || "",
                  state: userData.state || "",
                  district: userData.district || "",
                  collegeName: userData.collegeName || "",
                  collegeAddress: userData.collegeAddress || "",
                  username: userData.username || "",
                  firstName: userData.firstName || "",
                  middleName: userData.middleName || "",
                  lastName: userData.lastName || "",
                  registration: userData.registration || "",
                  rollNumber: userData.rollNumber || "",
                  branch: userData.branch || "",
                  admissionYear: userData.admissionYear || "",
                  address: userData.address || "",
                  postOffice: userData.postOffice || "",
                  policeStation: userData.policeStation || "",
                  block: userData.block || "",
                  pinCode: userData.pinCode || "",
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Account Information
          </CardTitle>
          <CardDescription className="text-sm">
            Read-only information about your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Account Created
              </label>
              <p className="text-sm">
                {userData.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not available"}
              </p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <p className="text-sm">
                {userData.updatedAt
                  ? new Date(userData.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Accounts */}
      <LinkedAccountsSection githubUsername={userData.githubUsername} />

      {/* Important Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary text-base sm:text-lg">
            Important Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
              <span>
                Your profile is automatically updated when you register for new
                events - no manual updates needed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <span>
                Profile updates will automatically sync across all your event
                registrations
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <span>
                Changes to your email address will update your login credentials
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <span>
                Team memberships and join requests will be updated with your new
                information
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
              <span>
                Profile images are stored securely and are only visible to event
                organizers
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
