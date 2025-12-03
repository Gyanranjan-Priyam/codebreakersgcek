"use client";

import { motion } from "motion/react";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with Web Development",
    excerpt: "Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners looking to start their coding journey.",
    author: "CodeBreakers Team",
    date: "Dec 1, 2025",
    readTime: "5 min read",
    category: "Tutorial",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  },
  {
    id: "2",
    title: "Best Practices for React Development",
    excerpt: "Discover essential React patterns and best practices to build scalable and maintainable applications.",
    author: "CodeBreakers Team",
    date: "Nov 28, 2025",
    readTime: "8 min read",
    category: "Development",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  },
  {
    id: "3",
    title: "Introduction to Competitive Programming",
    excerpt: "Start your competitive programming journey with these essential algorithms and data structures.",
    author: "CodeBreakers Team",
    date: "Nov 25, 2025",
    readTime: "10 min read",
    category: "Competitive Programming",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-20">
      {/* Header */}
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Our Blog
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Insights, tutorials, and updates from the CodeBreakers community
          </p>
        </motion.div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                📝 Blog Coming Soon!
              </h2>
              <p className="text-gray-300 text-lg">
                We're working on bringing you amazing content. Stay tuned!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
