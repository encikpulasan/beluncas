import { ComponentChildren } from "preact";
import Sidebar from "./Sidebar.tsx";
import Header from "./Header.tsx";
import AuthCheck from "../islands/AuthCheck.tsx";
import MobileNavigation from "../islands/MobileNavigation.tsx";

interface AdminLayoutProps {
  children: ComponentChildren;
  title: string;
  activeSection: string;
  severity?: "none" | "low" | "medium" | "high";
}

export default function AdminLayout(
  { children, title, activeSection, severity = "none" }: AdminLayoutProps,
) {
  return (
    <>
      <AuthCheck />
      <div class="flex h-screen bg-background">
        <Sidebar activeSection={activeSection} />
        <div class="flex-1 flex flex-col overflow-hidden">
          <Header title={title} severity={severity} />
          <main class="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNavigation activeSection={activeSection} />
    </>
  );
}
