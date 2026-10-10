import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({
  children,
  loading = false,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-lavender-600 text-white shadow-md shadow-lavender-200 hover:bg-lavender-700",
    secondary:
      "border border-lavender-200 bg-lavender-50 text-lavender-700 hover:bg-lavender-100",
    ghost: "bg-transparent text-ink-700 hover:bg-lavender-50",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 ease-premium hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {loading && <LoaderCircle size={17} className="animate-spin" />}
      {children}
    </button>
  );
}
