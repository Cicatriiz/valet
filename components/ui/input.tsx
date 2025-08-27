import { cn } from "./cn";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn("w-full rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2", className)} {...props} />;
});

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full rounded-md border bg-transparent px-3 py-2 outline-none focus:ring-2", className)} {...props} />;
}

export default Input;

