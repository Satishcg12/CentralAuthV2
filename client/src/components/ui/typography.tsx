import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

// Heading component
export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "1" | "2" | "3" | "4" | "5" | "6";
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as = "h2", size, children, ...props }, ref) => {
    const Component = as;
    const headingSize = size || as.replace("h", "");

    const headingStyles = {
      "1": "text-4xl font-extrabold tracking-tight lg:text-5xl",
      "2": "text-3xl font-semibold tracking-tight",
      "3": "text-2xl font-semibold tracking-tight",
      "4": "text-xl font-semibold tracking-tight",
      "5": "text-lg font-semibold tracking-tight",
      "6": "text-base font-semibold tracking-tight",
    }[headingSize];

    return (
      <Component
        ref={ref}
        className={cn(headingStyles, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = "Heading";

// Paragraph component
export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
}

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, size = "base", children, ...props }, ref) => {
    const paragraphStyles = {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    }[size];

    return (
      <p
        ref={ref}
        className={cn(paragraphStyles, className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
Paragraph.displayName = "Paragraph";

// Text component - more versatile text component for spans and other text elements
export interface TextProps<T extends HTMLElement = HTMLSpanElement> extends HTMLAttributes<T> {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  variant?: "default" | "muted" | "primary" | "destructive";
  as?: "span" | "div" | "strong" | "em" | "p";
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ className, size = "base", weight = "normal", variant = "default", as = "span", children, ...props }, ref) => {
    const Component = as;
    
    const sizeStyles = {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    }[size];
    
    const weightStyles = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    }[weight];
    
    const variantStyles = {
      default: "",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    }[variant];

    return (
      <Component
        ref={ref}
        className={cn(sizeStyles, weightStyles, variantStyles, className, " inline-block ")}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Text.displayName = "Text";

// List components
export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  variant?: "default" | "muted";
}

export const List = forwardRef<HTMLUListElement, ListProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          "list-disc pl-6 marker:text-foreground/50 space-y-2",
          variant === "muted" && "text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
List.displayName = "List";

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(className)}
        {...props}
      />
    );
  }
);
ListItem.displayName = "ListItem";

// Blockquote component
export interface BlockquoteProps extends HTMLAttributes<HTMLQuoteElement> {}

export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, ...props }, ref) => {
    return (
      <blockquote
        ref={ref}
        className={cn(
          "border-l-4 border-border pl-4 italic text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
Blockquote.displayName = "Blockquote";