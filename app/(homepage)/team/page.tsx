"use client";

import ChromaGrid from "@/components/ChromaGrid";
import { coreMembers, coordinators } from "../_components/teamData";
import { Separator } from "@/components/ui/separator";

export default function TeamPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 bg-black min-h-screen">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-center">
        Meet the Team behind CodeBreakers
      </h1>
      <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-center px-4">
        Our talented and dedicated team driving innovation and excellence
      </h2>
      <Separator className="mb-8 sm:mb-12" />
      
      {/* Core Members Section */}
      <div className="mb-12 sm:mb-16">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent px-4">
          Core Members
        </h3>
        <ChromaGrid items={coreMembers} />
      </div>
      
      <Separator className="my-8 sm:my-12" />
      
      {/* Coordinators Section */}
      <div className="mb-12 sm:mb-16">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center bg-linear-to-r from-green-400 to-cyan-600 bg-clip-text text-transparent px-4">
          Coordinators
        </h3>
        <ChromaGrid items={coordinators} />
      </div>
    </div>
  );
}
