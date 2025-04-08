import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { auth, User } from "../utils/api.ts";

interface SettingsFormProps {
  initialUser?: User;
}

export default function SettingsForm({ initialUser }: SettingsFormProps) {
  const [user, setUser] = useState<Partial<User>>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    phoneNumber: "",
    address: "",
    bio: "",
    profilePicture: "",
    dateOfBirth: "",
    interests: "",
    skills: "",
    ...initialUser,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const currentUser = auth.getCurrentUser();
      if (currentUser) {
        setUser((prev) => ({
          ...prev,
          ...currentUser,
        }));
      }
    } catch (err) {
      console.error("Failed to load current user:", err);
      setError("Failed to load user data");
    }
  };

  const handleInputChange = (
    e: Event,
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    setUser((prev) => ({
      ...prev,
      [target.id]: target.value,
    }));
  };

  const handleImageUpload = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB
      setError("Image size must be less than 1MB");
      return;
    }

    try {
      // TODO: Implement image upload to server
      // For now, create a data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({
          ...prev,
          profilePicture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to upload image:", err);
      setError("Failed to upload image");
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Implement API call to update user settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess(true);
    } catch (err) {
      console.error("Failed to update settings:", err);
      setError("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div class="mb-6 p-4 rounded-8 bg-red-50 text-red-800">
          <div class="flex items-center">
            <span class="material-symbols-outlined mr-2">error</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div class="mb-6 p-4 rounded-8 bg-green-50 text-green-800">
          <div class="flex items-center">
            <span class="material-symbols-outlined mr-2">check_circle</span>
            <p>Settings updated successfully</p>
          </div>
        </div>
      )}

      <div class="space-y-6">
        <div id="account">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-card-foreground">
                Profile Picture
              </label>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-xl font-semibold">
                  {user.profilePicture
                    ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        class="w-full h-full rounded-full object-cover"
                      />
                    )
                    : getInitials(user.firstName || "", user.lastName || "")}
                </div>
                <div>
                  <Button
                    variant="outline"
                    class="mb-2"
                    onClick={() =>
                      document.getElementById("profile-picture")?.click()}
                  >
                    <span class="material-symbols-outlined mr-2">
                      upload
                    </span>
                    Upload New Image
                  </Button>
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    class="hidden"
                    onChange={handleImageUpload}
                  />
                  <p class="text-xs text-muted-foreground">
                    JPG, GIF or PNG. Max size 1MB.
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label
                  for="username"
                  class="block text-sm font-medium text-card-foreground"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={user.username}
                  onChange={handleInputChange}
                  class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div class="space-y-2">
                <label
                  for="email"
                  class="block text-sm font-medium text-card-foreground"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  onChange={handleInputChange}
                  class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div class="space-y-2">
                <label
                  for="firstName"
                  class="block text-sm font-medium text-card-foreground"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={user.firstName}
                  onChange={handleInputChange}
                  class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div class="space-y-2">
                <label
                  for="lastName"
                  class="block text-sm font-medium text-card-foreground"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={user.lastName}
                  onChange={handleInputChange}
                  class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div class="space-y-2">
                <label
                  for="role"
                  class="block text-sm font-medium text-card-foreground"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={user.role}
                  onChange={handleInputChange}
                  class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div class="space-y-2">
                <label
                  for="phoneNumber"
                  class="block text-sm font-medium text-card-foreground"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={user.phoneNumber}
                  onChange={handleInputChange}
                  class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label
                for="address"
                class="block text-sm font-medium text-card-foreground"
              >
                Address
              </label>
              <textarea
                id="address"
                value={user.address}
                onChange={handleInputChange}
                rows={3}
                class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            <div class="space-y-2">
              <label
                for="bio"
                class="block text-sm font-medium text-card-foreground"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={user.bio}
                onChange={handleInputChange}
                rows={4}
                class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label
                  for="dateOfBirth"
                  class="block text-sm font-medium text-card-foreground"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={user.dateOfBirth}
                  onChange={handleInputChange}
                  class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label
                for="interests"
                class="block text-sm font-medium text-card-foreground"
              >
                Interests
              </label>
              <input
                type="text"
                id="interests"
                value={user.interests}
                onChange={handleInputChange}
                placeholder="Separate interests with commas"
                class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>

            <div class="space-y-2">
              <label
                for="skills"
                class="block text-sm font-medium text-card-foreground"
              >
                Skills
              </label>
              <input
                type="text"
                id="skills"
                value={user.skills}
                onChange={handleInputChange}
                placeholder="Separate skills with commas"
                class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>
        </div>

        <div id="notifications">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-card-foreground">
                  Email Notifications
                </p>
                <p class="text-sm text-muted-foreground">
                  Receive emails about account activity
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  checked={emailNotifications}
                  onChange={(e) =>
                    setEmailNotifications(
                      (e.target as HTMLInputElement).checked,
                    )}
                />
                <div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600">
                </div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-card-foreground">
                  System Notifications
                </p>
                <p class="text-sm text-muted-foreground">
                  Receive in-app notifications
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  checked={systemNotifications}
                  onChange={(e) =>
                    setSystemNotifications(
                      (e.target as HTMLInputElement).checked,
                    )}
                />
                <div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600">
                </div>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-card-foreground">
                  Marketing Emails
                </p>
                <p class="text-sm text-muted-foreground">
                  Receive emails about new features
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  checked={marketingEmails}
                  onChange={(e) =>
                    setMarketingEmails((e.target as HTMLInputElement).checked)}
                />
                <div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600">
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading && (
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2">
              </div>
            )}
            <span class="material-symbols-outlined mr-2">save</span>
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}
