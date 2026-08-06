"use client";

import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Loader2, ShieldAlert, Mail } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { checkLoginPermission } from "../actions";

// Google Logo SVG Component
const GoogleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// GitHub Logo SVG Component
const GitHubLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

// Discord Logo SVG Component  
const DiscordLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#5865F2">
    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0 a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
  </svg>
);

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [googlePending, startGoogleTransition] = useTransition();
  const [githubPending, startGithubTransition] = useTransition();
  const [discordPending, startDiscordTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "unauthorized" || errorParam === "not_registered") {
      setUnauthorizedError("Unauthorized Access: Only registered members added by an admin can log in. If you are a member, please contact the administrator.");
    } else if (errorParam === "banned") {
      setUnauthorizedError("Account Banned: Your account access has been restricted. Please contact the administrator.");
    }
  }, [searchParams]);

  async function signInWithGoogle() {
    setUnauthorizedError(null);
    startGoogleTransition(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth/callback",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Redirecting for signed in with Google!");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Unauthorized access or error signing in.");
          },
        },
      });
    });
  }

  async function signInWithGithub() {
    setUnauthorizedError(null);
    startGithubTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/auth/callback",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Redirecting for signed in with GitHub!");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Unauthorized access or error signing in.");
          },
        },
      });
    });
  }

  async function signInWithDiscord() {
    setUnauthorizedError(null);
    startDiscordTransition(async () => {
      await authClient.signIn.social({
        provider: "discord",
        callbackURL: "/auth/callback",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Redirecting for signed in with Discord!");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Unauthorized access or error signing in.");
          },
        },
      });
    });
  }

  function signInWithEmail() {
    setUnauthorizedError(null);
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    startEmailTransition(async () => {
      // Step 1: Validate member registration permission
      const permResult = await checkLoginPermission(email);

      if (!permResult.allowed) {
        setUnauthorizedError(permResult.message);
        toast.error("Unauthorized Access: Only registered members can log in.");
        return;
      }

      // Step 2: Send OTP if member is valid and permitted
      await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Verification email sent!");
            router.push(`/verify-request?email=${encodeURIComponent(email)}`);
          },
          onError: (ctx) => {
            const msg = ctx.error.message || "Error sending verification email";
            setUnauthorizedError(msg);
            toast.error(msg);
          },
        },
      });
    });
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 py-8 px-4">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20">
          <Image
            src="/assets/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-8 text-foreground">
        Welcome to CodeBreakers
      </h1>

      {/* Unauthorized Error Alert Card */}
      {unauthorizedError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-destructive">Unauthorized Access</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {unauthorizedError}
              </p>
            </div>
          </div>
          <div className="pt-1">
            <Button
              asChild
              variant="destructive"
              size="sm"
              className="w-full text-xs font-medium rounded-lg shadow-sm"
            >
              <a href="mailto:admin@codebreakersgcek.com?subject=Member%20Access%20Help%20Request">
                <Mail className="w-4 h-4 mr-1.5" />
                If you are a member, contact with admin
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* OAuth Buttons */}
      <div className="space-y-3">
        {/* Google Sign In Button */}
        <Button
          disabled={googlePending}
          onClick={signInWithGoogle}
          variant="outline"
          className="cursor-pointer w-full h-12 sm:h-14 text-base font-normal bg-background hover:bg-accent border border-input rounded-full shadow-sm"
        >
          {googlePending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-foreground">Signing in...</span>
            </>
          ) : (
            <>
              <GoogleLogo className="w-5 h-5" />
              <span className="text-foreground">Sign in with Google</span>
            </>
          )}
        </Button>

        {/* GitHub Sign In Button */}
        <Button
          disabled={githubPending}
          onClick={signInWithGithub}
          variant="outline"
          className="cursor-pointer w-full h-12 sm:h-14 text-base font-normal bg-background hover:bg-accent border border-input rounded-full shadow-sm"
        >
          {githubPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-foreground">Signing in...</span>
            </>
          ) : (
            <>
              <GitHubLogo className="w-5 h-5" />
              <span className="text-foreground">Sign in with GitHub</span>
            </>
          )}
        </Button>

        {/* Discord Sign In Button */}
        <Button
          disabled={discordPending}
          onClick={signInWithDiscord}
          variant="outline"
          className="cursor-pointer w-full h-12 sm:h-14 text-base font-normal bg-background hover:bg-accent border border-input rounded-full shadow-sm"
        >
          {discordPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-foreground">Signing in...</span>
            </>
          ) : (
            <>
              <DiscordLogo className="w-5 h-5" />
              <span className="text-foreground">Sign in with Discord</span>
            </>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative text-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground">or</span>
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-4">
        <Input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (unauthorizedError) setUnauthorizedError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              signInWithEmail();
            }
          }}
          type="email"
          placeholder="Enter Your Email"
          required
          className="w-full h-12 sm:h-14 text-base bg-background border-input rounded-lg placeholder:text-muted-foreground text-foreground"
        />

        {/* Continue Button */}
        <Button
          onClick={signInWithEmail}
          disabled={emailPending}
          className="cursor-pointer w-full h-12 sm:h-14 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
        >
          {emailPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Checking & Sending...</span>
            </>
          ) : (
            <span>Continue</span>
          )}
        </Button>
      </div>
    </div>
  );
}
