import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "violet" | "teal" | "green" | "red" | "orange" | "gray";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "violet",
  size = "sm",
  children,
  className,
}: BadgeProps) {
  const variants = {
    violet: "bg-[#5B2D8E]/10 text-[#5B2D8E]",
    teal: "bg-[#1AA8A8]/10 text-[#1AA8A8]",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-700",
    gray: "bg-gray-100 text-gray-600",
  };

  const sizes = { sm: "px-2 py-0.5 text-xs", md: "px-3 py-1 text-sm" };

  return (
    <span
      className={cn(
        "rounded-lg font-medium inline-flex items-center gap-1",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
