import { auth } from "@/lib/auth";
import { LoginForm } from "./_components/LoginForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to CodeBreakers portal - Government College of Engineering Kalahandi",
};

export default async function LoginPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(session) {
        // If user is admin, redirect to admin dashboard
        if (session.user.role === "admin") {
            return redirect("/admin");
        }

        // Check if user has completed their profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                mobileNumber: true,
                aadhaarNumber: true,
                state: true,
                district: true,
            },
        });

        // Check if profile is complete (has essential fields)
        const isProfileComplete = !!(
            user?.name &&
            user?.email &&
            user?.mobileNumber &&
            user?.aadhaarNumber &&
            user?.state &&
            user?.district
        );

        // If profile is not complete, redirect to onboarding
        if (!isProfileComplete) {
            return redirect("/onboarding");
        }

        // Otherwise, redirect to user dashboard
        return redirect("/dashboard");
    }
    return (
        <LoginForm />
    )
}