"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-client";

interface ReturnAssetDialogProps {
  assetId: number;
  assetName: string;
  assignedToName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReturnAssetDialog({
  assetId,
  assetName,
  assignedToName,
  open,
  onOpenChange,
  onSuccess,
}: ReturnAssetDialogProps) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await authFetch(`/api/assets/${assetId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Asset returned successfully");
        onOpenChange(false);
        setNotes("");
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Failed to return asset");
      }
    } catch (error) {
      console.error("Error returning asset:", error);
      toast.error("Failed to return asset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>
              Return "{assetName}" from {assignedToName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Return Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the return (condition, reason, etc.)..."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="rounded-lg border bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                This will mark the asset as "In Stock" and remove the current assignment.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Return
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
