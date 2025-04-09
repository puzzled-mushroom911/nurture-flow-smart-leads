import * as React from "react";
import { cn } from "@/lib/utils";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

interface NavbarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface NavbarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface NavbarMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  children: React.ReactNode;
}

interface NavbarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface NavbarMenuToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function Navbar({ className, children, ...props }: NavbarProps) {
  return (
    <nav
      className={cn(
        "border-b bg-background",
        className
      )}
      {...props}
    >
      <div className="flex h-16 items-center px-4">
        {children}
      </div>
    </nav>
  );
}

export function NavbarContent({ className, children, ...props }: NavbarContentProps) {
  return (
    <div
      className={cn(
        "flex items-center space-x-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NavbarItem({ className, children, ...props }: NavbarItemProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NavbarMenu({ className, isOpen, children, ...props }: NavbarMenuProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80 md:hidden",
        isOpen ? "block" : "hidden",
        className
      )}
      {...props}
    >
      <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
        {children}
      </div>
    </div>
  );
}

export function NavbarMenuItem({ className, children, ...props }: NavbarMenuItemProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NavbarMenuToggle({ className, children, ...props }: NavbarMenuToggleProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 