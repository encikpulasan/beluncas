import { ComponentChildren } from "preact";

interface CardProps {
  title?: string;
  icon?: string;
  children: ComponentChildren;
  className?: string;
  footer?: ComponentChildren;
}

export default function Card(
  { title, icon, children, className = "", footer }: CardProps,
) {
  return (
    <div
      class={`bg-card rounded-16 shadow border border-border overflow-hidden ${className}`}
    >
      {(title || icon) && (
        <div class="p-4 border-b border-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            {icon && (
              <span class="material-symbols-outlined text-primary-500">
                {icon}
              </span>
            )}
            {title && <h3 class="font-medium text-card-foreground">{title}</h3>}
          </div>
        </div>
      )}
      <div class="p-4">
        {children}
      </div>
      {footer && (
        <div class="p-4 bg-muted border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
}
