import { cn } from "../../utils/cn";

export function Input({ label, error, className, ...props }) {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label className="text-sm font-medium text-muted-foreground ml-1">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    "input-field w-full",
                    error && "border-accent focus:ring-accent/50 focus:border-accent",
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-xs text-accent mt-1 ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
}
