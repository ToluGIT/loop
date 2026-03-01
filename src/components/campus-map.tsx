"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Users } from "lucide-react";

interface Spot {
  id: string;
  name: string;
  type: string;
  floor: string;
  peersNow: number;
  capacity: number;
  topSkills: string[];
  activeGroups: number;
  noiseLevel: string;
  lat: number;
  lng: number;
}

const typeIcon: Record<string, { svg: string; color: string }> = {
  library: {
    color: "#3B82F6",
    svg: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  },
  lab: {
    color: "#10B981",
    svg: `<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>`,
  },
  social: {
    color: "#F59E0B",
    svg: `<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a2 2 0 1 1 0 4h-1"/><path d="M6 2v2"/>`,
  },
  building: {
    color: "#8B5CF6",
    svg: `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>`,
  },
};

function typeSvg(type: string, size = 18) {
  const cfg = typeIcon[type] || typeIcon.building;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${cfg.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${cfg.svg}</svg>`;
}

function createMarkerIcon(type: string, peersNow: number, capacity: number) {
  const occupancy = Math.round((peersNow / capacity) * 100);
  const ringColor =
    occupancy >= 80 ? "#EF4444" : occupancy >= 50 ? "#F59E0B" : "#22C55E";

  return L.divIcon({
    className: "campus-marker",
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--color-loop-surface, #1A1A22);
        border: 3px solid ${ringColor};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform 0.2s;
      ">${typeSvg(type)}</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

function FitBounds({ spots }: { spots: Spot[] }) {
  const map = useMap();
  if (spots.length > 0) {
    const bounds = L.latLngBounds(spots.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
  }
  return null;
}

interface CampusMapProps {
  spots: Spot[];
  checkedIn: string | null;
  onCheckIn: (id: string) => void;
}

export default function CampusMap({ spots, checkedIn, onCheckIn }: CampusMapProps) {
  const center: [number, number] = [57.1183, -2.1368];

  return (
    <div className="loop-card overflow-hidden" style={{ height: 380 }}>
      <MapContainer
        center={center}
        zoom={17}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "16px" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds spots={spots} />

        {spots.map((spot) => {
          const occupancy = Math.round((spot.peersNow / spot.capacity) * 100);
          const isCheckedIn = checkedIn === spot.id;

          return (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={createMarkerIcon(spot.type, spot.peersNow, spot.capacity)}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: "var(--font-body, sans-serif)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: `${(typeIcon[spot.type] || typeIcon.building).color}20` }}
                      dangerouslySetInnerHTML={{ __html: typeSvg(spot.type, 16) }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{spot.name}</div>
                      <div style={{ fontSize: 11, color: "#8E90A6" }}>{spot.floor}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, marginBottom: 6 }}>
                    <Users size={12} />
                    <span>{spot.peersNow} peers</span>
                    <span style={{ marginLeft: "auto", fontWeight: 600, color: occupancy >= 80 ? "#EF4444" : occupancy >= 50 ? "#F59E0B" : "#22C55E" }}>
                      {occupancy}% full
                    </span>
                  </div>

                  <div style={{ width: "100%", height: 4, borderRadius: 2, background: "#E2E4EA", marginBottom: 8 }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 2,
                        width: `${occupancy}%`,
                        background: occupancy >= 80 ? "#EF4444" : occupancy >= 50 ? "#F59E0B" : "#22C55E",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
                    {spot.topSkills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        style={{
                          padding: "1px 6px",
                          borderRadius: 4,
                          fontSize: 10,
                          background: "#F3F4F8",
                          color: "#6B7084",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onCheckIn(isCheckedIn ? "" : spot.id)}
                    style={{
                      width: "100%",
                      padding: "6px 0",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      background: isCheckedIn ? "#22C55E" : "#F97354",
                      color: "white",
                    }}
                  >
                    {isCheckedIn ? "Checked In ✓" : "Check In"}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
