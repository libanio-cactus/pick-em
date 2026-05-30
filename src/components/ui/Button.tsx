import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "heat" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-btn " +
  "transition-colors duration-150 select-none whitespace-nowrap " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  // primário = lime (identidade 7K), texto escuro
  primary: "bg-brand text-on-brand hover:bg-brand-hover disabled:hover:bg-brand",
  // secundário = ghost com borda/texto lime
  secondary: "border border-brand text-brand bg-transparent hover:bg-brand/10",
  // heat = dourado, só pra ação ligada a streak/conquista
  heat: "bg-heat text-on-brand hover:bg-heat-hover",
  // ghost = apagado, ações de menor prioridade
  ghost:
    "border border-border text-text-2 bg-transparent hover:bg-surface-3 hover:text-text",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  href,
}: BaseProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}
