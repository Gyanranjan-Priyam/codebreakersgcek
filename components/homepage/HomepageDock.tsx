"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Dock, DockIcon } from "@/components/ui/dock";
import { FaTrophy, FaBullhorn, FaNewspaper } from "react-icons/fa";
import { Trophy } from "lucide-react";

export function HomepageDock() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div 
      className={`fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-32 opacity-0"
      }`}
    >
      <div className="flex flex-col">
        <Dock direction="middle" iconSize={38} iconMagnification={64}>
          <DockIcon>
            <Link href="/leaderboard" className="flex items-center justify-center w-full h-full">
              <Trophy className="w-6 h-6" />
            </Link>
          </DockIcon>
        </Dock>
        <Dock direction="middle" iconSize={38} iconMagnification={64}>
          <DockIcon>
            <Link href="/announcement" className="flex items-center justify-center w-full h-full">
              <FaBullhorn className="w-6 h-6" />
            </Link>
          </DockIcon>
        </Dock>
        <Dock direction="middle" iconSize={38} iconMagnification={64}>
          <DockIcon>
            <Link href="/blog" className="flex items-center justify-center w-full h-full">
              <FaNewspaper className="w-6 h-6" />
            </Link>
          </DockIcon>
        </Dock>
      </div>
    </div>
  );
}

export function HomepageDockMobile() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div 
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"
      }`}
    >
      <Dock direction="middle" iconSize={44} iconMagnification={60}>
        <DockIcon>
          <Link href="/leaderboard" className="flex items-center justify-center w-full h-full">
            <FaTrophy className="w-5 h-5 text-yellow-500" />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link href="/announcement" className="flex items-center justify-center w-full h-full">
            <FaBullhorn className="w-5 h-5 text-blue-500" />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link href="/blog" className="flex items-center justify-center w-full h-full">
            <FaNewspaper className="w-5 h-5 text-green-500" />
          </Link>
        </DockIcon>
      </Dock>
    </div>
  );
}
