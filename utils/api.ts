// API client for Charity Shelter backend

// API Configuration
const API_BASE_URL = Deno.env.get("API_BASE_URL") || "http://localhost:8000";
const API_KEY = Deno.env.get("API_KEY") || ""; // Fallback to empty string if not set

// Token and user management
let authToken: string | null = null;
let currentUser: { id: string; email: string; role: string } | null = null;

// Store token in memory or localStorage
export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

// Store user in memory
export function setCurrentUser(
  user: { id: string; email: string; role: string } | null,
) {
  currentUser = user;
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
}

// Get headers for API requests
function getHeaders(requireAuth: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };

  if (requireAuth && authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
}

// API error response interface
interface ApiErrorResponse {
  message?: string;
  [key: string]: unknown;
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  method: string = "GET",
  data?: any,
  requireAuth: boolean = true,
  isFormData: boolean = false,
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders(requireAuth);

    // Remove Content-Type header for FormData requests
    if (isFormData) {
      delete headers["Content-Type"];
    }

    const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);

    console.log(`API Request: ${method} ${url}`);
    if (data) console.log("Request payload:", data);

    const response = await fetch(url, {
      method,
      headers,
      body,
      credentials: "include", // Include cookies if needed
      mode: "cors", // Explicitly set CORS mode
    });

    console.log(
      `API Response status: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      let errorMessage = `Error: ${response.status} ${response.statusText}`;
      let errorData: ApiErrorResponse = {};

      try {
        errorData = await response.json() as ApiErrorResponse;
        console.error("API Error response:", errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Failed to parse error response as JSON:", parseError);
      }

      throw {
        status: response.status,
        message: errorMessage,
        data: errorData,
      };
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    const result = await response.json();
    return result as T;
  } catch (error) {
    // Handle CORS errors specifically
    if (
      error instanceof TypeError && error.message.includes("Failed to fetch")
    ) {
      console.error("CORS or network error:", error);
      throw {
        status: 0,
        message:
          "CORS error: Unable to connect to the API. Please check if the API server is running and CORS is properly configured.",
      };
    }
    // Re-throw with improved error message
    if (error instanceof Error) {
      console.error("Fetch error:", error);
      throw { message: error.message, status: 500 };
    }
    throw error;
  }
}

// Auth API
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const auth = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetchApi<LoginResponse>(
      "/api/v1/auth/login",
      "POST",
      credentials,
      false,
    );
    // Store token and user for future requests
    setToken(response.token);
    setCurrentUser(response.user);
    return response;
  },

  logout: async (): Promise<void> => {
    await fetchApi<void>("/api/v1/auth/logout", "POST");
    setToken(null);
    setCurrentUser(null);
  },

  verifyToken: async (): Promise<boolean> => {
    try {
      // Only call if we have a token
      if (!authToken) return false;
      await fetchApi<any>(
        "/api/v1/auth/verify",
        "POST",
        { token: authToken },
        false,
      );
      return true;
    } catch (error) {
      setToken(null);
      setCurrentUser(null);
      return false;
    }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await fetchApi<void>("/api/v1/auth/change-password", "POST", data);
  },

  // Initialize auth from localStorage (call on app startup)
  initAuth: () => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("currentUser");

      if (storedToken) {
        authToken = storedToken;
        console.log("Auth token initialized from localStorage");
      }

      if (storedUser) {
        currentUser = JSON.parse(storedUser);
        console.log("User data initialized from localStorage");
      }
    } catch (err) {
      console.error("Error initializing auth from localStorage:", err);
    }
  },

  // Get the current auth token
  getToken: () => authToken,

  // Get the current user
  getCurrentUser: () => currentUser,
};

// Users API
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

export interface CreateUserRequest {
  username: string;
  email: string;
  password?: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  interests?: string;
  skills?: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  interests?: string;
  skills?: string;
  isActive?: boolean;
}

export const users = {
  getAll: async (): Promise<User[]> => {
    return await fetchApi<User[]>("/api/v1/admin/users");
  },

  getById: async (id: string): Promise<User> => {
    return await fetchApi<User>(`/api/v1/admin/users/${id}`);
  },

  create: async (userData: CreateUserRequest): Promise<User> => {
    return await fetchApi<User>("/api/v1/admin/users", "POST", userData);
  },

  update: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    return await fetchApi<User>(`/api/v1/admin/users/${id}`, "PUT", userData);
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi<void>(`/api/v1/admin/users/${id}`, "DELETE");
  },
};

// Posts API
export interface Post {
  id: string;
  title: string;
  content: string;
  subtitle?: string;
  summary?: string;
  type?: "article" | "news" | "announcement";
  imageUrl?: string;
  additionalImages?: string;
  author: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  tags: string;
  metaDescription?: string;
  status?: "draft" | "published" | "archived";
}

export interface CreatePostRequest {
  title: string;
  content: string;
  subtitle?: string;
  summary?: string;
  type?: "article" | "news" | "announcement";
  imageUrl?: string;
  additionalImages?: string;
  author?: string;
  category?: string;
  tags: string;
  isPublished: boolean;
  metaDescription?: string;
  status?: "draft" | "published" | "archived";
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  subtitle?: string;
  summary?: string;
  type?: "article" | "news" | "announcement";
  imageUrl?: string;
  additionalImages?: string;
  author?: string;
  category?: string;
  tags?: string;
  isPublished?: boolean;
  metaDescription?: string;
  status?: "draft" | "published" | "archived";
}

export const posts = {
  getAll: async (): Promise<Post[]> => {
    console.log("API: Getting all posts");
    try {
      const result = await fetchApi<Post[]>("/api/v1/admin/posts");
      console.log("API: Posts retrieved successfully", result);
      return result;
    } catch (error) {
      console.error("API: Error getting posts", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Post> => {
    console.log(`API: Getting post by id ${id}`);
    try {
      const result = await fetchApi<Post>(`/api/v1/admin/posts/${id}`);
      console.log("API: Post retrieved successfully", result);
      return result;
    } catch (error) {
      console.error(`API: Error getting post ${id}`, error);
      throw error;
    }
  },

  create: async (postData: CreatePostRequest): Promise<Post> => {
    // Make a clean copy without modifying isPublished
    const formattedData = {
      ...postData,
      // Explicitly preserve the boolean value, don't convert
      isPublished: postData.isPublished,
    };

    console.log(
      "API: Creating new post",
      formattedData,
      "isPublished type:",
      typeof formattedData.isPublished,
    );
    try {
      const result = await fetchApi<Post>(
        "/api/v1/admin/posts",
        "POST",
        formattedData,
      );
      console.log("API: Post created successfully", result);
      return result;
    } catch (error) {
      console.error("API: Error creating post", error);
      throw error;
    }
  },

  update: async (id: string, postData: UpdatePostRequest): Promise<Post> => {
    // Make a clean copy without modifying isPublished
    const formattedData = {
      ...postData,
    };

    // Log the isPublished value if present
    if ("isPublished" in postData) {
      console.log(
        `isPublished value before sending: ${postData.isPublished}, type: ${typeof postData
          .isPublished}`,
      );
    }

    console.log(`API: Updating post ${id}`, formattedData);
    try {
      const result = await fetchApi<Post>(
        `/api/v1/admin/posts/${id}`,
        "PUT",
        formattedData,
      );
      console.log("API: Post updated successfully", result);
      return result;
    } catch (error) {
      console.error(`API: Error updating post ${id}`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    console.log(`API: Deleting post ${id}`);
    try {
      await fetchApi<void>(`/api/v1/admin/posts/${id}`, "DELETE");
      console.log(`API: Post ${id} deleted successfully`);
    } catch (error) {
      console.error(`API: Error deleting post ${id}`, error);
      throw error;
    }
  },

  search: async (term: string): Promise<Post[]> => {
    console.log(`API: Searching posts with term "${term}"`);
    try {
      const result = await fetchApi<Post[]>(
        `/api/v1/admin/posts/search/${term}`,
      );
      console.log("API: Posts search successful", result);
      return result;
    } catch (error) {
      console.error(`API: Error searching posts with term "${term}"`, error);
      throw error;
    }
  },

  togglePublish: async (id: string, isPublished: boolean): Promise<Post> => {
    console.log(`API: Toggling post ${id} publish status to ${isPublished}`);
    try {
      const result = await fetchApi<Post>(
        `/api/v1/admin/posts/${id}/publish`,
        "PATCH",
        {
          isPublished,
        },
      );
      console.log(
        `API: Post ${id} publish status toggled successfully`,
        result,
      );
      return result;
    } catch (error) {
      console.error(`API: Error toggling post ${id} publish status`, error);
      throw error;
    }
  },
};

// Organization API
export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

export interface OrganizationData {
  id?: string;
  name: string;
  description: string;
  type: string;
  contactInfo: ContactInfo;
  branches?: Branch[];

  // Legacy fields for backward compatibility
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  foundedYear?: string;
  missionStatement?: string;
}

export interface Branch {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  isMainBranch: boolean;
}

export interface CreateBranchRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  isMainBranch: boolean;
}

export interface UpdateBranchRequest {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isMainBranch?: boolean;
}

export const organization = {
  // Legacy methods for backward compatibility
  getInfo: async (): Promise<OrganizationData> => {
    // Get the first organization or create a mock one if none exists
    const orgs = await fetchApi<OrganizationData[]>(
      "/api/v1/organizations",
      "GET",
      undefined,
      false,
    );
    return orgs.length > 0 ? orgs[0] : {
      name: "Your Organization",
      description: "Organization description",
      type: "charity",
      contactInfo: {
        phone: "",
        email: "",
        address: "",
      },
    };
  },

  updateInfo: async (data: any): Promise<OrganizationData> => {
    // Prepare the data in the format expected by the API
    const apiData = {
      name: data.name,
      description: data.description,
      type: data.type || "charity",
      contactInfo: {
        phone: data.phone || data.contactInfo?.phone || "",
        email: data.email || data.contactInfo?.email || "",
        address: data.address || data.contactInfo?.address || "",
      },
    };

    // If we have an ID, update the organization, otherwise create a new one
    if (data.id) {
      return await fetchApi<OrganizationData>(
        `/api/v1/organizations/${data.id}`,
        "PUT",
        apiData,
      );
    } else {
      return await fetchApi<OrganizationData>(
        "/api/v1/organizations",
        "POST",
        apiData,
      );
    }
  },

  // Get all organizations
  getAllOrganizations: async (): Promise<OrganizationData[]> => {
    return await fetchApi<OrganizationData[]>(
      "/api/v1/organizations",
      "GET",
      undefined,
      false,
    );
  },

  // Get organization by ID
  getOrganizationById: async (id: string): Promise<OrganizationData> => {
    return await fetchApi<OrganizationData>(
      `/api/v1/organizations/${id}`,
      "GET",
      undefined,
      false,
    );
  },

  // Create new organization
  createOrganization: async (
    data: OrganizationData,
  ): Promise<OrganizationData> => {
    return await fetchApi<OrganizationData>(
      "/api/v1/organizations",
      "POST",
      data,
    );
  },

  // Update organization
  updateOrganization: async (
    id: string,
    data: OrganizationData,
  ): Promise<OrganizationData> => {
    return await fetchApi<OrganizationData>(
      `/api/v1/organizations/${id}`,
      "PUT",
      data,
    );
  },

  // Delete organization
  deleteOrganization: async (id: string): Promise<void> => {
    await fetchApi<void>(
      `/api/v1/organizations/${id}`,
      "DELETE",
    );
  },

  // Get all branches for an organization
  getBranches: async (organizationId: string): Promise<Branch[]> => {
    return await fetchApi<Branch[]>(
      `/api/v1/organizations/${organizationId}/branches`,
    );
  },

  // Get branch by ID
  getBranchById: async (
    organizationId: string,
    branchId: string,
  ): Promise<Branch> => {
    return await fetchApi<Branch>(
      `/api/v1/organizations/${organizationId}/branches/${branchId}`,
    );
  },

  // Create branch
  createBranch: async (
    organizationId: string,
    data: CreateBranchRequest,
  ): Promise<Branch> => {
    return await fetchApi<Branch>(
      `/api/v1/organizations/${organizationId}/branches`,
      "POST",
      data,
    );
  },

  // Update branch
  updateBranch: async (
    organizationId: string,
    branchId: string,
    data: UpdateBranchRequest,
  ): Promise<Branch> => {
    return await fetchApi<Branch>(
      `/api/v1/organizations/${organizationId}/branches/${branchId}`,
      "PUT",
      data,
    );
  },

  // Delete branch
  deleteBranch: async (
    organizationId: string,
    branchId: string,
  ): Promise<void> => {
    await fetchApi<void>(
      `/api/v1/organizations/${organizationId}/branches/${branchId}`,
      "DELETE",
    );
  },
};

export const locationApi = {
  getAll: async (): Promise<Branch[]> => {
    // Use organization endpoint to get all organizations, then extract locations from the first one
    const orgs = await fetchApi<OrganizationData[]>("/api/v1/organizations");
    // If organizations exist and the first one has branches, return them
    if (orgs && orgs.length > 0 && orgs[0].branches) {
      return orgs[0].branches;
    }
    // Otherwise return empty array
    return [];
  },

  getById: async (id: string): Promise<Branch> => {
    // Since we don't have a direct endpoint for branches by ID,
    // get all branches and filter for the one we want
    const branches = await locationApi.getAll();
    const branch = branches.find((b) => b.id === id);
    if (!branch) {
      throw new Error(`Branch with ID ${id} not found`);
    }
    return branch;
  },

  create: async (data: any): Promise<Branch> => {
    try {
      // Get the first organization ID
      const orgs = await fetchApi<OrganizationData[]>("/api/v1/organizations");
      if (!orgs || orgs.length === 0) {
        throw new Error("No organization found to add branch to");
      }

      // Format branch data correctly
      const branchData = {
        name: data.name,
        address: data.address,
        city: data.city || "",
        state: data.state || "",
        country: data.country || "US",
        postalCode: data.postalCode || "",
        phone: data.phone || "",
        email: data.email || "",
        isMainBranch: data.isMainBranch === true,
      };

      console.log("Creating branch with data:", branchData);

      // Add branch to the first organization
      return await fetchApi<Branch>(
        `/api/v1/organizations/${orgs[0].id}/branches`,
        "POST",
        branchData,
      );
    } catch (error) {
      console.error("Failed to create branch:", error);
      throw error;
    }
  },

  update: async (id: string, data: any): Promise<Branch> => {
    try {
      // Get the first organization ID
      const orgs = await fetchApi<OrganizationData[]>("/api/v1/organizations");
      if (!orgs || orgs.length === 0) {
        throw new Error("No organization found to update branch in");
      }

      // Format branch data correctly
      const branchData = {
        name: data.name,
        address: data.address,
        city: data.city || "",
        state: data.state || "",
        country: data.country || "US",
        postalCode: data.postalCode || "",
        phone: data.phone || "",
        email: data.email || "",
        isMainBranch: data.isMainBranch === true,
      };

      console.log("Updating branch with data:", branchData);

      return await fetchApi<Branch>(
        `/api/v1/organizations/${orgs[0].id}/branches/${id}`,
        "PUT",
        branchData,
      );
    } catch (error) {
      console.error(`Failed to update branch ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    // Get the first organization ID
    const orgs = await fetchApi<OrganizationData[]>("/api/v1/organizations");
    if (!orgs || orgs.length === 0) {
      throw new Error("No organization found to delete branch from");
    }

    await fetchApi<void>(
      `/api/v1/organizations/${orgs[0].id}/branches/${id}`,
      "DELETE",
    );
  },
};

// API Keys API
export interface ApiKey {
  id: string;
  key: string;
  description: string;
  createdBy: string;
  createdAt: string;
  lastUsed: string | null;
  active: boolean;
  permissions: string[];
  expiresAt: string | null;
}

export interface GenerateApiKeyRequest {
  userId: string;
  description: string;
  expiration: string; // "never" or days like "30d", "90d"
  permissions: string[];
}

export interface ApiKeyResponse {
  key: ApiKey;
}

export const apiKeys = {
  getAll: async (): Promise<ApiKey[]> => {
    return await fetchApi<ApiKey[]>("/api/v1/admin/api-keys");
  },

  generate: async (data: GenerateApiKeyRequest): Promise<ApiKeyResponse> => {
    console.log("Sending API key generation request:", data);
    try {
      const response = await fetchApi<any>(
        "/api/v1/admin/api-keys",
        "POST",
        data,
      );
      console.log("Raw API key response:", response);

      // Create a valid response object based on what the server returns
      let apiKeyResponse: ApiKeyResponse;

      // Case 1: API returns {key: {key: string, ...}} (as expected)
      if (
        response && response.key && typeof response.key === "object" &&
        response.key.key
      ) {
        apiKeyResponse = response as ApiKeyResponse;
      } // Case 2: API returns {key: string} (the API key directly)
      else if (response && response.key && typeof response.key === "string") {
        // Construct a full ApiKey object with the key string
        const keyString = response.key;
        apiKeyResponse = {
          key: {
            id: crypto.randomUUID(), // Generate a temporary ID
            key: keyString,
            description: data.description,
            createdBy: data.userId,
            createdAt: new Date().toISOString(),
            lastUsed: null,
            active: true,
            permissions: data.permissions,
            expiresAt: null,
          },
        };
      } // Case 3: API returns the key string directly
      else if (response && typeof response === "string") {
        const keyString = response;
        apiKeyResponse = {
          key: {
            id: crypto.randomUUID(), // Generate a temporary ID
            key: keyString,
            description: data.description,
            createdBy: data.userId,
            createdAt: new Date().toISOString(),
            lastUsed: null,
            active: true,
            permissions: data.permissions,
            expiresAt: null,
          },
        };
      } // Case 4: API returns the ApiKey object directly
      else if (response && response.id && response.key) {
        apiKeyResponse = {
          key: response as ApiKey,
        };
      } else {
        console.error("Invalid API key response format:", response);
        throw new Error("API returned an invalid response format");
      }

      return apiKeyResponse;
    } catch (error) {
      console.error("API key generation error:", error);
      throw error;
    }
  },

  revoke: async (key: string): Promise<void> => {
    await fetchApi<void>(`/api/v1/admin/api-keys/${key}`, "DELETE");
  },
};

// Stats API for dashboard
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalLocations: number;
  apiRequests: number;
  userChange: number;
  postChange: number;
  requestChange: number;
  recentActivity: {
    type: string;
    user: string;
    action: string;
    timestamp: string;
  }[];
  popularPosts: {
    id: string;
    title: string;
    views: number;
  }[];
}

export const stats = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return await fetchApi<DashboardStats>("/api/v1/admin/stats/dashboard");
  },
};

// Analytics API with dashboard endpoint
export interface UserStats {
  total: number;
  change: number;
  active: number;
  new: number;
}

export interface PostStats {
  total: number;
  change: number;
  published: number;
  drafts: number;
  popular: {
    id: string;
    title: string;
    views: number;
  }[];
}

export interface LocationStats {
  total: number;
  active: number;
  inactive: number;
}

export interface RequestStats {
  total: number;
  change: number;
  byEndpoint: {
    endpoint: string;
    count: number;
  }[];
}

export interface ActivityItem {
  type: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface DashboardAnalytics {
  userStats: UserStats;
  postStats: PostStats;
  locationStats: LocationStats;
  requestStats: RequestStats;
  recentActivity: ActivityItem[];
  lastUpdated: string;
}

export const analytics = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    return await fetchApi<DashboardAnalytics>("/api/v1/admin/dashboard");
  },

  // Legacy separate endpoints - can be removed if not used
  getUserStats: async (): Promise<UserStats> => {
    return await fetchApi<UserStats>("/api/v1/admin/analytics/users");
  },

  getPostStats: async (): Promise<PostStats> => {
    return await fetchApi<PostStats>("/api/v1/admin/analytics/posts");
  },

  getLocationStats: async (): Promise<LocationStats> => {
    return await fetchApi<LocationStats>("/api/v1/admin/analytics/locations");
  },

  getRequestStats: async (): Promise<RequestStats> => {
    return await fetchApi<RequestStats>("/api/v1/admin/analytics/requests");
  },

  getRecentActivity: async (): Promise<ActivityItem[]> => {
    return await fetchApi<ActivityItem[]>("/api/v1/admin/analytics/activities");
  },
};

// Settings API
export interface UserSettings extends User {
  notifications: {
    email: boolean;
    system: boolean;
    marketing: boolean;
  };
}

export const settings = {
  get: async (): Promise<UserSettings> => {
    return await fetchApi<UserSettings>("/api/v1/admin/settings", "GET");
  },

  update: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    return await fetchApi<UserSettings>("/api/v1/admin/settings", "PUT", data);
  },

  uploadProfilePicture: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    return await fetchApi<{ url: string }>(
      "/api/v1/admin/settings/profile-picture",
      "POST",
      formData,
      true,
      true, // isFormData
    );
  },
};

export default {
  auth,
  users,
  posts,
  organization,
  apiKeys,
  stats,
  locationApi,
  settings,
  analytics,
};
