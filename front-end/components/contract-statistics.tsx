"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetLandlordContractStatistics } from "@/queries/contract.queries";
import {
  Building2,
  FileText,
  AlertTriangle,
  Users,
  Eye,
  X,
  Home,
  ChevronDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ContractStatisticsProps {
  className?: string;
}

interface ContractData {
  _id: string;
  tenant_id: string;
  tenant_name?: string;
  status: string;
  start_date: string;
  end_date: string;
  isDispute: boolean;
}

interface RoomData {
  room_id: string;
  room_title: string;
  room_number: string;
  housing_area_name: string;
  contractCount: number;
  contracts: ContractData[];
}

interface HousingAreaData {
  housing_area_name: string;
  totalRooms: number;
  activeRooms: number;
  totalContracts: number;
  rooms: RoomData[];
}

interface StatisticsData {
  totalContracts: number;
  contractsByRoom: RoomData[];
  contractsByStatus: {
    pending: number;
    active: number;
    expired: number;
    terminated: number;
  };
}

export default function ContractStatistics({
  className,
}: ContractStatisticsProps) {
  const {
    data: statistics,
    isLoading,
    error,
  } = useGetLandlordContractStatistics();
  const [selectedHousingAreaName, setSelectedHousingAreaName] = useState<
    string | null
  >(null);
  const [openModalRoomId, setOpenModalRoomId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load contract statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2" />
            <p>No statistics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalContracts, contractsByRoom, contractsByStatus } =
    statistics as StatisticsData;

  // Group rooms by housing area
  const housingAreasMap = new Map<string, HousingAreaData>();

  contractsByRoom.forEach((room) => {
    const housingAreaName = room.housing_area_name;

    if (!housingAreasMap.has(housingAreaName)) {
      housingAreasMap.set(housingAreaName, {
        housing_area_name: housingAreaName,
        totalRooms: 0,
        activeRooms: 0,
        totalContracts: 0,
        rooms: [],
      });
    }

    const housingArea = housingAreasMap.get(housingAreaName)!;
    housingArea.totalRooms++;
    housingArea.totalContracts += room.contractCount;
    housingArea.activeRooms += room.contracts.filter(
      (c) => c.status === "active"
    ).length;
    housingArea.rooms.push(room);
  });

  const housingAreas = Array.from(housingAreasMap.values());

  // Sort rooms by contract count (most contracts first)
  const sortedRooms = selectedHousingAreaName
    ? housingAreasMap
        .get(selectedHousingAreaName)
        ?.rooms.sort((a, b) => b.contractCount - a.contractCount) || []
    : [];

  // Get the room that should show modal
  const modalRoom = sortedRooms.find(room => room.room_id === openModalRoomId);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-gray-900">
            Contract Statistics by Room ({totalContracts} contracts)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {housingAreas.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Home className="h-8 w-8 mx-auto mb-2" />
              <p>No housing areas found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Housing Area Selector */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div>
                      <label className="text-sm font-semibold text-blue-800">
                        Select Housing Area:
                      </label>
                      <p className="text-xs text-blue-600">
                        Choose a housing area to view room statistics
                      </p>
                    </div>
                  </div>
                  <Select
                    value={selectedHousingAreaName || ""}
                    onValueChange={(value) => {
                      setSelectedHousingAreaName(value || null);
                      setOpenModalRoomId(null); // Close modal when changing housing area
                    }}
                  >
                    <SelectTrigger className="w-72 bg-white border-blue-300 hover:border-blue-400 focus:border-blue-500">
                      <SelectValue placeholder="Choose a housing area" />
                    </SelectTrigger>
                    <SelectContent>
                      {housingAreas.map((housingArea) => (
                        <SelectItem
                          key={housingArea.housing_area_name}
                          value={housingArea.housing_area_name}
                        >
                          <span className="font-medium text-gray-900 ml-2">
                            {housingArea.housing_area_name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Room Statistics */}
              {selectedHousingAreaName ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-green-600" />
                      <h3 className="text-xl font-bold text-green-800">
                        {selectedHousingAreaName}
                      </h3>
                    </div>
                  </div>

                  {sortedRooms.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>No rooms found in this housing area</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedRooms.map((room: RoomData) => (
                        <div
                          key={room.room_id}
                          className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {room.room_title} - Room {room.room_number}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {room.housing_area_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-semibold text-gray-900">
                                {room.contractCount}
                              </div>
                              <div className="text-xs text-gray-500">
                                {room.contractCount === 1
                                  ? "Contract"
                                  : "Contracts"}
                              </div>
                            </div>
                          </div>

                          <div className="mb-3 flex flex-wrap gap-3 text-xs">
                            <span className="text-gray-600">
                              Pending:{" "}
                              {
                                room.contracts.filter(
                                  (c) => c.status === "pending"
                                ).length
                              }
                            </span>
                            <span className="text-gray-600">
                              Active:{" "}
                              {
                                room.contracts.filter(
                                  (c) => c.status === "active"
                                ).length
                              }
                            </span>
                            <span className="text-gray-600">
                              Expired:{" "}
                              {
                                room.contracts.filter(
                                  (c) =>
                                    c.status === "expired" ||
                                    c.status === "terminated"
                                ).length
                              }
                            </span>
                            {room.contracts.some((c) => c.isDispute) && (
                              <span className="text-red-600 font-medium">
                                Has Disputes
                              </span>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenModalRoomId(room.room_id)}
                            className="w-full text-gray-700 border-gray-300 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <ChevronDown className="h-8 w-8 mx-auto mb-2" />
                  <p>Please select a housing area to view room statistics</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog - Only show for the specific room */}
      {modalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 backdrop-blur-0"
            onClick={() => setOpenModalRoomId(null)}
          ></div>
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Contract Details - {modalRoom.room_title}
              </h2>
              <button
                onClick={() => setOpenModalRoomId(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-1">
                  {modalRoom.room_title}
                </h3>
                <p className="text-sm text-gray-600">
                  {modalRoom.housing_area_name} - Room {modalRoom.room_number}
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-200/70 transition-colors">
                      <TableHead className="text-gray-700 font-medium px-6 py-4">
                        Tenant
                      </TableHead>
                      <TableHead className="text-gray-700 font-medium px-6 py-4">
                        Status
                      </TableHead>
                      <TableHead className="text-gray-700 font-medium px-6 py-4">
                        Start Date
                      </TableHead>
                      <TableHead className="text-gray-700 font-medium px-6 py-4">
                        End Date
                      </TableHead>
                      <TableHead className="text-gray-700 font-medium px-6 py-4">
                        Duration
                      </TableHead>
                      <TableHead className="text-gray-700 font-medium px-6 py-4">
                        Dispute
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalRoom.contracts.map((contract: ContractData) => (
                      <TableRow
                        key={contract._id}
                        className="border-b border-gray-100 hover:bg-gray-200/70 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900 px-6 py-4">
                          {contract.tenant_name ||
                            `Tenant ${contract.tenant_id.slice(0, 8)}...`}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant={
                              contract.status === "active"
                                ? "default"
                                : contract.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {contract.status === "active" && "Active"}
                            {contract.status === "pending" && "Pending"}
                            {contract.status === "expired" && "Expired"}
                            {contract.status === "terminated" && "Terminated"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700 px-6 py-4">
                          {new Date(contract.start_date).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-gray-700 px-6 py-4">
                          {new Date(contract.end_date).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-gray-700 px-6 py-4">
                          {Math.ceil(
                            (new Date(contract.end_date).getTime() -
                              new Date(contract.start_date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {contract.isDispute ? (
                            <Badge variant="destructive" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
