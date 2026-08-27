import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isSystemAdminRole } from "@/lib/member-roles";

export async function getRedirectPath() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return "/login";
    }

    // If user is admin, redirect to admin dashboard
    if (isSystemAdminRole(session.user.role)) {
        return "/admin";
    }

    // Otherwise, redirect to user dashboard
    return "/dashboard";
}