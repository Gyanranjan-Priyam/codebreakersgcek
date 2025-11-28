import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "View projects created by CodeBreakers members",
};

export default function ProjectPage() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl tracking-tight font-bold">Projects</h1>
        <p className="text-muted-foreground mt-2">
          Here all the project that was recently created by the CodeBrekers
          Member will be shown here.
        </p>
      </div>

      <div>
         <Card>
            <CardHeader>
               <CardTitle>
               Projects Page is under construction...
               </CardTitle>
               <CardDescription>
               Please check back later for updates.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="h-80 w-full rounded-xl border">
                   <div className="flex h-full flex-col w-full items-center justify-center text-muted-foreground">
                     <div className="w-20 h-20 border rounded-full flex items-center justify-center mb-10 bg-orange-200/60 animate-pulse">
                        <FlaskConical className="text-white" size={40} />
                     </div>
                     <p className="text-lg">This page is under BETA testing after succesfully implemented core features we will update soon.</p>
                   </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
