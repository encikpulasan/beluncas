import { useEffect, useState } from "preact/hooks";
import { auth } from "../utils/api.ts";

export default function AuthCheck() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Initialize authentication from localStorage
    auth.initAuth();

    // Check if user is authenticated
    const checkAuth = async () => {
      setIsChecking(true);
      try {
        const isValid = await auth.verifyToken();
        if (!isValid) {
          console.log("Not authenticated, redirecting to login");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "/login";
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // If we're still checking, show a loading spinner
  if (isChecking) {
    return (
      <div class="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600">
        </div>
      </div>
    );
  }

  // Once checked and authenticated, don't render anything
  return null;
}
