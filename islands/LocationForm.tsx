import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Modal from "./Modal.tsx";

interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location;
  onSubmit: (location: LocationFormData) => void;
  existingLocations: Location[];
}

// Local Location interface for the form
interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isMainLocation: boolean;
  description?: string;
}

export interface LocationFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  isMainLocation: boolean;
  description: string;
}

export default function LocationForm(
  { isOpen, onClose, location, onSubmit, existingLocations }: LocationFormProps,
) {
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    isMainLocation: false,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mainLocationWarning, setMainLocationWarning] = useState<boolean>(
    false,
  );

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        address: location.address,
        phone: location.phone,
        email: location.email,
        isMainLocation: location.isMainLocation,
        description: location.description || "",
      });
    } else {
      // Reset form when opening in create mode
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        isMainLocation: false,
        description: "",
      });
    }
    setErrors({});
    setMainLocationWarning(false);
  }, [location, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Location name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (validateForm()) {
      // Check if we're setting a new main location
      if (formData.isMainLocation && !location?.isMainLocation) {
        const hasMainLocation = existingLocations.some((loc) =>
          loc.isMainLocation && (!location || loc.id !== location.id)
        );

        if (hasMainLocation) {
          setMainLocationWarning(true);
          return;
        }
      }

      onSubmit(formData);
      onClose();
    }
  };

  const handleMainLocationConfirm = () => {
    onSubmit(formData);
    setMainLocationWarning(false);
    onClose();
  };

  const handleChange = (e: Event) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const value = target.type === "checkbox"
      ? (target as HTMLInputElement).checked
      : target.value;
    const name = target.name;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !mainLocationWarning}
        onClose={onClose}
        title={location ? "Edit Location" : "Add New Location"}
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {location ? "Update Location" : "Add Location"}
            </Button>
          </>
        }
      >
        <form class="space-y-4" onSubmit={handleSubmit}>
          <div class="space-y-2">
            <label
              for="name"
              class="block text-sm font-medium text-card-foreground"
            >
              Location Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              class={`w-full p-3 rounded-8 bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                errors.name ? "border-red-500" : "border-border"
              }`}
            />
            {errors.name && <p class="text-sm text-red-500">{errors.name}</p>}
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
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              class={`w-full p-3 rounded-8 bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                errors.address ? "border-red-500" : "border-border"
              }`}
            />
            {errors.address && (
              <p class="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label
                for="phone"
                class="block text-sm font-medium text-card-foreground"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                class={`w-full p-3 rounded-8 bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                  errors.phone ? "border-red-500" : "border-border"
                }`}
              />
              {errors.phone && (
                <p class="text-sm text-red-500">{errors.phone}</p>
              )}
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                class={`w-full p-3 rounded-8 bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                  errors.email ? "border-red-500" : "border-border"
                }`}
              />
              {errors.email && (
                <p class="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          <div class="space-y-2">
            <label
              for="description"
              class="block text-sm font-medium text-card-foreground"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              id="isMainLocation"
              name="isMainLocation"
              checked={formData.isMainLocation}
              onChange={handleChange}
              class="rounded-8 text-primary-600 focus:ring-primary-300 h-4 w-4 mr-2"
              disabled={location?.isMainLocation}
            />
            <label
              for="isMainLocation"
              class="text-sm font-medium text-card-foreground"
            >
              Set as main location
            </label>
          </div>

          {location?.isMainLocation && (
            <div class="p-3 bg-yellow-50 text-yellow-800 rounded-8 text-sm">
              This is currently set as the main location. To change the main
              location, please select a different location to make it the
              primary one.
            </div>
          )}
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={mainLocationWarning}
        onClose={() => setMainLocationWarning(false)}
        title="Change Main Location"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setMainLocationWarning(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleMainLocationConfirm}>
              Confirm Change
            </Button>
          </>
        }
      >
        <div class="p-4">
          <p class="text-card-foreground">
            You already have a main location set. Changing the main location
            will update your organization's primary address and contact
            information.
          </p>
          <p class="text-card-foreground mt-4">
            Are you sure you want to set <strong>{formData.name}</strong>{" "}
            as the new main location?
          </p>
        </div>
      </Modal>
    </>
  );
}
