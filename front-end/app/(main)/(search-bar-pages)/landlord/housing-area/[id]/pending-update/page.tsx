"use client";

import { useParams } from "next/navigation";
import { useGetHousingAreaById } from "@/queries/housing-area.queries";
import NotFound from "@/components/not-found";
import HousingAreaDetailSkeleton from "@/components/skeleton/housing-area-detail-skeleton";
import { CarouselSpacing } from "@/components/ui/carousel-spacing";
import { LegalDocument } from "@/lib/type";
import SimpleMap from "@/components/simple-map";
import { useLoadScript } from "@react-google-maps/api";

function isEmptyValue(value: any) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  )
    return true;
  return false;
}

function mergePendingUpdate(housingAreaDetails: any) {
  const pending = housingAreaDetails.pending_update || {};
  const merged: any = { ...housingAreaDetails };

  for (const key in pending) {
    const value = pending[key];
    if (isEmptyValue(value)) {
      continue;
    }
    if (key === "location" && Array.isArray(value)) {
      merged.location = value[0] || housingAreaDetails.location;
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

const getValue = (data: any, key: string) => {
  if (key === "location") {
    let location = data?.location;
    if (Array.isArray(location)) {
      location = location[0];
    }
    if (!location) return "";
    const { address, district, city } = location;
    return [address, district, city].filter(Boolean).join(", ");
  }
  return data?.[key] ?? "";
};

export default function PendingUpdateComparePage() {
  const { id: housingAreaId } = useParams();
  const {
    data: housingAreaDetails,
    isLoading,
    error,
  } = useGetHousingAreaById(String(housingAreaId));

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  if (isLoading) return <HousingAreaDetailSkeleton />;
  if (error || !housingAreaDetails) return <NotFound />;

  const pending = housingAreaDetails.pending_update;
  if (!pending) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center text-lg">
        No pending update found.
      </div>
    );
  }

  const pendingUpdateHousingAreaDetail = mergePendingUpdate(housingAreaDetails);

  const fields = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    { key: "expected_rooms", label: "Number of Rooms" },
    { key: "location", label: "Address" },
    // Add more fields if needed
  ];

  const originalImages = Array.isArray(housingAreaDetails.legal_documents)
    ? housingAreaDetails.legal_documents.map((doc: LegalDocument) => doc.url)
    : [];

  const pendingLegalDocs = pendingUpdateHousingAreaDetail.legal_documents;
  const pendingImages = Array.isArray(pendingLegalDocs)
    ? pendingLegalDocs.map((doc: LegalDocument) => doc.url)
    : [];

  // Helper to get lat/lng for map
  const getLatLng = (data: any) => {
    let location = data?.location;
    if (Array.isArray(location)) location = location[0];
    return {
      lat: location?.lat,
      lng: location?.lng,
    };
  };

  return (
    <div className="bg-primary-foreground min-h-[600px]">
      <div className="max-w-5xl mx-auto px-2 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Original Version Card */}
          <div className="bg-background rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Original</h2>
            <div className="mb-6">
              <CarouselSpacing
                images={
                  originalImages.length
                    ? originalImages
                    : [
                        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
                      ]
                }
                showArrows={false}
              />
            </div>

            <div className="space-y-6">
              {fields.map(({ key, label }) => (
                <div key={key}>
                  <div className="text-gray-500 text-sm">{label}</div>
                  <div className="bg-primary-foreground rounded p-3 min-h-[40px]">
                    {getValue(housingAreaDetails, key) || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-6 text-gray-500 mt-5">
              <h3 className="text-base mb-2">Map</h3>
              <SimpleMap
                lat={getLatLng(housingAreaDetails).lat}
                lng={getLatLng(housingAreaDetails).lng}
                isLoaded={isLoaded}
              />
            </div>
          </div>
          {/* Pending Update Card */}
          <div className="bg-background rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Update Review
            </h2>
            <div className="mb-6">
              {pendingImages.length ? (
                <CarouselSpacing images={pendingImages} showArrows={false} />
              ) : (
                <div className="bg-gray-50 rounded p-8 text-center text-gray-400">
                  No change
                </div>
              )}
            </div>

            <div className="space-y-6">
              {fields.map(({ key, label }) => {
                const hasUpdate = key in pending;
                const oldValue = getValue(housingAreaDetails, key);
                const newValue = getValue(pendingUpdateHousingAreaDetail, key);
                const changed = hasUpdate && oldValue !== newValue;
                return (
                  <div key={key}>
                    <div className="text-gray-500 text-sm">{label}</div>
                    <div
                      className={`rounded p-3 min-h-[40px] ${
                        changed
                          ? "bg-emerald-200 border border-emerald-300"
                          : "bg-primary-foreground"
                      }`}
                    >
                      {newValue || <span className="text-gray-400">N/A</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mb-6 text-gray-500 mt-5">
              <h3 className="text-base mb-2">Map</h3>
              <SimpleMap
                lat={getLatLng(pendingUpdateHousingAreaDetail).lat}
                lng={getLatLng(pendingUpdateHousingAreaDetail).lng}
                isLoaded={isLoaded}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
