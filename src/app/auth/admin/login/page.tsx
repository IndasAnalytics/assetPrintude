"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { login } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password, true);

      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }

      toast.success("Admin login successful!");
      // Redirect to admin dashboard
      window.location.href = "/admin/dashboard";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AssetTrack</span>
          </Link>
        </div>

        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
            </div>
            <CardDescription>
              Super administrator access only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@assettrack.com"
                  {...form.register("email")}
                  disabled={isLoading}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  {...form.register("password")}
                  disabled={isLoading}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  This area is restricted to authorized super administrators only.
                  Unauthorized access attempts are logged.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign In as Admin"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:underline">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Looking for{" "}
            <Link href="/auth/client/login" className="font-medium text-primary hover:underline">
              Client Login
            </Link>
            ?
          </p>
        </div>

        <div className="mt-6 rounded-lg border bg-card p-4 text-center text-xs text-muted-foreground">
          <p className="font-medium mb-1">Default Admin Credentials (for testing):</p>
          <p>Email: admin@assettrack.com</p>
          <p>Password: admin123</p>
          <p className="mt-2 text-amber-600 dark:text-amber-400">
            ⚠️ Change these credentials after first login!
          </p>
        </div>
      </div>
    </div>
  );
}
