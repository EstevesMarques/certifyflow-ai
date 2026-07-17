import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--radius-pill)] font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--text-faint)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-[var(--shadow-button)] dark:text-[#0B0D14] dark:bg-[var(--accent)] dark:hover:bg-white",
        outline:
          "border border-[var(--border)] bg-[var(--bg-card)] backdrop-blur-md text-[var(--text-primary)] hover:bg-[var(--bg-option-hover)]",
        secondary:
          "bg-[var(--bg-option)] text-[var(--text-primary)] hover:bg-[var(--bg-option-hover)]",
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-option)]",
        destructive:
          "bg-[var(--accent-danger)]/10 text-[var(--accent-danger)] hover:bg-[var(--accent-danger)]/20",
        link: "text-[var(--text-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-6 text-sm",
        sm: "h-8 gap-1.5 px-4 text-[13px]",
        lg: "h-12 gap-2 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
