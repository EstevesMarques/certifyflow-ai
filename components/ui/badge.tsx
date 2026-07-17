import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-white dark:text-[#0B0D14]",
        secondary:
          "bg-[var(--bg-option)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
        success:
          "bg-[var(--accent-success)]/10 text-[var(--accent-success)] border border-[var(--accent-success)]/20",
        destructive:
          "bg-[var(--accent-danger)]/10 text-[var(--accent-danger)] border border-[var(--accent-danger)]/20",
        outline:
          "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
