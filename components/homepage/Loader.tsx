"use client";

import { useState, useEffect } from "react";
import { WordRotate } from "./word-rotate";
import { motion, AnimatePresence } from "motion/react";

const welcomeMessages = [
  "Welcome to CodeBreakers",          // English
  "Bienvenido a CodeBreakers",        // Spanish
  "Bienvenue à CodeBreakers",         // French
  "Willkommen bei CodeBreakers",      // German
  "Benvenuto a CodeBreakers",         // Italian
  "Bem-vindo ao CodeBreakers",        // Portuguese
  "Добро пожаловать в CodeBreakers",  // Russian
  "欢迎来到 CodeBreakers",             // Chinese (Simplified)
  "ようこそ CodeBreakers へ",            // Japanese
  "환영합니다 CodeBreakers 에",           // Korean
  "स्वागत है CodeBreakers में",           // Hindi
  "Welkom bij CodeBreakers",          // Dutch
  "Välkommen till CodeBreakers",      // Swedish
  "Tervetuloa CodeBreakersiin",       // Finnish
  "Velkommen til CodeBreakers"        // Danish / Norwegian
];

interface LoaderProps {
  onLoadingComplete?: () => void;
}

export default function Loader({ onLoadingComplete }: LoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    // Hide loader after animation completes
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 10000); // 10 seconds total

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Logo */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <img
              src="/assets/logo.png"
              alt="CodeBreakers Logo"
              className="w-24 h-24 md:w-32 md:h-32 object-contain"
            />
          </motion.div>

          {/* Rotating Welcome Messages */}
          <div className="mb-12 min-h-[120px] flex items-center justify-center">
            <WordRotate
              words={welcomeMessages}
              duration={600}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4"
              motionProps={{
                initial: { opacity: 0, y: -20 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: 20 },
                transition: { duration: 0.4, ease: "easeInOut" },
              }}
            />
          </div>

          {/* Progress Bar */}
          <div className="w-64 md:w-96 px-4">
            <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">
              {progress}%
            </p>
          </div>

          {/* Loading Animation Dots */}
          <motion.div
            className="flex gap-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-white rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
