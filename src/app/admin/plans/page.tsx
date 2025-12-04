"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, CheckCircle2, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-client";

interface Plan {
  id: number;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number | null;
  maxAssets: number | null;
  maxUsers: number | null;
  features: string | null;
  isActive: boolean;
}

interface PlanFormData {
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  maxAssets: string;
  maxUsers: string;
  features: string;
  isActive: boolean;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    description: "",
    monthlyPrice: "",
    annualPrice: "",
    maxAssets: "",
    maxUsers: "",
    features: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/admin/plans");
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      } else {
        toast.error("Failed to load plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || "",
        monthlyPrice: plan.monthlyPrice.toString(),
        annualPrice: plan.annualPrice?.toString() || "",
        maxAssets: plan.maxAssets?.toString() || "",
        maxUsers: plan.maxUsers?.toString() || "",
        features: plan.features || "",
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        description: "",
        monthlyPrice: "",
        annualPrice: "",
        maxAssets: "",
        maxUsers: "",
        features: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        monthlyPrice: parseFloat(formData.monthlyPrice),
        annualPrice: formData.annualPrice ? parseFloat(formData.annualPrice) : null,
        maxAssets: formData.maxAssets ? parseInt(formData.maxAssets) : null,
        maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : null,
        features: formData.features || null,
        isActive: formData.isActive,
      };

      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : "/api/admin/plans";

      const response = await authFetch(url, {
        method: editingPlan ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingPlan ? "Plan updated successfully" : "Plan created successfully");
        handleCloseDialog();
        fetchPlans();
      } else {
        toast.error(data.message || "Failed to save plan");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Failed to save plan");
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const response = await authFetch(`/api/admin/plans/${plan.id}/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchPlans();
      } else {
        toast.error(data.message || "Failed to update plan status");
      }
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast.error("Failed to update plan status");
    }
  };

  const handleDeleteClick = (plan: Plan) => {
    setDeletingPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return;

    try {
      const response = await authFetch(`/api/admin/plans/${deletingPlan.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Plan deleted successfully");
        setIsDeleteDialogOpen(false);
        setDeletingPlan(null);
        fetchPlans();
      } else {
        toast.error(data.message || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    }
  };

  const parseFeatures = (features: string | null): string[] => {
    if (!features) return [];
    try {
      const parsed = JSON.parse(features);
      // Ensure the parsed result is actually an array
      if (Array.isArray(parsed)) {
        return parsed;
      }
      console.warn("Features is not an array:", parsed);
      return [];
    } catch (error) {
      console.warn("Failed to parse features:", error);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage pricing plans for your customers
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading plans...</div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No plans configured</p>
            <Button onClick={() => handleOpenDialog()}>Create your first plan</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {!plan.isActive && <Badge variant="outline">Inactive</Badge>}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(plan)}>
                          <Switch className="mr-2 h-4 w-4" />
                          {plan.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(plan)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">₹{plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {plan.annualPrice && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ₹{plan.annualPrice}/year (save{" "}
                      {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}
                      %)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>
                      {plan.maxAssets === null
                        ? "Unlimited assets"
                        : `Up to ${plan.maxAssets} assets`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>
                      {plan.maxUsers === null
                        ? "Unlimited users"
                        : `Up to ${plan.maxUsers} users`}
                    </span>
                  </div>
                  {parseFeatures(plan.features).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
            <DialogDescription>
              {editingPlan ? "Update the plan details" : "Add a new subscription plan"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="monthlyPrice">Monthly Price (₹) *</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="annualPrice">Annual Price (₹)</Label>
                  <Input
                    id="annualPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.annualPrice}
                    onChange={(e) => setFormData({ ...formData, annualPrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="maxAssets">Max Assets</Label>
                  <Input
                    id="maxAssets"
                    type="number"
                    min="1"
                    value={formData.maxAssets}
                    onChange={(e) => setFormData({ ...formData, maxAssets: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    min="1"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="features">Features (JSON array)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={4}
                  placeholder='["Feature 1", "Feature 2", "Feature 3"]'
                />
                <p className="text-xs text-muted-foreground">
                  Enter features as a JSON array, e.g., ["Feature 1", "Feature 2"]
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the plan "{deletingPlan?.name}".
              {deletingPlan && " If any tenants are using this plan, it cannot be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
