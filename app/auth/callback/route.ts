import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return redirect("/login");
    }

    // Auto-save GitHub username if user logged in with GitHub
    try {
        const githubAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                providerId: "github",
            },
            select: {
                accessToken: true,
                accountId: true,
            },
        });

        if (githubAccount?.accessToken) {
            // Check if GitHub username is not already saved
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { githubUsername: true },
            });

            if (!user?.githubUsername) {
                // Fetch GitHub username using access token
                const githubResponse = await fetch("https://api.github.com/user", {
                    headers: {
                        Authorization: `Bearer ${githubAccount.accessToken}`,
                        Accept: "application/json",
                    },
                });

                if (githubResponse.ok) {
                    const githubUser = await githubResponse.json();
                    
                    if (githubUser.login) {
                        await prisma.user.update({
                            where: { id: session.user.id },
                            data: {
                                githubUsername: githubUser.login,
                                updatedAt: new Date(),
                            },
                        });
                        
                        console.log(`✅ Auto-saved GitHub username: @${githubUser.login}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error auto-saving GitHub username:", error);
        // Don't fail the redirect if this fails
    }

    // If user is admin, redirect to admin dashboard
    if (session.user.role === "admin") {
        return redirect("/admin");
    }

    // Check if user has completed their profile
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            profileComplete: true,
        },
    });

    // If profile is not complete, redirect to onboarding
    if (!user || !user.profileComplete) {
        return redirect("/onboarding");
    }

    // Otherwise, redirect to user dashboard
    return redirect("/dashboard");
}