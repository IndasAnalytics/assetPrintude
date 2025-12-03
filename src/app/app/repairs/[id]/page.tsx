"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface Repair {
  id: number;
  assetName: string;
  assetCode: string;
  assetId: number;
  problemDescription: string;
  referenceNumber: string | null;
  status: string;
  reportedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  resolutionNotes: string | null;
  reportedByName: string;
  completedByName: string | null;
  vendorName: string | null;
}

export default function RepairDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchRepair();
    }
  }, [params.id]);

  const fetchRepair = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/repairs/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setRepair(data.data);
      } else {
        toast.error("Failed to load repair");
      }
    } catch (error) {
      console.error("Error fetching repair:", error);
      toast.error("Failed to load repair");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/repairs/${params.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Repair deleted successfully");
        router.push("/app/repairs");
      } else {
        toast.error(data.message || "Failed to delete repair");
      }
    } catch (error) {
      console.error("Error deleting repair:", error);
      toast.error("Failed to delete repair");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      OPEN: "destructive",
      IN_PROGRESS: "default",
      COMPLETED: "secondary",
      CANCELLED: "outline",
    };

    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading repair...</div>;
  }

  if (!repair) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Wrench className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Repair not found</p>
        <Button asChild>
          <Link href="/app/repairs">Back to Repairs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/repairs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Repair Request #{repair.id}</h1>
            <p className="text-muted-foreground">{repair.assetName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/app/repairs/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Update
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this repair request. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Repair Information</CardTitle>
                {getStatusBadge(repair.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Asset</p>
                <Link href={`/app/assets/${repair.assetId}`} className="mt-1 text-primary hover:underline">
                  {repair.assetName} ({repair.assetCode})
                </Link>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">Problem Description</p>
                <p className="mt-1">{repair.problemDescription}</p>
              </div>

              {repair.resolutionNotes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolution Notes</p>
                    <p className="mt-1">{repair.resolutionNotes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                  <p className="mt-1">{repair.referenceNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                  <p className="mt-1">{repair.vendorName || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                  <p className="mt-1 text-2xl font-bold">
                    {repair.estimatedCost ? `₹${repair.estimatedCost.toFixed(2)}` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actual Cost</p>
                  <p className="mt-1 text-2xl font-bold">
                    {repair.actualCost ? `₹${repair.actualCost.toFixed(2)}` : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reported At</p>
                <p className="mt-1">{format(new Date(repair.reportedAt), "MMM dd, yyyy HH:mm")}</p>
                <p className="text-sm text-muted-foreground">by {repair.reportedByName}</p>
              </div>

              {repair.startedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Started At</p>
                    <p className="mt-1">{format(new Date(repair.startedAt), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                </>
              )}

              {repair.completedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                    <p className="mt-1">{format(new Date(repair.completedAt), "MMM dd, yyyy HH:mm")}</p>
                    {repair.completedByName && (
                      <p className="text-sm text-muted-foreground">by {repair.completedByName}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
