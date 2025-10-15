"use client";

import React, { useState } from "react";
import { Room } from "@/lib/type";
import { Input } from "@/components/ui/input";
import { Search, X, MapPin } from "lucide-react";
import { useSearchRooms } from "@/queries/room.queries";

interface SuggestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (room: Room) => void;
  excludedIds: string[];
}

const SuggestPopup: React.FC<SuggestPopupProps> = ({
  isOpen,
  onClose,
  onAddItem,
  excludedIds,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState<string>("");
  const [openSuggestSearch, setOpenSuggestSearch] = useState(false);
  const { data: dataQuery, isLoading } = useSearchRooms(
    localSearchQuery,
    1,
    100
  );
  const searchQueryArray: string[] = Array.from(
    new Set(dataQuery?.data.map((room: Room) => room.title))
  );

  if (!isOpen) return null;

  const filteredRooms = (dataQuery?.data || [])
    .filter((room: Room) => !excludedIds.includes(room._id))
    .sort((a: Room, b: Room) => a.price - b.price);

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
        onClick={onClose}
      ></div>
      <div className="fixed top-0 right-0 h-full bg-white p-6 rounded-l-lg shadow-lg w-1/3 z-[70] transform transition-transform duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Suggest Rooms to Compare</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="relative w-full mb-4">
          <Input
            type="search"
            placeholder="search room by name or Id"
            value={localSearchQuery}
            onChange={(e) => {
              setLocalSearchQuery(e.target.value);
              setOpenSuggestSearch(e.target.value.length > 0);
            }}
            onMouseEnter={() => setOpenSuggestSearch(true)}
            className="w-full pl-10 rounded-l-md rounded-r-none h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setOpenSuggestSearch(false);
              }
            }}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          {openSuggestSearch && (
            <div className="absolute z-10 w-full flex mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              <ul
                className="py-1 w-full "
                onMouseLeave={() => setOpenSuggestSearch(false)}
              >
                {localSearchQuery.length > 0 ? (
                  <>
                    <li
                      className="px-4 py-2 text-sm text-gray-700 w-full hover:bg-red-50 hover:text-red-600 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setLocalSearchQuery(localSearchQuery);
                        setOpenSuggestSearch(false);
                      }}
                      onMouseEnter={() => setOpenSuggestSearch(true)}
                    >
                      <Search className="h-4 w-4 text-red-500" />
                      Search for "{localSearchQuery}"
                    </li>
                    {searchQueryArray
                      .filter((item: string) =>
                        item
                          .toLowerCase()
                          .includes(localSearchQuery.toLowerCase())
                      )
                      .map((suggestion: string, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setLocalSearchQuery(suggestion);
                            setOpenSuggestSearch(false);
                          }}
                        >
                          <MapPin className="h-4 w-4 text-red-500" />
                          {suggestion}
                        </li>
                      ))}
                  </>
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500">
                    Enter keyword to see suggest search result
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : filteredRooms.length > 0 ? (
            filteredRooms.map((room: Room) => (
              <div
                key={room._id}
                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
              >
                <img
                  src={room.images[0]?.url || undefined}
                  alt={room.title}
                  className="w-12 h-12 object-cover mr-4"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    {room.room_number ? `${room.room_number} - ` : ""}
                    {room.title}
                  </span>
                  <p className="text-sm text-gray-600">
                    {room.price.toLocaleString()} đ/month
                  </p>
                </div>
                <button
                  onClick={() => onAddItem(room)}
                  className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600 transition"
                >
                  Add
                </button>
              </div>
            ))
          ) : localSearchQuery.length > 0 ? (
            <p className="text-sm text-gray-500">No matching rooms found.</p>
          ) : (
            <p className="text-sm text-gray-500">No rooms available to add.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SuggestPopup;
