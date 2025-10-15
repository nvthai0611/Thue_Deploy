import RoomRepo from "@src/repos/RoomRepo";
import RoomRoutes from "@src/routes/RoomRoutes";
import RoomService from "@src/services/RoomService";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@src/services/RoomService");
vi.mock("@src/repos/RoomRepo");

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

/******************************************************************************
                               Constants
******************************************************************************/

describe("RoomRoutes.searchRooms", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return rooms and pagination when input is valid", async () => {
    const req: any = {
      query: {
        minPrice: "1000000",
        page: "1",
        limit: "10",
      },
    };
    const res = mockRes();

    const mockRooms = [{ _id: "1", title: "Room 1" }];
    vi.mocked(RoomService.searchRooms).mockResolvedValue(mockRooms as any);
    vi.mocked(RoomRepo.countRooms).mockResolvedValue(1);

    await RoomRoutes.searchRooms(req, res);

    expect(RoomService.searchRooms).toHaveBeenCalled();
    expect(RoomRepo.countRooms).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.any(Number),
        message: expect.any(String),
        data: mockRooms,
        pagination: expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        }),
      }),
    );
  });
});
