import { useEffect, useState } from "preact/hooks";
import { organization, OrganizationData } from "../utils/api.ts";
import Card from "../components/Card.tsx";
import { Button } from "../components/Button.tsx";

export default function OrganizationList() {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchLocations(selectedOrg);
    } else {
      setLocations([]);
    }
  }, [selectedOrg]);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organization.getAllOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      console.error("Failed to fetch organizations:", err);
      setError(err.message || "Failed to load organizations");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async (orgId: string) => {
    try {
      const data = await organization.getOrganizationLocations(orgId);
      setLocations(data);
    } catch (err: any) {
      console.error(`Failed to fetch locations for org ${orgId}:`, err);
      setLocations([]);
    }
  };

  const viewOrgDetails = (orgId: string) => {
    setSelectedOrg(orgId === selectedOrg ? null : orgId);
  };

  if (isLoading) {
    return (
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600">
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="p-8 text-center">
        <span class="material-symbols-outlined text-red-500 text-4xl mb-2">
          error
        </span>
        <p class="text-red-600">{error}</p>
        <Button
          variant="outline"
          class="mt-4"
          onClick={fetchOrganizations}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      <h2 class="text-2xl font-bold">Our Organizations</h2>

      {organizations.length === 0
        ? <p class="text-muted-foreground">No organizations found.</p>
        : (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} class="overflow-hidden">
                <div class="p-6">
                  <h3 class="text-xl font-bold mb-2">{org.name}</h3>
                  <p class="text-muted-foreground mb-4">{org.description}</p>

                  <div class="space-y-2 mb-4">
                    <div class="flex items-start">
                      <span class="material-symbols-outlined text-muted-foreground mr-2">
                        location_on
                      </span>
                      <p>{org.address}</p>
                    </div>

                    <div class="flex items-start">
                      <span class="material-symbols-outlined text-muted-foreground mr-2">
                        phone
                      </span>
                      <p>{org.phone}</p>
                    </div>

                    <div class="flex items-start">
                      <span class="material-symbols-outlined text-muted-foreground mr-2">
                        email
                      </span>
                      <p>{org.email}</p>
                    </div>

                    <div class="flex items-start">
                      <span class="material-symbols-outlined text-muted-foreground mr-2">
                        public
                      </span>
                      <p>{org.website}</p>
                    </div>
                  </div>

                  <Button
                    variant={selectedOrg === org.id ? "primary" : "outline"}
                    onClick={() =>
                      viewOrgDetails(org.id || "")}
                    class="w-full mt-4"
                  >
                    {selectedOrg === org.id
                      ? "Hide Locations"
                      : "View Locations"}
                  </Button>
                </div>

                {selectedOrg === org.id && (
                  <div class="bg-muted p-6 mt-2 border-t border-border">
                    <h4 class="font-medium mb-4">Locations</h4>

                    {locations.length === 0
                      ? <p class="text-muted-foreground">No locations found.</p>
                      : (
                        <div class="space-y-4">
                          {locations.map((location) => (
                            <div
                              key={location.id}
                              class="p-4 bg-background rounded-8 border border-border"
                            >
                              <div class="flex justify-between items-start">
                                <h5 class="font-medium">{location.name}</h5>
                                {location.isMainLocation && (
                                  <span class="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                                    Main Location
                                  </span>
                                )}
                              </div>

                              <p class="text-sm text-muted-foreground mt-1 mb-3">
                                {location.description}
                              </p>

                              <div class="text-sm space-y-1">
                                <p>{location.address}</p>
                                <p>{location.phone}</p>
                                <p>{location.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
