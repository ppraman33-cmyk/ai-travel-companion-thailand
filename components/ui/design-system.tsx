"use client";

import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useEffect, useId, useRef } from "react";

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

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  readonly href: string;
  readonly children: ReactNode;
  readonly variant?: "primary" | "secondary" | "danger" | "ghost";
  readonly className?: string;
}) {
  const variants = {
    primary: "bg-emerald-800 text-white hover:bg-emerald-900",
    secondary:
      "border border-emerald-800 bg-white text-emerald-900 hover:bg-emerald-50",
    danger: "bg-red-700 text-white hover:bg-red-800",
    ghost: "text-emerald-900 hover:bg-emerald-50",
  };
  return (
    <Link
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 font-semibold transition",
        variants[variant],
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 placeholder:text-slate-400",
        props.className,
      )}
      {...props}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950",
        props.className,
      )}
      {...props}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        "min-h-32 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 placeholder:text-slate-400",
        props.className,
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
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-900",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-800",
    info: "bg-sky-100 text-sky-900",
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

export function SyntheticNotice({
  children = "DEMO MODE — not real travel or emergency information",
}: {
  readonly children?: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-950"
      role="note"
    >
      {children}
    </div>
  );
}

export function HeroShell({
  eyebrow,
  title,
  description,
  children,
  compact = false,
  coverImage,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
  readonly compact?: boolean;
  readonly coverImage?: string;
}) {
  return (
    <section
      className={cx(
        "relative isolate overflow-hidden rounded-[2rem] text-white shadow-[var(--shadow-card)]",
        compact ? "px-6 py-8" : "min-h-[25rem] px-6 py-12 sm:px-10",
        coverImage ? "bg-emerald-950" : "bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-500",
      )}
    >
      {coverImage ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
          src={coverImage}
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-20 -z-10 size-72 rounded-full bg-white/10 blur-3xl"
      />
      <div className="flex h-full max-w-2xl flex-col justify-end">
        {eyebrow ? (
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-100">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-xl text-lg text-emerald-50">{description}</p>
        ) : null}
        {children ? <div className="mt-7 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}

export function CategoryChip({
  href,
  active = false,
  children,
}: {
  readonly href: string;
  readonly active?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cx(
        "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-bold",
        active
          ? "border-emerald-800 bg-emerald-800 text-white"
          : "border-emerald-100 bg-white text-emerald-900 hover:bg-emerald-50",
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export function QuickActionGrid({ children }: { readonly children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>;
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
  closeLabel = "Close dialog",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  sheet?: boolean;
  closeLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
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
      aria-labelledby={titleId}
      className={cx(
        "m-auto w-[min(36rem,calc(100%-2rem))] rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-slate-950/50",
        sheet &&
          "mb-0 w-full max-w-none rounded-b-none md:mb-auto md:max-w-xl md:rounded-2xl",
      )}
    >
      <section className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose} aria-label={closeLabel}>
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
