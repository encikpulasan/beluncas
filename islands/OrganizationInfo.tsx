import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Card from "../components/Card.tsx";
import { organization, OrganizationData } from "../utils/api.ts";

export default function OrganizationInfo() {
  const [organizationData, setOrganizationData] = useState<
    OrganizationData | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<
    {
      type: "success" | "error";
      message: string;
    } | null
  >(null);

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await organization.getInfo();
      setOrganizationData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch organization data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoSubmit = async (formData: OrganizationData) => {
    try {
      setError(null);
      const updatedData = await organization.updateInfo(formData);
      setOrganizationData(updatedData);
      setIsFormOpen(false);
      showFormStatus(
        "success",
        "Organization information updated successfully",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update organization data",
      );
      showFormStatus("error", "Failed to update organization data");
    }
  };

  const showFormStatus = (type: "success" | "error", message: string) => {
    setFormStatus({ type, message });
    setTimeout(() => setFormStatus(null), 5000);
  };

  const formatPhone = (phone: string | undefined) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return phone;
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            Organization Information
          </h2>
          <p class="text-gray-500">Basic details about your organization</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>Edit Information</Button>
      </div>

      {isLoading
        ? (
          <div class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500">
            </div>
          </div>
        )
        : error
        ? (
          <div
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span class="block sm:inline">{error}</span>
          </div>
        )
        : organizationData
        ? (
          <Card>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Organization Name
                </h3>
                <p class="text-gray-900">{organizationData.name}</p>
              </div>
              {organizationData?.foundedYear !== undefined && (
                <div class="mb-4">
                  <label class="block text-sm font-medium text-card-foreground mb-1">
                    Founded Year
                  </label>
                  <div class="px-4 py-2 bg-muted rounded-8">
                    {String(organizationData.foundedYear)}
                  </div>
                </div>
              )}
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                <p class="text-gray-900">
                  {formatPhone(organizationData.phone)}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Email</h3>
                <p class="text-gray-900">{organizationData.email}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Website</h3>
                <p class="text-gray-900">
                  <a
                    href={organizationData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline"
                  >
                    {organizationData.website}
                  </a>
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Social Media
                </h3>
                <div class="flex space-x-3">
                  {organizationData.socialMedia?.facebook && (
                    <a
                      href={organizationData.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <span class="material-symbols-outlined">facebook</span>
                    </a>
                  )}
                  {organizationData.socialMedia?.twitter && (
                    <a
                      href={organizationData.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <span class="material-symbols-outlined">twitter</span>
                    </a>
                  )}
                  {organizationData.socialMedia?.instagram && (
                    <a
                      href={organizationData.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <span class="material-symbols-outlined">instagram</span>
                    </a>
                  )}
                </div>
              </div>
              {organizationData.missionStatement && (
                <div class="md:col-span-2">
                  <h3 class="text-sm font-medium text-gray-500 mb-1">
                    Mission Statement
                  </h3>
                  <p class="text-gray-900">
                    {organizationData.missionStatement}
                  </p>
                </div>
              )}
              <div class="md:col-span-2">
                <h3 class="text-sm font-medium text-gray-500 mb-1">
                  Description
                </h3>
                <p class="text-gray-900 whitespace-pre-line">
                  {organizationData.description}
                </p>
              </div>
            </div>
          </Card>
        )
        : (
          <Card>
            <div class="text-center py-8">
              <p class="text-gray-500">No organization information available</p>
            </div>
          </Card>
        )}

      {isFormOpen && organizationData && (
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">
                  Edit Organization Information
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  class="text-gray-400 hover:text-gray-500"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const data: OrganizationData = {
                    name: formData.get("name") as string,
                    description: formData.get("description") as string,
                    type: "charity", // Default type
                    contactInfo: {
                      address: formData.get("address") as string,
                      phone: formData.get("phone") as string,
                      email: formData.get("email") as string,
                    },
                    // Legacy fields for backward compatibility
                    phone: formData.get("phone") as string,
                    email: formData.get("email") as string,
                    address: formData.get("address") as string,
                    website: formData.get("website") as string,
                    foundedYear: formData.get("foundedYear")
                      ? String(formData.get("foundedYear"))
                      : undefined,
                    missionStatement:
                      formData.get("missionStatement") as string || undefined,
                    socialMedia: {
                      facebook: formData.get("facebook") as string,
                      twitter: formData.get("twitter") as string,
                      instagram: formData.get("instagram") as string,
                      youtube: formData.get("youtube") as string,
                    },
                  };
                  handleInfoSubmit(data);
                }}
                class="space-y-4"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      for="name"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Organization Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      defaultValue={organizationData.name}
                      required
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      for="foundedYear"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Founded Year
                    </label>
                    <input
                      type="number"
                      id="foundedYear"
                      name="foundedYear"
                      defaultValue={organizationData.foundedYear}
                      min="1800"
                      max={new Date().getFullYear()}
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      for="phone"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      defaultValue={organizationData.phone}
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      for="email"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={organizationData.email}
                      required
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      for="website"
                      class="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      defaultValue={organizationData.website}
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Social Media
                    </label>
                    <div class="space-y-2">
                      <div class="flex items-center">
                        <span class="material-symbols-outlined mr-2">
                          facebook
                        </span>
                        <input
                          type="url"
                          id="facebook"
                          name="facebook"
                          defaultValue={organizationData.socialMedia
                            ?.facebook || ""}
                          placeholder="Facebook URL"
                          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="flex items-center">
                        <span class="material-symbols-outlined mr-2">
                          twitter
                        </span>
                        <input
                          type="url"
                          id="twitter"
                          name="twitter"
                          defaultValue={organizationData.socialMedia?.twitter ||
                            ""}
                          placeholder="Twitter URL"
                          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="flex items-center">
                        <span class="material-symbols-outlined mr-2">
                          instagram
                        </span>
                        <input
                          type="url"
                          id="instagram"
                          name="instagram"
                          defaultValue={organizationData.socialMedia
                            ?.instagram || ""}
                          placeholder="Instagram URL"
                          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    for="missionStatement"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mission Statement
                  </label>
                  <input
                    type="text"
                    id="missionStatement"
                    name="missionStatement"
                    defaultValue={organizationData.missionStatement}
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    for="description"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={organizationData.description}
                    rows={4}
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  </textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {formStatus && (
        <div
          class={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            formStatus.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {formStatus.message}
        </div>
      )}
    </div>
  );
}
