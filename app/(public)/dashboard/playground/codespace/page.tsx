import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, Rocket } from "lucide-react";

export default function CodespacePage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Construction className="w-20 h-20 text-yellow-500 animate-pulse" />
                <Rocket className="w-8 h-8 text-blue-500 absolute -top-2 -right-2" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Page Under Development</CardTitle>
            <CardDescription className="text-lg mt-2">
              GitHub Codespace Integration Coming Soon
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              We're working hard to bring you an amazing GitHub Codespace experience.
              This feature is currently under testing and will be available soon.
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
                <span className="text-sm font-medium">In Progress</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
