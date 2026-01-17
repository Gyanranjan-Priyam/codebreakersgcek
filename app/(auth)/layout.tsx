"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const showCardLayout = pathname === "/login" || pathname === "/verify-request";

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center px-4 sm:px-6">
            <div className="flex w-full max-w-full flex-col justify-center gap-6">
                {/* Logo Section */}
                <Link href="/login" className="flex items-center gap-2 self-center font-medium mt-8 mb-2">
                    <span className="text-2xl sm:text-3xl flex flex-col items-center text-center">
                        <Image
                            src="/assets/logo.png"
                            alt="CodeBreakers Logo"
                            width={70}
                            height={70}
                            className="mb-2"
                            priority
                        />
                        CodeBreakers - {new Date().getFullYear()}
                    </span>
                </Link>

                {/* Main Authentication Container */}
                <div className="w-full max-w-5xl mx-auto">
                    {showCardLayout ? (
                        <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6">

                            {/* Illustration — Hidden on mobile */}
                            <div className="hidden md:flex items-center justify-center">
                                <Card className="p-6 w-full h-full flex items-center justify-center">
                                    <Image
                                        src="https://res.cloudinary.com/dw47ib0sh/image/upload/v1764313426/eea8udfwoxp5jaqflnwa.png"
                                        alt="Authentication Illustration"
                                        width={400}
                                        height={400}
                                        priority
                                    />
                                </Card>
                            </div>

                            {/* Form Section */}
                            <div className="flex flex-col justify-center w-full px-2 sm:px-6 md:px-4">
                                {children}
                            </div>
                        </Card>
                    ) : (
                        <div className="w-full px-2 sm:px-6">{children}</div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-balance mt-4 mb-10 text-center text-xs text-muted-foreground px-4">
                    By clicking continue, you agree to our{" "}
                    <Link href="/terms" className="text-blue-700 hover:text-primary">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-700 hover:text-primary">
                        Privacy Policy
                    </Link>
                </div>

            </div>
        </div>
    );
}
