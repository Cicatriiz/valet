import { cn } from "./cn";

export function Badge({ variant = "default", className, ...props }: { variant?: "default" | "success" | "warning" | "destructive" } & React.HTMLAttributes<HTMLSpanElement>) {
  const styles = {
    default: "bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  } as const;
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", styles[variant], className)} {...props} />;
}

export default Badge;

