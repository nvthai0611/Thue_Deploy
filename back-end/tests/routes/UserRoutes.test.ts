import * as AuthUtil from "@src/common/util/authorization";
import { UserDetailDocument } from "@src/models/mongoose/UserDetail";
import { IUserDetailUpdate } from "@src/models/UserDetail";
import UserRoutes from "@src/routes/UserRoutes";
import UserService from "@src/services/UserService";
import { afterEach, describe, expect, it, vi } from "vitest";
// Mock userService
vi.mock("@src/services/UserService");

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

/******************************************************************************
                               Constants
******************************************************************************/

const BASE_USER_DETAIL: IUserDetailUpdate = {
  identity_card: {
    id_number: "123456789",
    full_name: "Test User",
  },
  status: "active",
  verified: true,
};

/******************************************************************************
                                 Tests
******************************************************************************/

describe("UserService.updateUserDetail", () => {
  // Clear all mocks after each test to avoid side effects
  afterEach(() => {
    vi.clearAllMocks();
  });

  // 1. Normal case: should update and return user detail when input is valid
  it("should update and return user detail when input is valid", async () => {
    const userId = "user123";
    const req: any = {
      body: { userDetail: BASE_USER_DETAIL },
    };
    const res = mockRes();

    // Mock getUserIdFromRequest to return a valid user ID
    vi.spyOn(AuthUtil, "getUserIdFromRequest").mockReturnValue(userId);

    // Mock UserService.updateUserDetail to return a mock result
    const mockResult = {
      _id: "abc",
      ...BASE_USER_DETAIL,
    } as UserDetailDocument;
    vi.mocked(UserService.updateUserDetail).mockResolvedValue(mockResult);

    await UserRoutes.update(req, res);

    expect(UserService.updateUserDetail).toHaveBeenCalledWith({
      ...BASE_USER_DETAIL,
      user_id: userId,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User detail updated successfully",
      data: mockResult,
    });
  });

  // 2. Error case: should throw an error when user detail is not found
  it("should return 401 if user is not authenticated", async () => {
    // Mock request without user ID
    const req: any = {
      body: {},
    };
    const res = mockRes();
    // Mock getUserIdFromRequest to return null
    vi.spyOn(AuthUtil, "getUserIdFromRequest").mockReturnValue(null);

    await UserRoutes.update(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });
});
