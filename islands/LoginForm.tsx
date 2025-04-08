import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { auth, LoginRequest } from "../utils/api.ts";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Call login API
      const response = await auth.login(formData);
      console.log(
        "Login successful, token received:",
        response.token ? "✓" : "✗",
      );
      setLoginSuccess(true);

      // Redirect to admin index after successful login
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } catch (error: any) {
      // Handle CORS errors
      if (error.status === 0) {
        setErrors({
          general:
            "Unable to connect to the server. Please check if the API server is running and try again.",
        });
      } // Handle API errors
      else if (error.status === 401) {
        setErrors({
          general: "Invalid email or password",
        });
      } else {
        setErrors({
          general: error.message || "Login failed. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="bg-card border border-border rounded-12 shadow-sm p-6">
      {loginSuccess
        ? (
          <div class="p-4 mb-4 bg-green-50 text-green-800 rounded-8 text-center">
            <p>Login successful! Redirecting to dashboard...</p>
          </div>
        )
        : errors.general
        ? (
          <div class="p-4 mb-4 bg-red-50 text-red-800 rounded-8">
            <p>{errors.general}</p>
          </div>
        )
        : null}

      <form onSubmit={handleSubmit}>
        <div class="space-y-4">
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-card-foreground mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              class={`w-full p-3 rounded-8 bg-background border ${
                errors.email ? "border-red-500" : "border-border"
              } text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <p class="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-card-foreground mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              class={`w-full p-3 rounded-8 bg-background border ${
                errors.password ? "border-red-500" : "border-border"
              } text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && (
              <p class="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="remember"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label
                for="remember"
                class="ml-2 block text-sm text-muted-foreground"
              >
                Remember me
              </label>
            </div>

            <a
              href="#"
              class="text-sm text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </a>
          </div>

          <Button
            variant="primary"
            class="w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? (
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2">
                  </div>
                  Signing in...
                </div>
              )
              : (
                "Sign in"
              )}
          </Button>
        </div>
      </form>
    </div>
  );
}
