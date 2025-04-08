import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import MobileNavDrawer from "./MobileNavDrawer.tsx";

interface MobileNavigationProps {
  activeSection: string;
}

export default function MobileNavigation(
  { activeSection }: MobileNavigationProps,
) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/admin", icon: "home" },
    { name: "Users", path: "/admin/users", icon: "person" },
    { name: "Posts", path: "/admin/posts", icon: "article" },
    { name: "More", path: "#", icon: "more_horiz" },
  ];

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div class="grid grid-cols-4 w-full">
          {links.map((link) => (
            <a
              key={link.path}
              href={link.path === "#" ? undefined : link.path}
              onClick={link.path === "#" ? toggleDrawer : undefined}
              class={`flex flex-col items-center justify-center py-3 ${
                activeSection === link.name.toLowerCase()
                  ? "text-primary-700"
                  : "text-foreground"
              }`}
            >
              <span class="material-symbols-outlined text-2xl">
                {link.icon}
              </span>
              <span class="text-xs mt-1">{link.name}</span>
            </a>
          ))}
        </div>
      </nav>

      {isDrawerOpen && (
        <MobileNavDrawer onClose={toggleDrawer} activeSection={activeSection} />
      )}
    </>
  );
}
