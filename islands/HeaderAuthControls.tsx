import { auth, setToken } from "../utils/api.ts";

export default function HeaderAuthControls() {
  const handleLogout = async () => {
    try {
      await auth.logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout even if API call fails
      setToken(null);
      window.location.href = "/login";
    }
  };

  return (
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-semibold">
          A
        </div>
        <span class="text-sm font-medium hidden sm:inline-block">Admin</span>
      </div>

      <button class="p-2 rounded-full hover:bg-muted" onClick={handleLogout}>
        <span class="material-symbols-outlined">logout</span>
      </button>
    </div>
  );
}
