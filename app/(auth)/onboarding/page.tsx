import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import OnboardingForm from "./_components/OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has already completed their profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      profileComplete: true,
    },
  });

  // If profile is complete, redirect to appropriate dashboard
  if (user?.profileComplete) {
    if (session.user.role === "admin") {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen ">
      <OnboardingForm 
        userEmail={session.user.email} 
        userName={session.user.name || ""}
      />
    </div>
  );
}
