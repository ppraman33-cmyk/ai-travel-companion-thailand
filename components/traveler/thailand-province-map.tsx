"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { ProvinceMapRecord } from "@/application/geography/thailand-province-map";

const regions = [
  "all",
  "northern",
  "northeastern",
  "central",
  "eastern",
  "western",
  "southern",
] as const;

function supportsWebGl() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function ThailandProvinceMap({
  provinces,
  initialRegion = "all",
}: {
  readonly provinces: readonly ProvinceMapRecord[];
  readonly initialRegion?: string;
}) {
  const [region, setRegion] = useState(initialRegion);
  const [selectedCode, setSelectedCode] = useState<string>();
  const [webGl, setWebGl] = useState<boolean | null>(null);
  const [tilt, setTilt] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const filtered = useMemo(
    () =>
      provinces.filter((province) => region === "all" || province.region === region),
    [provinces, region],
  );
  const visibleCodes = new Set(filtered.map(({ code }) => code));

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWebGl(supportsWebGl()));
    return () => cancelAnimationFrame(frame);
  }, []);

  function resetView() {
    setTilt(0);
    setRotation(0);
    setZoom(1);
  }

  return (
    <section aria-labelledby="province-map-title" className="province-map-shell">
      <div className="province-map-heading">
        <div>
          <p className="reference-eyebrow">
            Licensed boundary foundation · evidence pending
          </p>
          <h2 className="text-3xl font-black" id="province-map-title">
            Thailand province map
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Select any of 76 provinces or Bangkok. Boundaries are geographic context
            only; no place or emergency content is implied.
          </p>
        </div>
        <label className="province-map-filter">
          <span>Map region</span>
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            {regions.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All regions" : value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="province-map-layout">
        <div className="province-map-stage" data-mode={webGl === false ? "2d" : "3d"}>
          <p aria-live="polite" className="province-map-mode">
            {webGl === null
              ? "Checking 3D support…"
              : webGl
                ? "Accessible 3D extrusion available"
                : "2D vector fallback active"}
          </p>
          <svg viewBox="0 0 620 900">
            <title>Interactive map of Thailand&apos;s 77 province-level areas</title>
            <g
              className="province-map-transform"
              style={{
                transform: `translateY(${tilt / 3}px) rotate(${rotation}deg) scale(${zoom}, ${zoom * (1 - tilt / 180)})`,
              }}
            >
              {webGl ? (
                <g aria-hidden="true" className="province-map-depth">
                  {provinces.map((province) => (
                    <path d={province.path} key={`depth-${province.code}`} />
                  ))}
                </g>
              ) : null}
              <g>
                {provinces.map((province) => (
                  <Link
                    aria-label={`${province.nameEn}, ${province.nameTh}; evidence pending`}
                    href={`/thailand/${province.region}/${province.slug}`}
                    key={province.code}
                    onFocus={() => setSelectedCode(province.code)}
                    onMouseEnter={() => setSelectedCode(province.code)}
                  >
                    <path
                      className="province-map-shape"
                      d={province.path}
                      data-selected={selectedCode === province.code}
                      data-visible={visibleCodes.has(province.code)}
                    />
                  </Link>
                ))}
              </g>
            </g>
          </svg>
          <div
            aria-label="Map view controls"
            className="province-map-controls"
            role="group"
          >
            <button
              aria-label="Zoom in"
              onClick={() => setZoom((value) => Math.min(1.6, value + 0.1))}
            >
              +
            </button>
            <button
              aria-label="Zoom out"
              onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}
            >
              −
            </button>
            <button
              disabled={!webGl}
              onClick={() => setTilt((value) => (value + 15) % 60)}
            >
              Tilt
            </button>
            <button
              disabled={!webGl}
              onClick={() => setRotation((value) => (value + 15) % 360)}
            >
              Rotate
            </button>
            <button onClick={resetView}>Reset view</button>
          </div>
        </div>

        <div className="province-map-directory">
          <h3 className="text-xl font-black">Province list ({filtered.length})</h3>
          <ul>
            {filtered.map((province) => (
              <li key={province.code}>
                <Link
                  href={`/thailand/${province.region}/${province.slug}`}
                  onFocus={() => setSelectedCode(province.code)}
                  onMouseEnter={() => setSelectedCode(province.code)}
                >
                  <span>{province.nameEn}</span>
                  <small lang="th">
                    {province.nameTh} · {province.code}
                  </small>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="province-map-attribution">
        © OpenStreetMap contributors; boundary data via geoBoundaries (William &amp;
        Mary geoLab), ODbL 1.0. Geometry represented: 2017.
      </p>
    </section>
  );
}
