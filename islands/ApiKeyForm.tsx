import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Modal from "../components/Modal.tsx";
import { User } from "../utils/api.ts";

export interface ApiKeyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ApiKeyFormData) => void;
  currentUserId?: string;
  availableUsers: User[];
}

export interface ApiKeyFormData {
  userId: string;
  description: string;
  expiration: string;
  permissions: string[];
}

// Available permissions for API keys
const availablePermissions = [
  { id: "read:users", label: "Read Users" },
  { id: "write:users", label: "Write Users" },
  { id: "read:posts", label: "Read Posts" },
  { id: "write:posts", label: "Write Posts" },
  { id: "read:locations", label: "Read Locations" },
  { id: "write:locations", label: "Write Locations" },
  { id: "read:analytics", label: "Read Analytics" },
];

// Available expiration options
const expirationOptions = [
  { value: "never", label: "Never Expires" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "180d", label: "6 Months" },
  { value: "365d", label: "1 Year" },
];

export default function ApiKeyForm(
  { isOpen, onClose, onSubmit, currentUserId = "", availableUsers = [] }:
    ApiKeyFormProps,
) {
  const [formData, setFormData] = useState<ApiKeyFormData>({
    userId: currentUserId,
    description: "",
    expiration: "never",
    permissions: ["read:users", "read:posts", "read:locations"],
  });

  const [errors, setErrors] = useState({
    userId: "",
    description: "",
  });

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handlePermissionChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const { value, checked } = target;

    if (checked) {
      // Add permission
      setFormData({
        ...formData,
        permissions: [...formData.permissions, value],
      });
    } else {
      // Remove permission
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== value),
      });
    }
  };

  const validate = (): boolean => {
    const newErrors = {
      userId: "",
      description: "",
    };

    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
      onClose();

      // Reset form
      setFormData({
        userId: currentUserId,
        description: "",
        expiration: "never",
        permissions: ["read:users", "read:posts", "read:locations"],
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate New API Key">
      <form onSubmit={handleSubmit} class="space-y-4">
        {/* Only show userId field if it's not provided or empty */}
        {!currentUserId && (
          <div class="space-y-2">
            <label
              htmlFor="userId"
              class="block text-sm font-medium text-card-foreground"
            >
              User <span class="text-red-500">*</span>
            </label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              class={`w-full p-3 rounded-8 bg-background border ${
                errors.userId ? "border-red-500" : "border-border"
              } text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300`}
            >
              <option value="">Select a user</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && (
              <p class="text-sm text-red-500">{errors.userId}</p>
            )}
            <p class="text-xs text-muted-foreground">
              Select the user that this key will be associated with.
            </p>
          </div>
        )}

        <div class="space-y-2">
          <label
            htmlFor="description"
            class="block text-sm font-medium text-card-foreground"
          >
            Description <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="My Application Key"
            class={`w-full p-3 rounded-8 bg-background border ${
              errors.description ? "border-red-500" : "border-border"
            } text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300`}
          />
          {errors.description && (
            <p class="text-sm text-red-500">{errors.description}</p>
          )}
          <p class="text-xs text-muted-foreground">
            Add a descriptive name to help you identify this key later.
          </p>
        </div>

        <div class="space-y-2">
          <label
            htmlFor="expiration"
            class="block text-sm font-medium text-card-foreground"
          >
            Expiration
          </label>
          <select
            id="expiration"
            name="expiration"
            value={formData.expiration}
            onChange={handleChange}
            class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {expirationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p class="text-xs text-muted-foreground">
            Choose when this API key should expire. For security, we recommend
            setting an expiration date.
          </p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-card-foreground">
            Permissions
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availablePermissions.map((permission) => (
              <div key={permission.id} class="flex items-center">
                <input
                  type="checkbox"
                  id={`permission-${permission.id}`}
                  name="permissions"
                  value={permission.id}
                  checked={formData.permissions.includes(permission.id)}
                  onChange={handlePermissionChange}
                  class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor={`permission-${permission.id}`}
                  class="ml-2 block text-sm text-card-foreground"
                >
                  {permission.label}
                </label>
              </div>
            ))}
          </div>
          <p class="text-xs text-muted-foreground">
            Select the permissions this API key should have. By default, keys
            have read-only access.
          </p>
        </div>

        <div class="pt-4 border-t border-border flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Generate Key
          </Button>
        </div>
      </form>
    </Modal>
  );
}
