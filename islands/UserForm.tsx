import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import Modal from "../components/Modal.tsx";

export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: UserFormData) => void;
  user?: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  bio: string;
  profilePicture: string;
  dateOfBirth: string;
  interests: string;
  skills: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  bio: string;
  profilePicture: string;
  dateOfBirth: string;
  interests: string;
  skills: string;
  isActive: boolean;
}

// Available user roles
const userRoles = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "volunteer", label: "Volunteer" },
];

export default function UserForm(
  { isOpen, onClose, onSubmit, user }: UserFormProps,
) {
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    role: "volunteer",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    bio: "",
    profilePicture: "",
    dateOfBirth: "",
    interests: "",
    skills: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  // When editing a user, populate form with their data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        bio: user.bio,
        profilePicture: user.profilePicture,
        dateOfBirth: user.dateOfBirth,
        interests: user.interests,
        skills: user.skills,
        isActive: user.isActive,
      });
    } else {
      // Reset form for new user
      setFormData({
        username: "",
        email: "",
        role: "volunteer",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        bio: "",
        profilePicture: "",
        dateOfBirth: "",
        interests: "",
        skills: "",
        isActive: true,
      });
    }
    // Clear errors when form is opened
    setErrors({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    });
  }, [user, isOpen]);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;

    setFormData({
      ...formData,
      [name]: type === "checkbox"
        ? (target as HTMLInputElement).checked
        : value,
    });

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const re = /^\+?[\d\s-()]{10,}$/;
    return re.test(phone);
  };

  const validate = (): boolean => {
    const newErrors = {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Edit User" : "Add New User"}
    >
      <form onSubmit={handleSubmit} class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label
              htmlFor="username"
              class="block text-sm font-medium text-card-foreground"
            >
              Username <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              class={`w-full p-3 rounded-8 bg-background border ${
                errors.username ? "border-red-500" : "border-border"
              } text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300`}
            />
            {errors.username && (
              <p class="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div class="space-y-2">
            <label
              htmlFor="email"
              class="block text-sm font-medium text-card-foreground"
            >
              Email Address <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              class={`w-full p-3 rounded-8 bg-background border ${
                errors.email ? "border-red-500" : "border-border"
              } text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300`}
            />
            {errors.email && <p class="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div class="space-y-2">
            <label
              htmlFor="firstName"
              class="block text-sm font-medium text-card-foreground"
            >
              First Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              class={`w-full p-3 rounded-8 bg-background border ${
                errors.firstName ? "border-red-500" : "border-border"
              } text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300`}
            />
            {errors.firstName && (
              <p class="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div class="space-y-2">
            <label
              htmlFor="lastName"
              class="block text-sm font-medium text-card-foreground"
            >
              Last Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              class={`w-full p-3 rounded-8 bg-background border ${
                errors.lastName ? "border-red-500" : "border-border"
              } text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300`}
            />
            {errors.lastName && (
              <p class="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label
              htmlFor="phoneNumber"
              class="block text-sm font-medium text-card-foreground"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1234567890"
              class={`w-full p-3 rounded-8 bg-background border ${
                errors.phoneNumber ? "border-red-500" : "border-border"
              } text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300`}
            />
            {errors.phoneNumber && (
              <p class="text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          <div class="space-y-2">
            <label
              htmlFor="role"
              class="block text-sm font-medium text-card-foreground"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              {userRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <label
            htmlFor="address"
            class="block text-sm font-medium text-card-foreground"
          >
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St, City, State"
            class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div class="space-y-2">
          <label
            htmlFor="bio"
            class="block text-sm font-medium text-card-foreground"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            placeholder="Tell us about yourself..."
            class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label
              htmlFor="interests"
              class="block text-sm font-medium text-card-foreground"
            >
              Interests
            </label>
            <input
              type="text"
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="Community Service, Social Justice..."
              class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div class="space-y-2">
            <label
              htmlFor="skills"
              class="block text-sm font-medium text-card-foreground"
            >
              Skills
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Leadership, First Aid..."
              class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label
              htmlFor="dateOfBirth"
              class="block text-sm font-medium text-card-foreground"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div class="space-y-2">
            <label
              htmlFor="profilePicture"
              class="block text-sm font-medium text-card-foreground"
            >
              Profile Picture URL
            </label>
            <input
              type="url"
              id="profilePicture"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              placeholder="https://example.com/profile.jpg"
              class="w-full p-3 rounded-8 bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="isActive"
              class="ml-2 block text-sm text-card-foreground"
            >
              Active User
            </label>
          </div>
          <p class="text-xs text-muted-foreground">
            Inactive users cannot log in to the system.
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
            {user ? "Save Changes" : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
