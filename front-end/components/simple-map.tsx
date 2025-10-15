"use client";
import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

interface SimpleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: string;
  width?: string;
  isLoaded: boolean; // Receive isLoaded from parent
}

const containerStyleDefault = {
  width: "100%",
  height: "300px",
};

export default function SimpleMap({
  lat,
  lng,
  zoom = 13,
  height,
  width,
  isLoaded,
}: SimpleMapProps) {
  const containerStyle = {
    ...containerStyleDefault,
    ...(height ? { height } : {}),
    ...(width ? { width } : {}),
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat, lng }}
      zoom={zoom}
    >
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  );
}
