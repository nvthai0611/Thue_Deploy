import React, { useRef, useState, useEffect } from "react";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: 37.4221, lng: -122.0841 };

interface GGMapProps {
  onSelect?: (
    address: string,
    city: string,
    district: string,
    lat: number,
    lng: number,
    state?: string
  ) => void;
  isLoaded: boolean; // required prop
  defaultValue?: {
    address?: string;
    city?: string;
    district?: string;
    lat?: number | null;
    lng?: number | null;
    state?: string;
  };
}

export default function GGMap({
  onSelect,
  isLoaded,
  defaultValue,
}: GGMapProps) {
  const [center, setCenter] = useState(defaultCenter);
  const [marker, setMarker] = useState(defaultCenter);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Set default value khi GGMap mount hoặc defaultValue thay đổi
  useEffect(() => {
    if (defaultValue) {
      if (defaultValue.lat && defaultValue.lng) {
        setCenter({ lat: defaultValue.lat, lng: defaultValue.lng });
        setMarker({ lat: defaultValue.lat, lng: defaultValue.lng });
      }
      setAddress(defaultValue.address || "");
      setCity(defaultValue.city || "");
      setDistrict(defaultValue.district || "");
      setState(defaultValue.state || "");
    }
  }, [defaultValue]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setCenter(location);
      setMarker(location);

      let city = "",
        district = "",
        state = "",
        country = "";
      place.address_components?.forEach((component) => {
        const types = component.types;
        if (types.includes("locality")) city = component.long_name;
        if (types.includes("administrative_area_level_2"))
          district = component.long_name;
        if (types.includes("administrative_area_level_1"))
          state = component.long_name;
        if (types.includes("country")) country = component.long_name;
      });

      setAddress(place.formatted_address || "");
      setCity(city);
      setDistrict(district);
      setState(state);

      if (onSelect) {
        onSelect(
          place.formatted_address || "",
          city,
          district,
          location.lat,
          location.lng,
          state
        );
      }
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row mt-1">
      {/* Sidebar with address info */}
      <div className="w-full pr-0 md:w-1/3">
        {/* Google Places Autocomplete input */}
        <Autocomplete
          onLoad={(ac) => (autocompleteRef.current = ac)}
          onPlaceChanged={onPlaceChanged}
          className="mb-4"
        >
          <Input
            type="text"
            placeholder="Search address..."
            className="py-[21px]"
          />
        </Autocomplete>
        {/* Show full address */}
        <Input
          type="text"
          placeholder="Full Address"
          value={address}
          readOnly
          className={cn(
            address ? "" : "bg-primary-foreground",
            "my-2 cursor-pointer"
          )}
        />
        {/* Show district */}
        <Input
          type="text"
          placeholder="District"
          value={district}
          readOnly
          className={cn(
            district ? "" : "bg-primary-foreground",
            "my-2 cursor-pointer"
          )}
        />
        {/* Show city */}
        <Input
          type="text"
          placeholder="City"
          value={city}
          readOnly
          className={cn(
            city ? "" : "bg-primary-foreground",
            "my-2 cursor-pointer"
          )}
        />
        {/* Show state/province */}
        <Input
          type="text"
          placeholder="Province"
          value={state}
          readOnly
          className={cn(
            state ? "" : "bg-primary-foreground",
            "my-2 cursor-pointer"
          )}
        />
      </div>
      {/* Google Map */}
      <div className="h-[300px] w-full md:h-[400px] md:flex-1">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onClick={(e) => {
            if (e.latLng) {
              const pos = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              };
              setMarker(pos);
              setCenter(pos);
            }
          }}
        >
          <Marker position={marker} />
        </GoogleMap>
      </div>
    </div>
  );
}
