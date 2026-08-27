"use client";
import { useState } from "react";
import Image from "next/image";
import Logo from "../../public/assets/logo.png";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, XIcon, LogOut, LayoutDashboard, User, ReceiptText } from "lucide-react";
import { navItems } from "./_components/constant/navItems";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { isSystemAdminRole } from "@/lib/member-roles";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
  } | null;
}

const Navbar = ({ user }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleDashboard = () => {
    if (isSystemAdminRole(user?.role)) {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="z-10 bg-black text-white shadow-md w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <Image
              src={Logo}
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-xl font">CodeBreakers</span>
          </Link>
        </div>

        {/* Center Items */}
        <div className="hidden md:flex flex-grow justify-center space-x-6">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="nav-link group flex items-center font-semibold"
            >
              <p className="opacity-0 group-hover:opacity-100 text-mainColor transition-opacity duration-300">
                [
              </p>
              <p className="mx-2 group-hover:text-mainColor transition-colors duration-300">
                {label}
              </p>
              <p className="opacity-0 group-hover:opacity-100 text-mainColor transition-opacity duration-300">
                ]
              </p>
            </Link>
          ))}
        </div>

        {/* Profile Section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex items-center space-x-2 focus:outline-none cursor-pointer">
                  <Avatar className="h-10 w-10 border-2 border-emerald-500/50 hover:border-emerald-500 transition-colors">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-400">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-950 border-slate-800">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                    <p className="text-xs leading-none text-slate-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem 
                  onClick={handleDashboard}
                  className="cursor-pointer text-slate-300 focus:text-white focus:bg-slate-800"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push("/dashboard/transactions")}
                  className="cursor-pointer text-slate-300 focus:text-white focus:bg-slate-800"
                >
                  <ReceiptText className="mr-2 h-4 w-4" />
                  <span>Transactions</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-slate-800"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="hidden relative md:inline-flex h-12 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#05C799_0%,#0270D8_50%,#05C799_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 px-10 text-sm font-medium text-white backdrop-blur-3xl">
                Login
              </span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <XIcon /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden flex flex-col bg-black text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col px-2 py-3 space-y-2">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-4 py-2 text-base font-medium active:text-slate-200 hover:bg-gray-800 rounded"
                >
                  {label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <button
                    onClick={handleDashboard}
                    className="flex items-center px-4 py-2 text-base font-medium text-slate-300 hover:bg-gray-800 rounded w-full text-left"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/transactions")}
                    className="flex items-center px-4 py-2 text-base font-medium text-slate-300 hover:bg-gray-800 rounded w-full text-left"
                  >
                    <ReceiptText className="mr-2 h-4 w-4" />
                    Transactions
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-base font-medium text-red-400 hover:bg-gray-800 rounded w-full text-left"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 text-base font-medium bg-emerald-500 hover:bg-emerald-600 rounded text-white"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
