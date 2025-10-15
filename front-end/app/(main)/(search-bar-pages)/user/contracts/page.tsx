"use client";

import empty from "@/assets/empty.png";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/client";
import { Contract, ContractStatus, SupabaseUser } from "@/lib/type";
import {
  useGetLandlordContracts,
  useGetTenantContracts,
} from "@/queries/contract.queries";
import { useGetRoomDetailByRoomId } from "@/queries/room.queries";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import clsx from "clsx";
import contract2 from "@/assets/contract-2.png";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { debounce } from "lodash";
import fetchWithAuth from "@/utils/api/fetchWithAuth";
import ContractStatistics from "@/components/contract-statistics";

// Individual contract component for displaying contract details
function ContractDetail({ contract }: { contract: Contract }) {
  const { data: room } = useGetRoomDetailByRoomId(contract.room_id);

  // Configure badge styling based on contract status
  let badgeColor = "bg-gray-300 text-gray-700";
  let borderColor = "border-gray-300";
  let badgeText = contract?.status || "Unknown";

  switch (contract.status) {
    case ContractStatus.active:
      badgeColor = "bg-green-200 hover:bg-green-300 text-green-700";
      borderColor = "border-green-400";
      badgeText = "Active";
      break;
    case ContractStatus.pending:
      badgeColor = "bg-gray-200 hover:bg-gray-300 text-gray-700";
      borderColor = "border-gray-400";
      badgeText = "Pending";
      break;
    case ContractStatus.terminated:
      badgeColor = "bg-red-200 hover:bg-red-300 text-red-700";
      borderColor = "border-red-400";
      badgeText = "Terminated";
      break;
    case ContractStatus.expired:
      badgeColor = "bg-yellow-200 hover:bg-yellow-300 text-yellow-700";
      borderColor = "border-yellow-400";
      badgeText = "Expired";
      break;
    default:
      badgeColor = "bg-gray-200 hover:bg-gray-300 text-gray-700";
      borderColor = "border-gray-300";
      badgeText = contract?.status || "Unknown";
  }

  return (
    <Link href={`/user/contracts/${contract._id}`}>
      <div
        className={clsx(
          "my-3 group transition-all duration-200 rounded-xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-background",
          borderColor
        )}
      >
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <Image src={contract2} alt="Contract" className="w-16 h-16" />
          <div>
            {/* Status badges section */}
            <div className="flex items-center gap-2 mb-2">
              <Badge className={clsx(badgeColor)}>{badgeText}</Badge>
              {contract?.signature?.owner_signature && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 ">
                  landlord signed
                </Badge>
              )}
              {contract?.isDispute && (
                <Badge className="bg-red-500 hover:bg-red-600">Disputing</Badge>
              )}
            </div>

            {/* Housing area name */}
            <span className="flex items-center gap-1 text-2xl font-semibold mb-3">
              {room?.housing_area?.name || "Unknown"}
            </span>

            {/* Room details first row */}
            <div className="flex flex-wrap gap-4 text-secondary-foreground text-base mb-1">
              <span className="flex items-center gap-1">
                Room:{" "}
                <span className="font-medium">{room?.title || "Unknown"}</span>
              </span>
              <span className="flex items-center gap-1">
                Price:{" "}
                <span className="font-medium">
                  {room?.price?.toLocaleString() || "?"} VND
                </span>
              </span>
            </div>

            {/* Room details second row */}
            <div className="flex flex-wrap gap-4 text-secondary-foreground text-base mb-1">
              <span className="flex items-center gap-1">
                Area:{" "}
                <span className="font-medium">{room?.area || "?"} m²</span>
              </span>
              <span className="flex items-center gap-1">
                Type:{" "}
                <span className="font-medium">{room?.type || "Unknown"}</span>
              </span>
              <span className="flex items-center gap-1">
                Max Occupancy:{" "}
                <span className="font-medium">
                  {room?.max_occupancy || "?"}
                </span>
              </span>
            </div>

            {/* Contract dates */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                Created:{" "}
                {new Date(contract.createdAt).toLocaleDateString("en-GB")}
              </span>
              <span className="flex items-center gap-1">
                Expiry:{" "}
                {new Date(contract.end_date).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ContractsPage() {
  const supabase = createClient();
  const userId = useUserStore((state) => state.userId);
  const [userInfo, setUserInfo] = useState<SupabaseUser | null>(null);
  const userRole = userInfo?.role || "user";
  const [search, setSearch] = useState("");
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [roomData, setRoomData] = useState<Record<string, any>>({});
  const [showUnsigned, setShowUnsigned] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  // State for status filter
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch current user information
  useEffect(() => {
    if (!userId) return;

    supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", userId)
      .single()
      .then(({ data }) => setUserInfo(data as SupabaseUser));
  }, [userId, supabase]);

  const isLandlord = userInfo?.role === "landlord";

  // Fetch contracts based on user role
  const { data: contracts, isLoading: contractsLoading } =
    userRole === "landlord"
      ? useGetLandlordContracts()
      : useGetTenantContracts();
  console.log("Contracts data:", contracts);

  // Fetch room details for all contracts
  useEffect(() => {
    if (!contracts || contracts.length === 0) return;

    const fetchRooms = async () => {
      const roomPromises = contracts.map((contract: Contract) =>
        fetchWithAuth(`/api/rooms/detail/${contract.room_id}`)
          .then((res) => res.json())
          .then((data) => ({ roomId: contract.room_id, room: data.data }))
          .catch(() => ({ roomId: contract.room_id, room: null }))
      );

      const rooms = await Promise.all(roomPromises);
      const roomMap = rooms.reduce(
        (acc, { roomId, room }) => {
          acc[roomId] = room;
          return acc;
        },
        {} as Record<string, any>
      );
      setRoomData(roomMap);
    };

    fetchRooms();
  }, [contracts]);

  // Calculate contract counts by status
  const contractCounts = useMemo(() => {
    if (!contracts)
      return { all: 0, active: 0, pending: 0, expired: 0, terminated: 0 };

    interface ContractCounts {
      all: number;
      active: number;
      pending: number;
      expired: number;
      terminated: number;
    }

    return contracts.reduce(
      (counts: ContractCounts, contract: Contract): ContractCounts => {
        counts.all++;
        if (contract.status === ContractStatus.active) counts.active++;
        else if (contract.status === ContractStatus.pending) counts.pending++;
        else if (contract.status === ContractStatus.expired) counts.expired++;
        else if (contract.status === ContractStatus.terminated)
          counts.terminated++;
        return counts;
      },
      { all: 0, active: 0, pending: 0, expired: 0, terminated: 0 }
    );
  }, [contracts]);

  // Debounced search with filters
  const debouncedSearch = useMemo(
    () =>
      debounce(
        (
          searchTerm: string,
          contracts: Contract[],
          rooms: Record<string, any>,
          showUnsigned: boolean,
          statusFilter: string
        ) => {
          let filtered = contracts || [];

          // Filter by unsigned contracts (landlord only)
          if (showUnsigned) {
            filtered = filtered.filter(
              (contract) => contract.signature?.owner_signature !== true
            );
          }

          // Filter by status
          if (statusFilter !== "all") {
            filtered = filtered.filter(
              (contract) => contract.status === statusFilter
            );
          }

          // Filter by housing area name
          if (searchTerm) {
            filtered = filtered.filter((contract) => {
              const room = rooms[contract.room_id];
              const housingAreaName =
                room?.housing_area?.name?.toLowerCase() || "";
              return housingAreaName.includes(searchTerm.toLowerCase());
            });
          }

          // Sort by creation date (newest first)
          filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });

          setFilteredContracts(filtered);
        },
        300
      ),
    []
  );

  // Update filtered contracts when filters change
  useEffect(() => {
    if (contracts && Object.keys(roomData).length > 0) {
      debouncedSearch(search, contracts, roomData, showUnsigned, statusFilter);
    }
    return () => debouncedSearch.cancel();
  }, [
    search,
    contracts,
    roomData,
    showUnsigned,
    statusFilter,
    debouncedSearch,
  ]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(5);
  }, [search, showUnsigned, statusFilter, contracts, roomData]);

  // Loading state
  if (!userId || !userInfo || contractsLoading) {
    return (
      <div className="h-[400px]">
        <div className="animate-spin w-8 h-8 mx-auto mt-20 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-primary-foreground">
      <div className="min-h-[500px] max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-6">My Contracts</h1>

        {/* Thống kê cho landlord */}
        {isLandlord && (
          <div className="mb-8">
            <ContractStatistics />
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All", count: contractCounts.all },
              {
                key: ContractStatus.active,
                label: "Active",
                count: contractCounts.active,
              },
              {
                key: ContractStatus.pending,
                label: "Pending",
                count: contractCounts.pending,
              },
              {
                key: ContractStatus.expired,
                label: "Expired",
                count: contractCounts.expired,
              },
              {
                key: ContractStatus.terminated,
                label: "Terminated",
                count: contractCounts.terminated,
              },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  statusFilter === filter.key
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by housing area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {isLandlord && (
            <label className="flex items-center gap-2 select-none">
              <Checkbox
                checked={showUnsigned}
                onCheckedChange={() => setShowUnsigned((v) => !v)}
              />
              <span className="text-sm">Only unsigned contracts</span>
            </label>
          )}
        </div>

        {/* Filter Summary */}
        {(statusFilter !== "all" || search || showUnsigned) && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredContracts.length} contract
            {filteredContracts.length !== 1 ? "s" : ""}
            {statusFilter !== "all" && ` with status "${statusFilter}"`}
            {search && ` matching "${search}"`}
            {showUnsigned && ` (unsigned only)`}
            {(statusFilter !== "all" || search || showUnsigned) && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSearch("");
                  setShowUnsigned(false);
                }}
                className="ml-2 text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Contract List */}
        {Object.keys(roomData).length === 0 && contracts?.length > 0 ? (
          <div className="text-center text-gray-500">Loading contracts...</div>
        ) : filteredContracts.length === 0 &&
          (search || statusFilter !== "all" || showUnsigned) ? (
          <div className="text-center text-gray-500">
            No contracts found with current filters.
          </div>
        ) : filteredContracts.length === 0 ? (
          <Image
            src={empty}
            alt="No contracts"
            className="mx-auto w-1/2 h-1/2 object-cover"
          />
        ) : (
          <>
            <div className="space-y-4">
              {filteredContracts
                .slice(0, visibleCount)
                .map((contract: Contract) => (
                  <ContractDetail contract={contract} key={contract._id} />
                ))}
            </div>
            {visibleCount < filteredContracts.length && (
              <div className="flex justify-center mt-6">
                <button
                  className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                >
                  Load more ({filteredContracts.length - visibleCount}{" "}
                  remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
