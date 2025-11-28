import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function QuizRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect('/login');
  }

  // No layout wrapper - completely independent
  return <>{children}</>;
}
