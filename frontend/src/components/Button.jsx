// src/components/Button.jsx
import React from "react";
import { Link } from "react-router-dom";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

/**
 * props
 * - as: 'button' | Link (기본 'button')
 * - to: Link 사용할 때 경로
 * - variant: 'primary' | 'outline' (기본 'primary')
 * - size: 'sm' | 'md' | 'lg' (기본 'md')
 * - block: 전체폭 여부
 * - loading: 로딩 스피너
 */
export default function Button({
  as = "button",
  to,
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  className,
  children,
  disabled,
  ...rest
}) {
  const Comp = as === Link ? Link : as;
  const classes = cx(
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    block && "btn--block",
    className
  );
  const isDisabled = disabled || loading;

  // Link인 경우 disabled를 aria만 처리
  if (Comp === Link) {
    return (
      <Link className={classes} to={to} aria-disabled={isDisabled || undefined} {...rest}>
        {loading && <span className="btn__spinner" aria-hidden="true" />}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button type="button" className={classes} disabled={isDisabled} {...rest}>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
