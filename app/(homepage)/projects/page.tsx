import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const revalidate = 300; // Revalidate every 5 minutes

async function getPublishedProjects() {
   const projects = await prisma.publishedProject.findMany({
      include: {
         publishedBy: {
            select: {
               name: true,
            },
         },
      },
      orderBy: {
         createdAt: 'desc',
      },
   });

   return projects;
}

export default async function HomepageProjectsPage() {
   const projects = await getPublishedProjects();

   return (
      <div className="min-h-screen bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
               <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Our Projects
               </h1>
               <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Explore the amazing projects built by our community
               </p>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
               <div className="text-center py-20">
                  <h2 className="text-2xl font-semibold mb-4">No Projects Yet</h2>
                  <p className="text-gray-400">
                     Projects are coming soon! Stay tuned for updates.
                  </p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project: {
                     id: string;
                     title: string;
                     description: string;
                     techStack: string[];
                     projectUrl: string | null;
                     thumbnailKey: string;
                     publishedBy: { name: string };
                  }) => (
                     <Card key={project.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-xl hover:shadow-blue-500/10">
                        <CardHeader className="p-0">
                           {/* Thumbnail */}
                           <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                              <Image
                                 src={`https://codebreakers.t3.storage.dev/${project.thumbnailKey}`}
                                 alt={project.title}
                                 fill
                                 className="object-cover"
                              />
                           </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                           {/* Title */}
                           <div>
                              <CardTitle className="text-xl text-white mb-2">
                                 {project.title}
                              </CardTitle>
                              <CardDescription className="text-gray-400 line-clamp-3">
                                 {project.description}
                              </CardDescription>
                           </div>

                           {/* Tech Stack */}
                           <div className="flex flex-wrap gap-2">
                              {project.techStack.map((tech: string) => (
                                 <Badge key={tech} variant="secondary" className="bg-zinc-800 text-gray-300">
                                    {tech}
                                 </Badge>
                              ))}
                           </div>

                           {/* Actions */}
                           <div className="flex gap-2 pt-2">
                              {project.projectUrl && (
                                 <Button asChild className="flex-1" size="sm">
                                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                       <ExternalLink className="w-4 h-4 mr-2" />
                                       Live Demo
                                    </a>
                                 </Button>
                              )}
                              <Button asChild variant="outline" size="sm" className={project.projectUrl ? "" : "flex-1"}>
                                 <a href={project.projectUrl || "#"} target="_blank" rel="noopener noreferrer">
                                    <Github className="w-4 h-4 mr-2" />
                                    GitHub
                                 </a>
                              </Button>
                           </div>

                           {/* Published By */}
                           <div className="text-xs text-gray-500 pt-2 border-t border-zinc-800">
                              Published by {project.publishedBy.name}
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            )}
         </div>
      </div>
   )
}