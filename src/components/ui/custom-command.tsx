import * as React from "react";
import { cn } from "@/lib/utils";

interface CommandProps {
  children: React.ReactNode;
  className?: string;
  shouldFilter?: boolean;
}

export function Command({ children, className, shouldFilter }: CommandProps) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-md", className)}>
      {children}
    </div>
  );
}

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function CommandInput({ className, value, onValueChange, ...props }: CommandInputProps) {
  return (
    <div className="flex items-center border-b px-3">
      <input
        {...props}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    </div>
  );
}

interface CommandEmptyProps {
  children: React.ReactNode;
}

export function CommandEmpty({ children }: CommandEmptyProps) {
  return (
    <div className="py-6 text-center text-sm">{children}</div>
  );
}

interface CommandGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function CommandGroup({ children, className }: CommandGroupProps) {
  return (
    <div className={cn("overflow-hidden p-1 text-foreground", className)}>
      {children}
    </div>
  );
}

interface CommandItemProps {
  children: React.ReactNode;
  className?: string;
  value?: string;
  onSelect?: () => void;
}

export function CommandItem({ children, className, onSelect }: CommandItemProps) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={onSelect}
    >
      {children}
    </div>
  );
} 