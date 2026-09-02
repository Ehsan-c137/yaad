import type { VariantProps } from "class-variance-authority";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-250 ease-(--spring) outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-95 active:duration-(--press-duration) disabled:pointer-events-none disabled:opacity-50 disabled:transition-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-[var(--accent-blue)] text-white shadow-sm hover:opacity-90 active:opacity-80",
        outline:
          "border-border/50 bg-background/50 hover:bg-foreground/[0.05] hover:text-foreground hover:border-border/70 aria-expanded:bg-foreground/[0.06] aria-expanded:text-foreground dark:bg-transparent dark:hover:bg-white/[0.06] dark:border-border/30 dark:hover:border-border/50",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary/90 active:bg-secondary aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-foreground/[0.06] hover:text-foreground aria-expanded:bg-foreground/[0.08] aria-expanded:text-foreground dark:hover:bg-white/[0.07] dark:aria-expanded:bg-white/[0.09]",
        destructive:
          "bg-destructive/8 text-destructive hover:bg-destructive/15 active:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/15 dark:hover:bg-destructive/25 dark:focus-visible:ring-destructive/40",
        link: "text-[var(--accent-blue)] underline-offset-4 hover:underline hover:opacity-80 active:opacity-70",
        sidebar:
          "data-active:bg-[var(--accent-blue-tint)] data-active:text-[var(--accent-blue)] data-active:font-medium group my-px h-7 w-full justify-between py-0 pr-2 pl-0 text-start",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-3 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
        lg: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        pill: "h-9 gap-1.5 px-5 rounded-full",
        "icon-xs":
          "size-6 [&_svg:not([class*='size-'])]:size-3 after:absolute after:-inset-[10px] after:content-['']",
        "icon-sm":
          "size-7 after:absolute after:-inset-[8px] after:content-['']",
        icon: "size-8 after:absolute after:-inset-[6px] after:content-['']",
        "icon-lg":
          "size-9 after:absolute after:-inset-[4px] after:content-['']",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  /** Shows a spinner overlay and sets aria-busy. Keeps children mounted for layout stability. */
  loading?: boolean;
  tooltipSide?: "bottom" | "left" | "right" | "top";
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  title,
  tooltipSide = "right",
  ...props
}: ButtonProps) {
  const ButtonToRender = (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Loading overlay — sits above children, children stay mounted to preserve layout dimensions */}
      {loading && (
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <Loader2 className="size-4 animate-spin" />
        </span>
      )}

      {/* Children hidden while loading but still rendered so the button keeps its size */}
      <span
        className={cn(
          "contents transition-opacity duration-(--press-duration)",
          loading && "opacity-0",
        )}
      >
        {children}
      </span>
    </ButtonPrimitive>
  );

  if (title) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            disabled ? (
              <span tabIndex={0} className="inline-flex">
                {ButtonToRender}
              </span>
            ) : (
              ButtonToRender
            )
          }
        />
        <TooltipContent side={tooltipSide}>{title}</TooltipContent>
      </Tooltip>
    );
  }

  return ButtonToRender;
}

export { Button };
