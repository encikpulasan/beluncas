import HeaderAuthControls from "../islands/HeaderAuthControls.tsx";

interface HeaderProps {
  title: string;
  severity?: "none" | "low" | "medium" | "high";
}

export default function Header({ title, severity = "none" }: HeaderProps) {
  return (
    <header class="bg-card border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 class="text-xl font-semibold text-foreground">{title}</h1>

      <div class="flex items-center gap-4">
        <div class="relative">
          <input
            type="text"
            placeholder="Search..."
            class="py-2 pl-9 pr-4 rounded-8 bg-muted text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary-300 w-64"
          />
          <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            search
          </span>
        </div>

        <button class="p-2 rounded-full hover:bg-muted">
          <span class="material-symbols-outlined">notifications</span>
        </button>

        <HeaderAuthControls />
      </div>
    </header>
  );
}
