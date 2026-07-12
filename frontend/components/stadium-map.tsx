"use client";

import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, Polyline, TileLayer } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mapMarkers, routeLines } from "@/lib/data";

const center: [number, number] = [40.8136, -74.0745];

const icon = L.divIcon({
  className: "stadiumgpt-map-icon",
  html: "<div style='width:18px;height:18px;border-radius:999px;background:#0f766e;border:3px solid white;box-shadow:0 4px 12px rgba(15,23,42,.35)'></div>",
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export default function StadiumMap() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="p-3">
          <MapContainer center={center} zoom={15} scrollWheelZoom className="z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routeLines.map((route) => (
              <Polyline key={route.name} positions={route.points} color={route.color} weight={5}>
                <Popup>{route.name}</Popup>
              </Polyline>
            ))}
            {mapMarkers.map((marker) => (
              <Marker key={marker.name} position={marker.position} icon={icon}>
                <Popup>
                  <strong>{marker.name}</strong>
                  <br />
                  {marker.type}
                </Popup>
              </Marker>
            ))}
            {mapMarkers.filter((marker) => marker.density).map((marker) => (
              <CircleMarker
                key={`${marker.name}-density`}
                center={marker.position}
                radius={Number(marker.density) / 4}
                pathOptions={{ color: marker.riskColor, fillColor: marker.riskColor, fillOpacity: 0.25 }}
              />
            ))}
          </MapContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Map Layers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mapMarkers.map((marker) => (
            <div key={marker.name} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{marker.name}</span>
                <Badge variant={marker.risk === "High" ? "danger" : marker.risk === "Medium" ? "warning" : "success"}>
                  {marker.risk}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{marker.type}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

