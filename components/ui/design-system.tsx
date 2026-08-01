"use client";

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { useEffect, useRef } from "react";

const cx = (...values: (string | false | null | undefined)[]) =>
  values.filter(Boolean).join(" ");

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary: "bg-emerald-800 text-white hover:bg-emerald-900",
    secondary:
      "border border-emerald-800 bg-white text-emerald-900 hover:bg-emerald-50",
    danger: "bg-red-700 text-white hover:bg-red-800",
    ghost: "bg-transparent text-emerald-900 hover:bg-emerald-50",
  };
  return (
    <button
      className={cx(
        "min-h-11 rounded-xl px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {label}
      {children}
      <span className={error ? "text-red-700" : "text-slate-500"}>{error ?? hint}</span>
    </label>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-900",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={cx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function ContentCard({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cx(
        "rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function StatusState({
  state,
  title,
  description,
}: {
  state: "empty" | "error" | "loading";
  title: string;
  description?: string;
}) {
  return (
    <div
      role={state === "error" ? "alert" : "status"}
      aria-live="polite"
      className="rounded-2xl border border-dashed border-slate-300 p-8 text-center"
    >
      <h2 className="font-bold">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "block h-4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function Toast({
  children,
  tone = "success",
}: {
  children: ReactNode;
  tone?: "success" | "danger";
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      aria-live="polite"
      className={cx(
        "fixed bottom-24 right-5 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg",
        tone === "danger" ? "bg-red-800" : "bg-emerald-900",
      )}
    >
      {children}
    </div>
  );
}

export function Dialog({
  open,
  title,
  onClose,
  children,
  sheet = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  sheet?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby="dialog-title"
      className={cx(
        "m-auto w-[min(36rem,calc(100%-2rem))] rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-slate-950/50",
        sheet &&
          "mb-0 w-full max-w-none rounded-b-none md:mb-auto md:max-w-xl md:rounded-2xl",
      )}
    >
      <section className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="dialog-title" className="text-xl font-bold">
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close dialog">
            ×
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </dialog>
  );
}

export function ResponsiveLayout({
  sidebar,
  children,
}: {
  sidebar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      {sidebar ? <aside className="hidden lg:block">{sidebar}</aside> : null}
      <section>{children}</section>
    </div>
  );
}
