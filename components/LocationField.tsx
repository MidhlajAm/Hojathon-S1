"use client";

import { useState } from "react";
import { DEFAULT_CENTER, formatCoords } from "@/lib/geo";
import type { GeoPoint } from "@/lib/types";
import { PinIcon } from "./icons";

export default function LocationField({
  value,
  onChange,
  disabled = false,
}: {
  value: GeoPoint | null;
  onChange: (point: GeoPoint) => void;
  disabled?: boolean;
}) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function locate() {
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("This browser cannot share a location. Type the place instead.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: value?.label,
        });
      },
      () => {
        setLocating(false);
        // A refused permission is a normal answer, not a failure. Fall back to
        // the city centre so the flow continues.
        setError(
          "Location is off, so the city centre is used. Name the place below and the agent will use that.",
        );
        onChange({ ...DEFAULT_CENTER, label: value?.label });
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="rounded-card border border-rule bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PinIcon className="h-5 w-5 text-muted" />
          <span className="text-[15px] font-medium">
            {value ? (
              <span className="font-mono text-sm">{formatCoords(value)}</span>
            ) : (
              "No location yet"
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={locate}
          disabled={disabled || locating}
          className="rounded-lg border border-rule px-3 py-1.5 text-sm font-semibold hover:bg-ground disabled:opacity-60"
        >
          {locating ? "Finding you" : value ? "Update location" : "Use my location"}
        </button>
      </div>

      <label className="mt-3 block">
        <span className="text-[13px] text-muted">
          Landmark, so the department knows where to go
        </span>
        <input
          type="text"
          value={value?.label ?? ""}
          disabled={disabled}
          placeholder="Near ABC College"
          onChange={(event) =>
            onChange({
              ...(value ?? DEFAULT_CENTER),
              label: event.target.value,
            })
          }
          className="mt-1 w-full rounded-lg border border-rule px-3 py-2 text-[15px] focus:border-action focus:outline-none disabled:bg-ground"
        />
      </label>

      {error ? <p className="mt-2 text-sm text-muted">{error}</p> : null}
    </div>
  );
}
