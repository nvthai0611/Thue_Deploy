import RoomService from "@src/services/RoomService";
import RoomRepo from "@src/repos/RoomRepo";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@src/repos/RoomRepo");

/******************************************************************************
                                 Tests
******************************************************************************/

describe("RoomService.searchRooms", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call RoomRepo.searchRooms with correct params and return result", async () => {
    const criteria = {
      page: 1,
      limit: 10,
      sortBy: "price",
      sortOrder: "asc",
    };

    const mockRooms = [{ _id: "1", title: "Room 1" }];
    vi.mocked(RoomRepo.searchRooms).mockResolvedValue(mockRooms as any);

    const result = await RoomService.searchRooms(criteria);

    expect(RoomRepo.searchRooms).toHaveBeenCalled();
    expect(result).toBe(mockRooms);
  });
});
