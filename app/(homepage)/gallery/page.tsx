"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { HackathonImageLinks, IdeationImageLinks, EventImageLinks } from "@/components/homepage/_components/constant/galleryImageLInks";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GallerySectionProps {
  title: string;
  images: string[];
  gradient: string;
}

function GallerySection({ title, images, gradient }: GallerySectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`text-4xl md:text-5xl font-bold mb-8 bg-linear-to-r ${gradient} bg-clip-text text-transparent text-center`}
      >
        {title}
      </motion.h2>

      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-black via-gray-900 to-black py-20">
      <div className="text-center mb-16 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          Our Gallery
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          Capturing moments and memories from our events, hackathons, and ideation sessions
        </motion.p>
      </div>
      <div className="space-y-20">
        <GallerySection
          title="Hackathon Moments"
          images={HackathonImageLinks}
          gradient="from-blue-400 to-cyan-500"
        />
        
        <GallerySection
          title="Ideation Sessions"
          images={IdeationImageLinks}
          gradient="from-purple-400 to-pink-500"
        />
        
        <GallerySection
          title="Event Highlights"
          images={EventImageLinks}
          gradient="from-green-400 to-emerald-500"
        />
      </div>
    </div>
  );
}