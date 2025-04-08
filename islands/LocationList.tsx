import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Card from "../components/Card.tsx";
import { Branch, locationApi } from "../utils/api.ts";
import LocationForm from "./LocationForm.tsx";

// This interface is used by LocationForm.tsx
// We need to adapt between this and Branch
interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isMainLocation: boolean;
  description?: string;
}

// This interface matches the one in LocationForm.tsx
interface LocationFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  isMainLocation: boolean;
  description: string;
}

export default function LocationList() {
  const [locations, setLocations] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Branch | undefined>(
    undefined,
  );
  const [formStatus, setFormStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await locationApi.getAll();
      setLocations(data);
    } catch (err: any) {
      console.error("Failed to fetch locations:", err);
      setError(err.message || "Failed to load locations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLocation = () => {
    setCurrentLocation(undefined);
    setIsFormOpen(true);
  };

  const handleEditLocation = (location: Branch) => {
    setCurrentLocation(location);
    setIsFormOpen(true);
  };

  // Adapt the LocationFormData to our API Branch type
  const handleFormSubmit = async (formData: LocationFormData) => {
    try {
      console.log("Form data:", formData);

      // Parse address parts from the address string
      const addressParts = formData.address.split(",").map((part) =>
        part.trim()
      );

      // Convert the form data to the format expected by the API
      const branchData = {
        name: formData.name,
        address: addressParts[0] || formData.address, // First part is street address
        city: addressParts[1] || "",
        state: addressParts[2] || "",
        country: "US", // Default country
        postalCode: addressParts[3] || "",
        phone: formData.phone,
        email: formData.email,
        isMainBranch: formData.isMainLocation,
      };

      console.log("Branch data to submit:", branchData);

      let updatedBranch: Branch;

      if (currentLocation) {
        // Edit existing location
        updatedBranch = await locationApi.update(
          currentLocation.id!,
          branchData,
        );
        setLocations(
          locations.map((loc) =>
            loc.id === updatedBranch.id ? updatedBranch : loc
          ),
        );
        showFormStatus("success", "Location updated successfully");
      } else {
        // Add new location
        updatedBranch = await locationApi.create(branchData);
        setLocations([...locations, updatedBranch]);
        showFormStatus("success", "Location created successfully");
      }

      setIsFormOpen(false);
    } catch (err: any) {
      console.error("Error saving location:", err);
      showFormStatus("error", err.message || "Failed to save location");
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this location? This action cannot be undone.",
      )
    ) {
      try {
        await locationApi.delete(locationId);
        setLocations(locations.filter((loc) => loc.id !== locationId));
        showFormStatus("success", "Location deleted successfully");
      } catch (err: any) {
        showFormStatus("error", err.message || "Failed to delete location");
      }
    }
  };

  const showFormStatus = (type: "success" | "error", message: string) => {
    setFormStatus({ type, message });
    // Auto-hide after 5 seconds
    setTimeout(() => setFormStatus(null), 5000);
  };

  // Format address for display
  const formatAddress = (branch: Branch) => {
    return `${branch.address}, ${branch.city}, ${branch.state} ${branch.postalCode}`;
  };

  // Convert Branch to Location for the form
  const branchToLocation = (branch: Branch): Location => {
    return {
      id: branch.id || "",
      name: branch.name,
      address: formatAddress(branch),
      phone: branch.phone,
      email: branch.email,
      isMainLocation: branch.isMainBranch,
      description: "", // Branch doesn't have a description field
    };
  };

  // Convert Branch[] to Location[] for the form
  const branchesToLocations = (branches: Branch[]): Location[] => {
    return branches.map((branch) => branchToLocation(branch));
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-semibold text-foreground">Locations</h2>
          <p class="text-muted-foreground">
            Manage your organization's locations
          </p>
        </div>
        <Button variant="primary" onClick={handleAddLocation}>
          <span class="material-symbols-outlined mr-2">add</span>
          Add Location
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

      <Card title="All Locations" icon="place">
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
              <Button variant="outline" class="mt-4" onClick={fetchLocations}>
                Retry
              </Button>
            </div>
          )
          : locations.length === 0
          ? (
            <div class="p-8 text-center">
              <p class="text-muted-foreground">
                No locations found. Add your first location to get started.
              </p>
            </div>
          )
          : (
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  class="border rounded-8 p-4 hover:border-primary-300 transition-colors"
                >
                  <div class="flex justify-between items-start">
                    <h3 class="font-medium text-foreground">{location.name}</h3>
                    <div class="flex space-x-1">
                      <button
                        onClick={() => handleEditLocation(location)}
                        class="p-1 hover:bg-muted rounded"
                      >
                        <span class="material-symbols-outlined text-primary-600 text-sm">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id!)}
                        class="p-1 hover:bg-muted rounded"
                      >
                        <span class="material-symbols-outlined text-red-600 text-sm">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                  <div class="mt-2 text-sm text-muted-foreground">
                    <p>{location.address}</p>
                    <p>
                      {location.city}, {location.state} {location.postalCode}
                    </p>
                    {location.phone && <p class="mt-1">📞 {location.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
      </Card>

      <LocationForm
        isOpen={isFormOpen}
        location={currentLocation
          ? branchToLocation(currentLocation)
          : undefined}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        existingLocations={branchesToLocations(locations)}
      />
    </div>
  );
}
