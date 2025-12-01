import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Navbar from "@/components/homepage/Navbar";
import FooterSection from "@/components/homepage/Footer";

export default async function HomepageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is already authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Transform user data to match Navbar props
  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role || "user",
      }
    : null;

  return (
    <>
      <Navbar user={user} />
      <main>{children}</main>
      <FooterSection />
    </>
  );
}
