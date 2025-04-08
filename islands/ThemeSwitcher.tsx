import { useEffect, useState } from "preact/hooks";

type Theme = "light" | "dark-theme" | "green-theme" | "purple-theme";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme === "light" ? "" : newTheme;
  };

  return (
    <div class="bg-card rounded-16 shadow border border-border p-4">
      <h3 class="font-medium mb-4 text-card-foreground">Color Theme</h3>
      <div class="grid grid-cols-2 gap-3">
        <button
          onClick={() => changeTheme("light")}
          class={`flex items-center gap-2 p-3 rounded-8 transition-colors ${
            theme === "light"
              ? "bg-primary-50 text-primary-600 ring-2 ring-primary-600"
              : "bg-muted"
          }`}
        >
          <span class="material-symbols-outlined">light_mode</span>
          <span>Light</span>
        </button>

        <button
          onClick={() => changeTheme("dark-theme")}
          class={`flex items-center gap-2 p-3 rounded-8 transition-colors ${
            theme === "dark-theme"
              ? "bg-primary-50 text-primary-600 ring-2 ring-primary-600"
              : "bg-muted"
          }`}
        >
          <span class="material-symbols-outlined">dark_mode</span>
          <span>Dark</span>
        </button>

        <button
          onClick={() => changeTheme("green-theme")}
          class={`flex items-center gap-2 p-3 rounded-8 transition-colors ${
            theme === "green-theme"
              ? "bg-primary-50 text-primary-600 ring-2 ring-primary-600"
              : "bg-muted"
          }`}
        >
          <span class="material-symbols-outlined">eco</span>
          <span>Green</span>
        </button>

        <button
          onClick={() => changeTheme("purple-theme")}
          class={`flex items-center gap-2 p-3 rounded-8 transition-colors ${
            theme === "purple-theme"
              ? "bg-primary-50 text-primary-600 ring-2 ring-primary-600"
              : "bg-muted"
          }`}
        >
          <span class="material-symbols-outlined">palette</span>
          <span>Purple</span>
        </button>
      </div>
    </div>
  );
}
