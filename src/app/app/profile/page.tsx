"use client";

import { User, Mail, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  // In a real app, this would come from the API
  const user = {
    fullName: "John Doe",
    email: "john@example.com",
    role: "CLIENT_ADMIN",
    companyName: "Acme Corporation",
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      SUPER_ADMIN: "default",
      CLIENT_ADMIN: "secondary",
      CLIENT_USER: "outline",
    };

    return <Badge variant={variants[role] || "outline"}>{role.replace("_", " ")}</Badge>;
  };

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
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" defaultValue={user.fullName} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input id="email" type="email" defaultValue={user.email} readOnly />
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
          <div className="grid gap-2">
            <Label>Company</Label>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{user.companyName}</span>
            </div>
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>Change Password</Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates
              </p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
            </div>
            <Button variant="outline">Change Theme</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
