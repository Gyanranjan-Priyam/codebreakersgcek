"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import TerminalLoader from "@/app/(homepage)/_components/terminal-loader/page";
import { authClient } from "@/lib/auth-client";

// Preload components but render them only after loading
const Navbar = dynamic(() => import("@/components/homepage/Navbar"));
const HeroSection = dynamic(() => import("@/components/homepage/HeroSection"));
const AboutPage = dynamic(() => import("@/components/homepage/AboutPage"));
const FooterSection = dynamic(() => import("@/components/homepage/Footer"));
const MaskEffect = dynamic(() => import("@/components/homepage/MaskCursor/Mask"));
const Gallary = dynamic(() => import("@/components/homepage/ZoomParallx/GallaryParallax"));
const HomepageDock = dynamic(() => import("@/components/homepage/HomepageDock").then(mod => ({ default: mod.HomepageDock })));
const HomepageDockMobile = dynamic(() => import("@/components/homepage/HomepageDock").then(mod => ({ default: mod.HomepageDockMobile })));

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.codebreakersgcek.tech/#organization",
      "name": "CodeBreakers",
      "url": "https://www.codebreakersgcek.tech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.codebreakersgcek.tech/assets/logo.png",
        "width": 512,
        "height": 512
      },
      "description": "Premier coding club at Government College of Engineering Kalahandi",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bhawanipatna",
        "addressRegion": "Odisha",
        "addressCountry": "India"
      },
      "sameAs": [
        "https://www.instagram.com/codebreakers_gcek",
        "https://www.linkedin.com/company/codebreakers-gcek",
        "https://twitter.com/codebreakers_gcek",
        "https://github.com/codebreakers-gcek"
      ],
      "memberOf": {
        "@type": "EducationalOrganization",
        "name": "Government College of Engineering Kalahandi"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.codebreakersgcek.tech/#website",
      "url": "https://www.codebreakersgcek.tech",
      "name": "CodeBreakers GCEK",
      "description": "Join CodeBreakers, the premier coding club at Government College of Engineering Kalahandi",
      "publisher": {
        "@id": "https://www.codebreakersgcek.tech/#organization"
      }
    },
    {
      "@type": "EducationalOrganization",
      "name": "CodeBreakers Coding Club",
      "alternateName": ["CodeBreakers GCEK", "Codebreakers GCE Kalahandi", "Coding Club of GCE Kalahandi", "GCEK Coding Club", "Kalahandi Engineering College Coding Club"],
      "url": "https://www.codebreakersgcek.tech",
      "logo": "https://www.codebreakersgcek.tech/assets/logo.png",
      "description": "CodeBreakers is a student-led coding club at Government College of Engineering Kalahandi (GCE Kalahandi), dedicated to fostering programming skills, innovation, and collaboration among 500+ students. We organize hackathons, coding competitions, workshops, and tech events.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Government College of Engineering Kalahandi",
        "addressLocality": "Bhawanipatna",
        "addressRegion": "Kalahandi, Odisha",
        "postalCode": "766002",
        "addressCountry": "IN"
      },
      "numberOfStudents": "500+",
      "keywords": "codebreakers, codebreakers gcek, gce kalahandi, coding club of gce kalahandi, kalahandi engineering college, gcek coding club, programming club odisha, tech events kalahandi"
    }
  ]
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(() => {
    // Check if user has already visited in this session
    if (typeof window !== 'undefined') {
      const hasVisited = sessionStorage.getItem('homepage-visited');
      return !hasVisited; // Show loader only if not visited
    }
    return true;
  });
  const [user, setUser] = useState<any>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [shouldShowLoader, setShouldShowLoader] = useState(false);

  // Delay showing loader to prevent flash on reload
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShowLoader(true);
    }, 100); // Small delay to check if it's just a reload

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Preload critical assets and components
    const preloadAssets = async () => {
      const imagesToPreload = [
        "/assets/logo.png",
        "/assets/gcek_logo.png",
        "/assets/insprano-logo.png",
        "/mask.svg",
      ];

      // Preload images
      const imagePromises = imagesToPreload.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails
        });
      });

      // Fetch session
      const sessionPromise = authClient.getSession().then(({ data: session }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            role: session.user.role || "user",
          });
        }
      });

      // Preload dynamic components (force them to load)
      const componentPreloads = [
        import("@/components/homepage/Navbar"),
        import("@/components/homepage/HeroSection"),
        import("@/components/homepage/AboutPage"),
        import("@/components/homepage/Footer"),
        import("@/components/homepage/MaskCursor/Mask"),
        import("@/components/homepage/ZoomParallx/GallaryParallax"),
        import("@/components/homepage/HomepageDock"),
      ];

      // Wait for all assets and components to load
      await Promise.all([...imagePromises, sessionPromise, ...componentPreloads]);
      setAssetsLoaded(true);
    };

    preloadAssets();
  }, []);

  const handleLoadingComplete = () => {
    // Mark that user has visited the homepage in this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('homepage-visited', 'true');
    }
    
    // Only hide loader when both loading time is complete AND assets are loaded
    if (assetsLoaded) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If assets finish loading before loader timer, wait for loader
    // If loader timer finishes before assets, this will trigger when assets complete
    if (assetsLoaded && !isLoading) {
      setIsLoading(false);
    }
  }, [assetsLoaded]);

  // Don't show loader flash on reload - wait for initial check
  if (isLoading && !shouldShowLoader) {
    return null; // Return nothing during initial check
  }

  if (isLoading) {
    return <TerminalLoader onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <Navbar user={user} />
      <HeroSection />
      <MaskEffect />
      <Gallary />
      <AboutPage />
      <FooterSection />
      <HomepageDock />
      <HomepageDockMobile />
    </>
  );
}
