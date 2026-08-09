import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "search"
  | "heart"
  | "trip"
  | "user"
  | "spark"
  | "help"
  | "map"
  | "food"
  | "event"
  | "place"
  | "arrow"
  | "close"
  | "report"
  | "car";

const paths: Record<IconName, string> = {
  home: "M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z",
  search: "m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  trip: "M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2m3 0H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-8 3v8m-6-4h12",
  user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  spark:
    "m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Zm7 11 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-6v.01M9.1 9a3 3 0 1 1 4.3 2.7c-.9.5-1.4 1.1-1.4 2.3",
  map: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15",
  food: "M7 3v8m-3-8v5a3 3 0 0 0 6 0V3m-3 8v10m10-18v18m0-18c3 2 3 7 0 9",
  event: "M5 5h14v16H5zM8 3v4m8-4v4M5 10h14",
  place:
    "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  arrow: "m9 18 6-6-6-6",
  close: "M6 6l12 12M18 6 6 18",
  report:
    "M12 9v4m0 4v.01M10.3 3.8 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z",
  car: "M3 14l2-6h14l2 6v5h-2v-2H5v2H3Zm3-4-1 4h14l-1-4ZM7 15h.01M17 15h.01",
};

export function Icon({
  name,
  className = "size-5",
  ...props
}: { readonly name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
