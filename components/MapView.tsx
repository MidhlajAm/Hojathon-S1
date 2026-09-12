"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { Issue, Severity } from "@/lib/types";
import { DEFAULT_CENTER } from "@/lib/geo";

/**
 * Leaflet over OpenStreetMap tiles — no key, no billing.
 *
 * Leaflet is driven imperatively here rather than through react-leaflet: it
 * touches `window` at import time, and this component is already the client
 * boundary, so going direct avoids a second dynamic-import layer for no gain.
 */

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "#a81919",
  high: "#d92b2b",
  medium: "#e8a33d",
  low: "#1f9d6b",
};

function marker(severity: Severity, selected: boolean): L.DivIcon {
  const size = selected ? 22 : 16;
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:${size}px;height:${size}px;border-radius:50%;
      background:${SEVERITY_COLOR[severity]};
      border:${selected ? 3 : 2}px solid #fff;
      box-shadow:0 1px 4px rgba(22,34,46,.45);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function MapView({
  issues,
  selectedId,
  onSelect,
}: {
  issues: Issue[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    for (const issue of issues) {
      const selected = issue.id === selectedId;
      L.marker([issue.location.lat, issue.location.lng], {
        icon: marker(issue.analysis.severity, selected),
        title: issue.analysis.title,
        keyboard: true,
        alt: issue.analysis.title,
      })
        .on("click", () => onSelect(issue.id))
        .bindTooltip(issue.analysis.title, { direction: "top", offset: [0, -8] })
        .addTo(layer);
    }

    if (issues.length > 0) {
      const selected = issues.find((issue) => issue.id === selectedId);
      if (selected) {
        map.setView([selected.location.lat, selected.location.lng], 15, {
          animate: true,
        });
      } else {
        map.fitBounds(
          L.latLngBounds(
            issues.map((issue) => [issue.location.lat, issue.location.lng]),
          ),
          { padding: [40, 40], maxZoom: 15 },
        );
      }
    }
  }, [issues, selectedId, onSelect]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Map of reported civic issues"
      className="h-[52vh] min-h-[320px] w-full rounded-card border border-rule"
    />
  );
}
