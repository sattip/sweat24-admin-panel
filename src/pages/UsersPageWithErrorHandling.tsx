// Example implementation of Users Page with comprehensive error handling and loading states
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Users } from "lucide-react";
import { useApiWithRetry, useQuery } from "@/hooks/useApiWithRetry";
import { usersApi } from "@/services/apiService";
import { TableSkeleton, PageHeaderSkeleton } from "@/components/LoadingSkeletons";
import { RetryableError, EmptyStateError } from "@/components/RetryableError";
import { LoadingButton, LazyLoadWrapper } from "@/components/LoadingStates";
import { AsyncBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/data/mockData";

export function UsersPageWithErrorHandling() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Using the custom hook with retry logic and error handling
  const {
    data: users,
    isLoading,
    error,
    refetch,
    isOffline,
  } = useQuery(
    () => usersApi.getAll({ 
      search: searchTerm, 
      status: statusFilter !== "all" ? statusFilter : undefined 
    }),
    { search: searchTerm, status: statusFilter },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      offlineConfig: {
        cacheKey: "users-list",
        cacheDuration: 10 * 60 * 1000, // 10 minutes
        fallback: () => ({ data: [], total: 0, page: 1, per_page: 20 }),
      },
    }
  );

  // Delete user mutation with optimistic updates
  const deleteUserMutation = useApiWithRetry(
    (userId: string) => usersApi.delete(userId),
    {
      successMessage: "User deleted successfully",
      onSuccess: () => {
        refetch(); // Refetch the list after deletion
      },
    }
  );

  // Bulk operations
  const bulkOperationMutation = useApiWithRetry(
    async (operation: { action: string; userIds: string[] }) => {
      // Simulate bulk operation
      const promises = operation.userIds.map((id) => {
        switch (operation.action) {
          case "activate":
            return usersApi.update(id, { status: "active" });
          case "deactivate":
            return usersApi.update(id, { status: "inactive" });
          case "delete":
            return usersApi.delete(id);
          default:
            throw new Error("Invalid operation");
        }
      });
      
      return Promise.all(promises);
    },
    {
      successMessage: "Bulk operation completed successfully",
      onSuccess: () => {
        setSelectedUsers([]);
        refetch();
      },
    }
  );

  const handleBulkOperation = async (action: string) => {
    if (selectedUsers.length === 0) {
      return;
    }

    await bulkOperationMutation.execute({ action, userIds: selectedUsers });
  };

  // Filter effect with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <AsyncBoundary>
        {/* Page Header with Loading State */}
        <LazyLoadWrapper
          isLoading={isLoading && !users}
          loadingComponent={<PageHeaderSkeleton />}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Users</h1>
              <p className="text-muted-foreground">
                Manage your gym members and their subscriptions
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </LazyLoadWrapper>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <LoadingButton
                variant="outline"
                onClick={() => refetch()}
                isLoading={isLoading}
                loadingText="Refreshing..."
              >
                <Filter className="h-4 w-4" />
              </LoadingButton>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2 ml-auto">
                  <LoadingButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation("activate")}
                    isLoading={bulkOperationMutation.isLoading}
                    loadingText="Processing..."
                  >
                    Activate
                  </LoadingButton>
                  <LoadingButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkOperation("deactivate")}
                    isLoading={bulkOperationMutation.isLoading}
                    loadingText="Processing..."
                  >
                    Deactivate
                  </LoadingButton>
                  <LoadingButton
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkOperation("delete")}
                    isLoading={bulkOperationMutation.isLoading}
                    loadingText="Deleting..."
                  >
                    Delete
                  </LoadingButton>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table with Loading and Error States */}
        <Card>
          <CardContent className="p-0">
            <LazyLoadWrapper
              isLoading={isLoading}
              error={error}
              onRetry={refetch}
              loadingComponent={<TableSkeleton rows={10} columns={6} />}
              errorComponent={
                <RetryableError
                  error={error}
                  onRetry={refetch}
                  variant="card"
                />
              }
            >
              {users?.data && users.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.data.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.data.map((u) => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(
                                  selectedUsers.filter((id) => id !== user.id)
                                );
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                {user.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "success"
                                : user.status === "inactive"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.joinDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            <LoadingButton
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUserMutation.execute(user.id)}
                              isLoading={deleteUserMutation.isLoading}
                              disabled={deleteUserMutation.isLoading}
                            >
                              Delete
                            </LoadingButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyStateError
                  title="No users found"
                  description={
                    searchTerm || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Start by adding your first user"
                  }
                  icon={Users}
                  error={error}
                  onRetry={error ? refetch : undefined}
                />
              )}
            </LazyLoadWrapper>
          </CardContent>
        </Card>

        {/* Offline Indicator */}
        {isOffline && (
          <Card className="border-yellow-500 bg-yellow-50">
            <CardContent className="flex items-center gap-2 py-3">
              <span className="text-sm text-yellow-800">
                You're currently offline. Changes will sync when connection is restored.
              </span>
            </CardContent>
          </Card>
        )}
      </AsyncBoundary>
    </div>
  );
}