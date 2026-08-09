import { Icon, type IconName } from "@/components/ui/icon";

const palettes = {
  emerald: "from-emerald-950 via-emerald-700 to-teal-400",
  sky: "from-sky-900 via-teal-600 to-emerald-300",
  amber: "from-amber-700 via-orange-400 to-emerald-700",
  violet: "from-violet-900 via-violet-500 to-rose-300",
} as const;

export function SyntheticVisual({
  label,
  icon = "place",
  palette = "emerald",
  className = "aspect-[16/9]",
}: {
  readonly label: string;
  readonly icon?: IconName;
  readonly palette?: keyof typeof palettes;
  readonly className?: string;
}) {
  return (
    <div
      aria-label={`${label}. Synthetic decorative placeholder.`}
      className={`relative isolate overflow-hidden bg-gradient-to-br ${palettes[palette]} ${className}`}
      role="img"
    >
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -bottom-10 left-1/4 h-28 w-3/4 -skew-x-12 rounded-[50%] bg-emerald-950/35" />
      <div className="absolute bottom-0 left-0 h-20 w-2/3 rounded-tr-[100%] bg-white/15" />
      <div className="absolute inset-0 grid place-items-center text-white/90">
        <Icon className="size-12 drop-shadow" name={icon} />
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
        Synthetic visual
      </span>
      <span className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white drop-shadow">
        {label}
      </span>
    </div>
  );
}
