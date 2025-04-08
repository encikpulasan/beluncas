import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

type SidebarLink = {
  name: string;
  path: string;
  icon: string;
};

interface SidebarProps {
  activeSection: string;
}

export default function Sidebar({ activeSection }: SidebarProps) {
  const links: SidebarLink[] = [
    { name: "Dashboard", path: "/admin", icon: "home" },
    { name: "Users", path: "/admin/users", icon: "person" },
    { name: "Posts", path: "/admin/posts", icon: "article" },
    { name: "Organization", path: "/admin/organization", icon: "business" },
    { name: "API Keys", path: "/admin/api-keys", icon: "key" },
    { name: "Settings", path: "/admin/settings", icon: "settings" },
    { name: "Changelog", path: "/admin/changelog", icon: "history" },
  ];

  return (
    <div class="hidden md:block md:w-64 h-screen bg-card shadow-lg border-r border-border flex-col">
      <div class="p-4 border-b border-border">
        <h1 class="text-2xl font-bold text-primary-600">Charity Shelter</h1>
        <p class="text-muted-foreground text-sm">Admin Dashboard</p>
      </div>
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-2">
          {links.map((link) => (
            <li key={link.path}>
              <a
                href={link.path}
                class={`flex items-center gap-3 px-3 py-2 rounded-8 transition-colors hover:bg-primary-100 ${
                  activeSection === link.name.toLowerCase()
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-foreground"
                }`}
              >
                <span class="material-symbols-outlined">{link.icon}</span>
                <span>{link.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div class="p-4 border-t border-border">
        <div class="text-sm text-muted-foreground">
          <p>Logged in as Admin</p>
          <p>© {new Date().getFullYear()} Charity Shelter</p>
        </div>
      </div>
    </div>
  );
}
