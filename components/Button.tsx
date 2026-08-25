"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  iconName?: IconName;
  trailingIcon?: IconName;
  pressed?: boolean;
  children?: ReactNode;
  type?: "button" | "submit" | "reset";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    block,
    iconName,
    trailingIcon,
    pressed,
    className,
    type = "button",
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={pressed ? true : undefined}
      className={cn(
        "btn",
        `btn-${variant}`,
        size === "sm" && "btn-sm",
        size === "lg" && "btn-lg",
        block && "btn-block",
        className,
      )}
      {...rest}
    >
      {iconName ? <Icon name={iconName} size={size === "sm" ? 16 : 18} aria-hidden /> : null}
      {children}
      {trailingIcon ? (
        <Icon name={trailingIcon} size={size === "sm" ? 16 : 18} aria-hidden />
      ) : null}
    </button>
  );
});
