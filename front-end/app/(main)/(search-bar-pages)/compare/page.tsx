"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Room } from "@/lib/type";
import SuggestPopup from "@/components/compare-right";
import { useGetRoomDetailByRoomId } from "@/queries/room.queries";
import { FacilityCodeMap } from "@/utils/constants/facility-codes";

// Function no longer needed since we're fetching real data

// Wrap the ComparePage in Suspense to support useSearchParams
function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [comparedItems, setComparedItems] = useState<(Room | null)[]>([
    null,
    null,
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const idsParam = searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",") : [];

  const room1Query = useGetRoomDetailByRoomId(ids[0]);
  const room2Query = useGetRoomDetailByRoomId(ids[1]);

  useEffect(() => {
    setComparedItems((prev) => {
      const newItems = [...prev];
      if (ids[0]) {
        newItems[0] = room1Query.data ?? prev[0];
      } else {
        newItems[0] = null;
      }
      if (ids[1]) {
        newItems[1] = room2Query.data ?? prev[1];
      } else {
        newItems[1] = null;
      }
      return newItems;
    });
  }, [room1Query.data, room2Query.data, ids[0], ids[1]]);

  useEffect(() => {
    const currentIds = comparedItems
      .filter((item): item is Room => item !== null)
      .map((item) => item._id)
      .join(",");
    const paramIds = idsParam ? idsParam : "";
    if (currentIds !== paramIds) {
      if (currentIds) {
        router.replace(`/compare?ids=${currentIds}`);
      } else {
        router.replace(`/compare`);
      }
    }
  }, [comparedItems, idsParam, router]);

  const removeItem = (index: number) => {
    setComparedItems((prev) => {
      const newItems = [...prev];
      newItems[index] = null;
      return newItems;
    });
  };

  const addItem = (room: Room) => {
    setComparedItems((prev) => {
      const firstEmptyIndex = prev.findIndex((item) => item === null);
      if (firstEmptyIndex === -1) return prev;
      const newItems = [...prev];
      newItems[firstEmptyIndex] = room;
      return newItems;
    });
    setShowSuggestions(false);
  };

  const getComparisonData = () => {
    const rows = [
      {
        label: "Room Number",
        values: comparedItems.map((item) => item?.room_number || "-"),
      },
      {
        label: "Title",
        values: comparedItems.map((item) => item?.title || "-"),
      },
      {
        label: "Price",
        values: comparedItems.map((item) =>
          item ? `${item.price.toLocaleString()} đ/month` : "-"
        ),
      },
      {
        label: "Area",
        values: comparedItems.map((item) => (item ? `${item.area} m²` : "-")),
      },
      {
        label: "Max Occupancy",
        values: comparedItems.map((item) =>
          item ? `${item.max_occupancy}` : "-"
        ),
      },
      {
        label: "Facilities",
        values: comparedItems.map((item) =>
          item
            ? item.facilities
                .map(
                  (f: any) =>
                    `${FacilityCodeMap[f.code] || f.name}${
                      f.quantity > 1 ? ` x${f.quantity}` : ""
                    }`
                )
                .join(", ")
            : "-"
        ),
      },
      {
        label: "Type",
        values: comparedItems.map((item) => item?.type || "-"),
      },
      {
        label: "Status",
        values: comparedItems.map((item) => item?.status || "-"),
      },
    ];
    return rows;
  };

  const excludedIds = comparedItems
    .filter((item): item is Room => item !== null)
    .map((item) => item._id);

  const hasItems = comparedItems.some((item) => item !== null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-8">Compare Rooms</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {comparedItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 relative"
            >
              {item ? (
                <>
                  <Button
                    onClick={() => removeItem(index)}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors text-gray-800 font-bold text-lg"
                    aria-label="Remove item"
                  >
                    X
                  </Button>
                  <div className="mb-4">
                    <img
                      src={item.images[0]?.url || ""}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer"
                  onClick={() => setShowSuggestions(true)}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <span className="text-blue-600 hover:underline">
                    Add Room
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <SuggestPopup
          isOpen={showSuggestions}
          onClose={() => setShowSuggestions(false)}
          onAddItem={addItem}
          excludedIds={excludedIds}
        />
        {hasItems && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-600 text-white p-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-4 h-4 bg-white text-red-600 rounded-sm flex items-center justify-center text-xs">
                  ✓
                </span>
                Compared Stats
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {getComparisonData().map((row, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4">
                  <div className="font-medium text-gray-900">{row.label}</div>
                  {row.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="text-gray-700">
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComparePageContent />
    </Suspense>
  );
}
