import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Navbar from "@/components/homepage/Navbar";
import HeroSection from "@/components/homepage/HeroSection";
import AboutPage from "@/components/homepage/AboutPage";
import FooterSection from "@/components/homepage/Footer";
import MaskEffect from "@/components/homepage/MaskCursor/Mask";
import Gallary from "@/components/homepage/ZoomParallx/GallaryParallax";

export default async function Home() {
  // Check if user is already authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Transform user data to match Navbar props
  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role || "user",
  } : null;

  // Show homepage for both authenticated and unauthenticated users
  return (
    <>
      <Navbar user={user} />
      <HeroSection />
      <MaskEffect />
      <Gallary />
      <AboutPage />
      <FooterSection />
    </>
  );
}
