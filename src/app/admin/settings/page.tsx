"use client";

import { Settings, Mail, Database, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>General application configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" defaultValue="AssetTrack" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input id="support-email" type="email" defaultValue="support@assettrack.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="max-upload-size">Max Upload Size (MB)</Label>
            <Input id="max-upload-size" type="number" defaultValue="10" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>Configure SMTP settings for email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="smtp-host">SMTP Host</Label>
            <Input id="smtp-host" placeholder="smtp.example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="smtp-port">SMTP Port</Label>
            <Input id="smtp-port" type="number" defaultValue="587" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="smtp-user">SMTP Username</Label>
            <Input id="smtp-user" type="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="smtp-password">SMTP Password</Label>
            <Input id="smtp-password" type="password" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="smtp-secure" defaultChecked />
            <Label htmlFor="smtp-secure">Use TLS/SSL</Label>
          </div>
          <Button>Save Email Settings</Button>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
          <CardDescription>Database connection and backup settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Database Status</p>
              <p className="text-sm text-muted-foreground">Connected to MSSQL</p>
            </div>
            <Button variant="outline">Test Connection</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Automatic Backups</p>
              <p className="text-sm text-muted-foreground">Daily backups at 2:00 AM</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Backup Retention</p>
              <p className="text-sm text-muted-foreground">Keep backups for 30 days</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          <Button>Backup Now</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Authentication and security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all admin users
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Session Timeout</p>
              <p className="text-sm text-muted-foreground">
                Auto logout after 30 minutes of inactivity
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label htmlFor="password-min-length">Minimum Password Length</Label>
            <Input id="password-min-length" type="number" defaultValue="8" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="require-special-chars" defaultChecked />
            <Label htmlFor="require-special-chars">Require special characters</Label>
          </div>
          <Button>Save Security Settings</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure system notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Tenant Registration</p>
              <p className="text-sm text-muted-foreground">
                Notify admins when new tenant registers
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Failed Login Attempts</p>
              <p className="text-sm text-muted-foreground">
                Alert on suspicious login activity
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System Errors</p>
              <p className="text-sm text-muted-foreground">
                Send alerts for critical errors
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button>Save Notification Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
