import { redirect } from "next/navigation";
import { SettingsShell } from "./_components/settings-shell";
import { getCurrentUserProfile, getRegistrationSetting, getGitHubOrgSetting } from "./actions";

export default async function AdminSettingsPage() {
  const profileResult = await getCurrentUserProfile();
  const registrationSettingResult = await getRegistrationSetting();
  const githubOrgResult = await getGitHubOrgSetting();

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

  return (
    <SettingsShell
      userProfile={userProfile}
      isRegistrationEnabled={isRegistrationEnabled}
      githubOrgName={githubOrgName}
    />
  );
}