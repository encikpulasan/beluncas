interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: {
    value: string | number;
    type: "increase" | "decrease";
  };
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export default function StatCard(
  { title, value, icon, change, color = "primary" }: StatCardProps,
) {
  // Define color classes based on the color prop
  const colorClasses = {
    primary: {
      bg: "bg-primary-50",
      text: "text-primary-700",
      icon: "text-primary-600",
    },
    secondary: {
      bg: "bg-secondary-50",
      text: "text-secondary-700",
      icon: "text-secondary-600",
    },
    success: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: "text-green-600",
    },
    warning: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: "text-yellow-600",
    },
    danger: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: "text-red-600",
    },
  };

  const selectedColor = colorClasses[color];

  return (
    <div class="bg-card rounded-16 shadow border border-border p-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">{title}</p>
        <div
          class={`w-10 h-10 rounded-full ${selectedColor.bg} flex items-center justify-center ${selectedColor.icon}`}
        >
          <span class="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div class="mt-4">
        <h3 class="text-2xl font-semibold text-card-foreground">{value}</h3>
        {change && (
          <p
            class={`text-sm mt-1 flex items-center ${
              change.type === "increase" ? "text-green-600" : "text-red-600"
            }`}
          >
            <span class="material-symbols-outlined text-sm mr-1">
              {change.type === "increase" ? "arrow_upward" : "arrow_downward"}
            </span>
            {change.value}
          </p>
        )}
      </div>
    </div>
  );
}
