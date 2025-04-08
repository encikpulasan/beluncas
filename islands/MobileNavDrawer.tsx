import { IS_BROWSER } from "$fresh/runtime.ts";

interface MobileNavDrawerProps {
  activeSection: string;
  onClose: () => void;
}

export default function MobileNavDrawer(
  { activeSection, onClose }: MobileNavDrawerProps,
) {
  const additionalLinks = [
    { name: "Organization", path: "/admin/organization", icon: "business" },
    { name: "API Keys", path: "/admin/api-keys", icon: "key" },
    { name: "Settings", path: "/admin/settings", icon: "settings" },
    { name: "Changelog", path: "/admin/changelog", icon: "history" },
  ];

  return (
    <div class="md:hidden">
      {/* Backdrop */}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      >
      </div>

      {/* Drawer */}
      <div class="fixed bottom-16 left-0 right-0 bg-card p-5 rounded-t-xl shadow-xl z-50 border-t border-border">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium">More options</h3>
          <button
            onClick={onClose}
            class="rounded-full p-2 hover:bg-muted"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="grid grid-cols-4 gap-6">
          {additionalLinks.map((link) => (
            <a
              key={link.path}
              href={link.path}
              class={`flex flex-col items-center p-4 rounded-lg ${
                activeSection === link.name.toLowerCase()
                  ? "bg-primary-50 text-primary-700"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span class="material-symbols-outlined text-2xl mb-2">
                {link.icon}
              </span>
              <span class="text-xs text-center">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
