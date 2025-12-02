"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { unpublishProject } from "../actions";
import { useRouter } from "next/navigation";

interface UnpublishButtonProps {
  githubRepoId: number;
}

export function UnpublishButton({ githubRepoId }: UnpublishButtonProps) {
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const router = useRouter();

  const handleUnpublish = async () => {
    setIsUnpublishing(true);

    try {
      const result = await unpublishProject(githubRepoId);

      if (result.status === "success") {
        toast.success("Project unpublished successfully!");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to unpublish project");
      }
    } catch (error) {
      console.error("Error unpublishing project:", error);
      toast.error("Failed to unpublish project");
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleUnpublish}
      disabled={isUnpublishing}
      className="w-full cursor-pointer"
    >
      {isUnpublishing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Unpublishing...
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Unpublish from Website
        </>
      )}
    </Button>
  );
}
