import { cn } from "../../utils/cn";

export function Button({
    className,
    variant = "primary",
    size = "md",
    isLoading,
    children,
    ...props
}) {
    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        outline: "bg-transparent border border-muted hover:bg-muted text-white",
        ghost: "bg-transparent hover:bg-muted text-white",
        danger: "bg-accent hover:bg-accent/90 text-white",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            className={cn(
                "relative flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {children}
        </button>
    );
}
