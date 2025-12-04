"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Search, Filter, MoreHorizontal, UserCheck, UserX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { authFetch } from "@/lib/auth-client";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  tenantId: number | null;
  companyName: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  tenantStatus: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      let url = "/api/admin/users";

      if (roleFilter && roleFilter !== "all") {
        url += `?role=${roleFilter}`;
      }

      const response = await authFetch(url);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await authFetch(`/api/admin/users/${userId}/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`User ${!currentStatus ? "activated" : "deactivated"} successfully`);
        fetchUsers(); // Refresh list
      } else {
        toast.error(data.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await authFetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh list
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getSubscriptionStatus = (endDate: string | null, status: string | null) => {
    if (!endDate || !status) return null;

    const now = new Date();
    const end = new Date(endDate);
    const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { text: "Expired", variant: "destructive" as const, days: 0 };
    } else if (daysRemaining <= 7) {
      return { text: `${daysRemaining}d left`, variant: "destructive" as const, days: daysRemaining };
    } else if (daysRemaining <= 30) {
      return { text: `${daysRemaining}d left`, variant: "secondary" as const, days: daysRemaining };
    } else {
      return { text: "Active", variant: "default" as const, days: daysRemaining };
    }
  };

  const getTenantStatusBadge = (status: string | null) => {
    if (!status) return null;

    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      TRIAL: "secondary",
      SUSPENDED: "destructive",
      CANCELLED: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      SUPER_ADMIN: "default",
      CLIENT_ADMIN: "secondary",
      CLIENT_USER: "outline",
    };

    return (
      <Badge variant={variants[role] || "outline"}>
        {role.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage all system users
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="CLIENT_ADMIN">Client Admin</SelectItem>
            <SelectItem value="CLIENT_USER">Client User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Tenant Status</TableHead>
              <TableHead>User Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.companyName || "-"}</TableCell>
                  <TableCell>
                    {user.subscriptionEndDate ? (
                      <div className="space-y-1">
                        {(() => {
                          const subStatus = getSubscriptionStatus(user.subscriptionEndDate, user.tenantStatus);
                          return subStatus ? (
                            <>
                              <Badge variant={subStatus.variant}>
                                {subStatus.text}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                Expires: {format(new Date(user.subscriptionEndDate), "MMM dd, yyyy")}
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getTenantStatusBadge(user.tenantStatus) || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleActive(user.id, user.isActive)}
                      />
                      <Badge variant={user.isActive ? "default" : "destructive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt
                      ? format(new Date(user.lastLoginAt), "MMM dd, yyyy")
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(user)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the user "{userToDelete?.fullName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
