import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(
          "btn-base",
          {
            "btn-primary": variant === "primary",
            "btn-secondary": variant === "secondary",
            "btn-outline": variant === "outline",
            "btn-ghost": variant === "ghost",
          },
          {
            "btn-size-sm": size === "sm",
            "btn-size-md": size === "md",
            "btn-size-lg": size === "lg",
          },

          className,
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
