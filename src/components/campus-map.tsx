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

const typeEmoji: Record<string, string> = {
  library: "📚",
  lab: "💻",
  social: "☕",
  building: "🏢",
};

function createMarkerIcon(type: string, peersNow: number, capacity: number) {
  const occupancy = Math.round((peersNow / capacity) * 100);
  const color =
    occupancy >= 80 ? "#EF4444" : occupancy >= 50 ? "#F59E0B" : "#22C55E";
  const emoji = typeEmoji[type] || "📍";

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
        border: 3px solid ${color};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(0,0,0,0.1);
        font-size: 18px;
        cursor: pointer;
        transition: transform 0.2s;
      ">${emoji}</div>
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
                    <span style={{ fontSize: 20 }}>{typeEmoji[spot.type] || "📍"}</span>
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
