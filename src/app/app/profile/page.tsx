"use client";

import { useEffect, useState } from "react";
import { User, Mail, Building2, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-client";

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  companyName: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/profile");
      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        setFullName(data.data.fullName);
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await authFetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Profile updated successfully");
        setUser(data.data);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await authFetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      SUPER_ADMIN: "default",
      CLIENT_ADMIN: "secondary",
      CLIENT_USER: "outline",
    };

    return <Badge variant={variants[role] || "outline"}>{role.replace("_", " ")}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input id="email" type="email" value={user.email} readOnly className="bg-muted" />
                <Mail className="h-9 w-9 text-muted-foreground p-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Email cannot be changed. Contact your administrator.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2">
                {getRoleBadge(user.role)}
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {user.companyName && (
              <div className="grid gap-2">
                <Label>Company</Label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{user.companyName}</span>
                </div>
              </div>
            )}
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-sm text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
