"use client";
import { Button } from "@/components/ui/button";
import { Vortex } from "../ui/vortex";
import { motion } from "framer-motion";
import { Code2, Terminal, GitBranch } from "lucide-react";
import { FlipWords } from "../ui/flip-words";



const HeroSection: React.FC = () => {
  const features = [
    { icon: Code2, text: "Build Projects" },
    { icon: Terminal, text: "Learn & Compete" },
    { icon: GitBranch, text: "Collaborate" },
  ];

  const words = ["idea", "concept", "dream", "spark"];

  return (
    <div className="h-[90vh] overflow-hidden bg-black">
      <Vortex
        backgroundColor="black"
        rangeY={400}
        particleCount={100}
        baseHue={120}
        className="absolute inset-0 flex items-center justify-center px-8 md:px-16"
      >
        <div className="flex flex-col justify-center items-center space-y-8 md:w-[60%] h-full z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-emerald-400 font-medium">Now Accepting New Members</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-2xl lg:text-5xl font-bold leading-tight md:leading-tight lg:leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-100"
          >
           <span>
            Code your <FlipWords words={words}/>into reality, with a community that inspires.
           </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed"
          >
            Join an elite community of developers, builders, and problem solvers. 
            Compete in challenges, collaborate on projects, and level up your coding skills.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center items-center"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <Icon className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-8 border-0 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Join Community
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-semibold px-8 cursor-pointer"
            >
              View Projects
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex items-center gap-8 mt-4"
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
              <div className="text-xs text-gray-400">Active Members</div>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">100+</div>
              <div className="text-xs text-gray-400">Projects Built</div>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">50+</div>
              <div className="text-xs text-gray-400">Competitions</div>
            </div>
          </motion.div>
        </div>
      </Vortex>
    </div>
  );
};

export default HeroSection;
