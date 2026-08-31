import { redirect } from "next/navigation";
import { SettingsShell } from "./_components/settings-shell";
import { getCurrentUserProfile, getRegistrationSetting, getGitHubOrgSetting, getGoogleDriveStatusAction } from "./actions";

export default async function AdminSettingsPage() {
  const profileResult = await getCurrentUserProfile();
  const registrationSettingResult = await getRegistrationSetting();
  const githubOrgResult = await getGitHubOrgSetting();
  const googleDriveResult = await getGoogleDriveStatusAction();

  if (profileResult.status === "error") {
    redirect("/login");
  }

  const userProfile = profileResult.data;
  const isRegistrationEnabled =
    registrationSettingResult.status === "success"
      ? registrationSettingResult.data
      : true;
  const githubOrgName =
    githubOrgResult.status === "success" ? githubOrgResult.data : "";
  const googleDriveStatus =
    googleDriveResult.status === "success" && googleDriveResult.data
      ? googleDriveResult.data
      : { isConnected: false };

  return (
    <SettingsShell
      userProfile={userProfile}
      isRegistrationEnabled={isRegistrationEnabled}
      githubOrgName={githubOrgName}
      googleDriveStatus={googleDriveStatus}
    />
  );
}