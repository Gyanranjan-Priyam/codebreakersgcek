"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateResourceFolder } from "../actions";
import { toast } from "sonner";

interface EditFolderDialogProps {
  folder: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    order: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFolderDialog({ folder, open, onOpenChange }: EditFolderDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: folder.name,
    description: folder.description || "",
    icon: folder.icon || "📁",
    order: folder.order,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateResourceFolder(folder.id, formData);

    if (result.status === "success") {
      toast.success("Folder updated successfully");
      onOpenChange(false);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
          <DialogDescription>
            Update folder details and organization
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Folder Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Programming Tutorials"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-icon">Icon (Emoji)</Label>
            <Input
              id="edit-icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="📁"
              maxLength={2}
            />
            <p className="text-xs text-muted-foreground">
              Use an emoji to represent this folder
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this folder's contents..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-order">Display Order</Label>
            <Input
              id="edit-order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
