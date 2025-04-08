import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", ...rest } = props;

  let variantClasses = "";
  let sizeClasses = "";

  // Set variant classes
  switch (variant) {
    case "primary":
      variantClasses = "bg-primary-600 hover:bg-primary-700 text-white";
      break;
    case "secondary":
      variantClasses = "bg-secondary-600 hover:bg-secondary-700 text-white";
      break;
    case "outline":
      variantClasses =
        "bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50";
      break;
    case "ghost":
      variantClasses = "bg-transparent text-foreground hover:bg-muted";
      break;
    default:
      variantClasses = "bg-primary-600 hover:bg-primary-700 text-white";
  }

  // Set size classes
  switch (size) {
    case "sm":
      sizeClasses = "px-3 py-1 text-sm rounded-8";
      break;
    case "md":
      sizeClasses = "px-4 py-2 rounded-8";
      break;
    case "lg":
      sizeClasses = "px-6 py-3 text-lg rounded-8";
      break;
    default:
      sizeClasses = "px-4 py-2 rounded-8";
  }

  return (
    <button
      {...rest}
      disabled={!IS_BROWSER || props.disabled}
      class={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 ${variantClasses} ${sizeClasses} ${
        props.class ?? ""
      }`}
    />
  );
}
