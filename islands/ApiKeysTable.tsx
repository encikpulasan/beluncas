import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Card from "../components/Card.tsx";
import ApiKeyForm, { ApiKeyFormData } from "./ApiKeyForm.tsx";
import Modal from "../components/Modal.tsx";
import {
  ApiKey,
  apiKeys,
  auth,
  GenerateApiKeyRequest,
  User,
  users,
} from "../utils/api.ts";

export default function ApiKeysTable() {
  // Get current user information from auth service
  const [currentUser, setCurrentUser] = useState<
    { id: string; email: string; role: string } | null
  >(null);
  const [keysList, setKeysList] = useState<ApiKey[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<ApiKey | null>(null);

  useEffect(() => {
    // Get the current user
    const user = auth.getCurrentUser();
    setCurrentUser(user);

    // Load data
    fetchApiKeys();
    fetchUsers();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiKeys.getAll();
      setKeysList(data);
    } catch (err: any) {
      console.error("Failed to fetch API keys:", err);
      setError(err.message || "Failed to load API keys. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await users.getAll();
      setAllUsers(data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Helper to find user by ID
  const getUserById = (userId: string): User | undefined => {
    return allUsers.find((user) => user.id === userId);
  };

  // Helper to get user's full name
  const getUserFullName = (userId: string): string => {
    const user = getUserById(userId);
    if (user) {
      return user.name;
    }
    return userId; // Fall back to ID if user not found
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatRelativeTime = (dateString: string | null) => {
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

  const handleGenerateKey = async (formData: ApiKeyFormData) => {
    try {
      // Convert form data to API request format
      const requestData: GenerateApiKeyRequest = {
        userId: formData.userId,
        description: formData.description,
        expiration: formData.expiration,
        permissions: formData.permissions,
      };

      console.log("Sending API key request with data:", requestData);

      // Call API to generate key
      const response = await apiKeys.generate(requestData);
      console.log("API key response:", JSON.stringify(response));

      // For debugging, log the direct key value
      if (response.key && response.key.key) {
        console.log("API key value:", response.key.key);
      }

      // We should now have a properly formatted response with a key object
      const newKey = response.key;
      console.log("Processed API key:", JSON.stringify(newKey));

      // Update state with new key
      setKeysList([newKey, ...keysList]);

      // Store key for display and show in modal
      setNewApiKey(newKey);
      setShowKeyModal(true);
      showFormStatus("success", "API key generated successfully");
      setIsFormOpen(false);
    } catch (err: any) {
      console.error("Failed to generate API key:", err);
      showFormStatus("error", err.message || "Failed to generate API key");
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (
      confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone.",
      )
    ) {
      try {
        const key = keysList.find((k) => k.id === keyId);
        if (!key) return;

        await apiKeys.revoke(key.key);

        // Update key status locally (API might also return updated key)
        setKeysList(
          keysList.map((k) => k.id === keyId ? { ...k, active: false } : k),
        );

        showFormStatus("success", "API key revoked successfully");
      } catch (err: any) {
        showFormStatus("error", err.message || "Failed to revoke API key");
      }
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this API key? This action cannot be undone.",
      )
    ) {
      try {
        const key = keysList.find((k) => k.id === keyId);
        if (!key) return;

        await apiKeys.revoke(key.key); // In this case using revoke endpoint as delete

        // Remove key from list
        setKeysList(keysList.filter((k) => k.id !== keyId));

        showFormStatus("success", "API key deleted successfully");
      } catch (err: any) {
        showFormStatus("error", err.message || "Failed to delete API key");
      }
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
          <h1 class="text-2xl font-bold text-foreground">API Keys</h1>
          <p class="text-muted-foreground">
            Manage API keys for external integrations
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <span class="material-symbols-outlined mr-2">add</span>
          Generate New Key
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

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <Card title="API Keys" icon="vpn_key">
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
                    onClick={fetchApiKeys}
                  >
                    Retry
                  </Button>
                </div>
              )
              : (
                <div class="overflow-x-auto">
                  <table class="min-w-full">
                    <thead class="bg-muted">
                      <tr>
                        <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground rounded-tl-8">
                          Description
                        </th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                          Created By
                        </th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                          Last Used
                        </th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                          Created
                        </th>
                        <th class="py-3 px-4 text-left text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th class="py-3 px-4 text-right text-sm font-medium text-muted-foreground rounded-tr-8">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      {keysList.length === 0
                        ? (
                          <tr>
                            <td
                              colSpan={6}
                              class="py-8 text-center text-muted-foreground"
                            >
                              No API keys found. Generate your first key to get
                              started.
                            </td>
                          </tr>
                        )
                        : (
                          keysList.map((apiKey) => (
                            <tr key={apiKey.id} class="hover:bg-muted/50">
                              <td class="py-3 px-4">
                                <div>
                                  <p class="font-medium">
                                    {apiKey.description}
                                  </p>
                                  <p class="text-xs text-muted-foreground truncate max-w-xs">
                                    {apiKey.key}
                                  </p>
                                </div>
                              </td>
                              <td class="py-3 px-4 text-muted-foreground">
                                {getUserFullName(apiKey.createdBy)}
                              </td>
                              <td class="py-3 px-4 text-muted-foreground">
                                {formatRelativeTime(apiKey.lastUsed)}
                              </td>
                              <td class="py-3 px-4 text-muted-foreground">
                                {formatDate(apiKey.createdAt)}
                              </td>
                              <td class="py-3 px-4">
                                <span
                                  class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    apiKey.active
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {apiKey.active ? "Active" : "Revoked"}
                                </span>
                              </td>
                              <td class="py-3 px-4 text-right text-sm">
                                <div class="flex justify-end items-center space-x-2">
                                  {apiKey.active && (
                                    <Button
                                      variant="outline"
                                      onClick={() => handleRevokeKey(apiKey.id)}
                                    >
                                      <span class="material-symbols-outlined text-base">
                                        block
                                      </span>
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    class="text-red-500 hover:text-red-700"
                                    onClick={() =>
                                      handleDeleteKey(apiKey.id)}
                                  >
                                    <span class="material-symbols-outlined text-base">
                                      delete
                                    </span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
        </div>
        <div class="lg:col-span-1">
          <Card title="About API Keys" icon="info">
            <div class="p-4 space-y-4 text-sm text-muted-foreground">
              <p>
                API keys enable secure access to our API for third-party
                integrations.
              </p>
              <p>
                <span class="font-medium text-foreground">
                  Security notice:
                </span>{" "}
                API keys are shown only once when created. Store them in a
                secure location.
              </p>
              <p>
                <span class="font-medium text-foreground">
                  Best practices:
                </span>
              </p>
              <ul class="list-disc pl-5 space-y-1">
                <li>Use different keys for different integrations</li>
                <li>Limit key permissions to only what's needed</li>
                <li>Rotate keys regularly for better security</li>
                <li>Revoke unused or compromised keys immediately</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {isFormOpen && (
        <ApiKeyForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleGenerateKey}
          currentUserId={currentUser?.id || ""}
          availableUsers={allUsers}
        />
      )}

      {showKeyModal && newApiKey && (
        <Modal
          isOpen={showKeyModal}
          onClose={() => setShowKeyModal(false)}
          title="API Key Generated"
        >
          <div class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-8 p-4">
              <p class="text-yellow-800 font-medium mb-2">
                Copy your API key now!
              </p>
              <p class="text-yellow-700 text-sm">
                This is the only time you'll see this key. Make sure to copy it
                now and store it securely.
              </p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-card-foreground">
                Your API Key
              </label>
              <div class="flex">
                {newApiKey.key
                  ? (
                    <>
                      <input
                        type="text"
                        readOnly
                        value={newApiKey.key}
                        class="flex-1 p-3 rounded-l-8 bg-muted text-foreground font-mono text-sm border border-border focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(newApiKey.key);
                          showFormStatus(
                            "success",
                            "API key copied to clipboard",
                          );
                        }}
                        class="bg-primary-600 text-white px-4 rounded-r-8 hover:bg-primary-700 transition-colors"
                      >
                        <span class="material-symbols-outlined">
                          content_copy
                        </span>
                      </button>
                    </>
                  )
                  : (
                    <div class="flex-1 p-3 rounded-8 bg-red-50 text-red-700 border border-red-200">
                      <p class="font-medium">
                        The API key wasn't properly returned.
                      </p>
                      <p class="text-sm mt-1">The key data is:</p>
                      <pre class="mt-2 p-2 bg-red-100 rounded-md overflow-x-auto text-xs">
                      {JSON.stringify(newApiKey, null, 2)}
                      </pre>
                    </div>
                  )}
              </div>
            </div>

            <div class="pt-4 border-t border-border flex justify-end">
              <Button
                variant="primary"
                onClick={() => setShowKeyModal(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
