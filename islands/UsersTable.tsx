import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Card from "../components/Card.tsx";
import UserForm, { UserFormData } from "./UserForm.tsx";
import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  users,
} from "../utils/api.ts";

export default function UsersTable() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await users.getAll();
      setUsersList(data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      (user.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (`${user.firstName} ${user.lastName}`.toLowerCase()).includes(
        searchTerm.toLowerCase(),
      );
    const matchesActive = statusFilter === "all" ||
      (statusFilter === "active" ? user.isActive : !user.isActive);

    return matchesSearch && matchesActive;
  });

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatRelativeTime = (dateString: string | undefined | null) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleAddUser = () => {
    setCurrentUser(undefined);
    setIsFormOpen(true);
    setFormStatus(null);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsFormOpen(true);
    setFormStatus(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      try {
        await users.delete(userId);
        setUsersList(usersList.filter((user) => user.id !== userId));
        showFormStatus("success", "User deleted successfully");
      } catch (err: any) {
        showFormStatus("error", err.message || "Failed to delete user");
      }
    }
  };

  const handleSubmitUser = async (formData: UserFormData) => {
    try {
      if (currentUser) {
        // Update existing user
        const updateData: UpdateUserRequest = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          bio: formData.bio,
          profilePicture: formData.profilePicture,
          dateOfBirth: formData.dateOfBirth,
          interests: formData.interests,
          skills: formData.skills,
          isActive: formData.isActive,
        };

        const updatedUser = await users.update(currentUser.id, updateData);
        setUsersList(
          usersList.map((user) =>
            user.id === currentUser.id ? updatedUser : user
          ),
        );

        showFormStatus("success", "User updated successfully");
      } else {
        // Create new user
        const createData: CreateUserRequest = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          bio: formData.bio,
          profilePicture: formData.profilePicture,
          dateOfBirth: formData.dateOfBirth,
          interests: formData.interests,
          skills: formData.skills,
          isActive: formData.isActive,
          password: "tempPassword123", // This would normally be handled differently
        };

        const newUser = await users.create(createData);
        setUsersList([newUser, ...usersList]);

        showFormStatus("success", "User created successfully");
      }

      setIsFormOpen(false);
    } catch (err: any) {
      showFormStatus("error", err.message || "Failed to save user");
    }
  };

  const handleStatusChange = async (userId: string) => {
    try {
      const user = usersList.find((u) => u.id === userId);
      if (!user) return;

      const newIsActive = !user.isActive;

      const updatedUser = await users.update(userId, { isActive: newIsActive });

      setUsersList(usersList.map((u) => u.id === userId ? updatedUser : u));

      showFormStatus(
        "success",
        `User ${newIsActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (err: any) {
      showFormStatus("error", err.message || "Failed to update user status");
    }
  };

  const showFormStatus = (type: "success" | "error", message: string) => {
    setFormStatus({ type, message });
    // Auto-hide after 5 seconds
    setTimeout(() => setFormStatus(null), 5000);
  };

  return (
    <>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Users</h1>
          <p class="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button variant="primary" onClick={handleAddUser}>
          <span class="material-symbols-outlined mr-2">person_add</span>
          Add User
        </Button>
      </div>

      {formStatus && (
        <div
          class={`mb-4 p-4 rounded-8 ${
            formStatus.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <div class="flex items-center">
            <span class="material-symbols-outlined mr-2">
              {formStatus.type === "success" ? "check_circle" : "error"}
            </span>
            <p>{formStatus.message}</p>
          </div>
        </div>
      )}

      <Card>
        <div class="mb-4 flex flex-col sm:flex-row justify-between gap-4">
          <div class="relative w-full sm:w-96">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <span class="material-symbols-outlined">search</span>
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm((e.target as HTMLInputElement).value)}
              class="w-full pl-10 pr-4 py-2 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div class="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter((e.target as HTMLSelectElement).value)}
              class="px-3 py-2 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {isLoading
          ? (
            <div class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600">
              </div>
            </div>
          )
          : error
          ? (
            <div class="p-8 text-center">
              <span class="material-symbols-outlined text-red-500 text-4xl mb-2">
                error
              </span>
              <p class="text-red-600">{error}</p>
              <Button
                variant="outline"
                class="mt-4"
                onClick={fetchUsers}
              >
                Retry
              </Button>
            </div>
          )
          : (
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-border">
                    <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      User
                    </th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Email
                    </th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Role
                    </th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Created
                    </th>
                    <th class="py-3 px-4 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} class="hover:bg-muted/50">
                      <td class="py-3 px-4">
                        <div class="flex items-center">
                          <div class="h-10 w-10 flex-shrink-0">
                            <img
                              class="h-10 w-10 rounded-full"
                              src={user.profilePicture ||
                                "https://via.placeholder.com/40"}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          </div>
                          <div class="ml-4">
                            <div class="font-medium text-foreground">
                              {user.firstName} {user.lastName}
                            </div>
                            <div class="text-sm text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td class="py-3 px-4 text-sm text-muted-foreground">
                        {user.role}
                      </td>
                      <td class="py-3 px-4 text-sm">
                        <span
                          class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td class="py-3 px-4 text-right text-sm">
                        <div class="flex justify-end items-center space-x-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleEditUser(user)}
                          >
                            <span class="material-symbols-outlined text-base">
                              edit
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(user.id)}
                          >
                            <span class="material-symbols-outlined text-base">
                              {user.isActive ? "block" : "check_circle"}
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            class="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <span class="material-symbols-outlined text-base">
                              delete
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      {isFormOpen && (
        <UserForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitUser}
          user={currentUser}
        />
      )}
    </>
  );
}
