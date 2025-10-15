import { UserDetailDocument } from "@src/models/mongoose/UserDetail";
import { IUserDetailUpdate } from "@src/models/UserDetail";
import userRepository from "@src/repos/UserRepo";
import UserService from "@src/services/UserService";

// Mock userRepository
vi.mock("@src/repos/UserRepo");

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
  afterEach(() => {
    vi.clearAllMocks();
  });

  // 1. Normal case
  // Describe the test case
  it("should update and return user detail when input is valid", async () => {
    // Create a mock result to simulate the database response
    const mockResult = {
      _id: "abc",
      ...BASE_USER_DETAIL,
    } as UserDetailDocument;
    // Mock the userRepository.updateUserDetail method to return the mock result
    // It means that when the method is called, it will return mockResult
    vi.mocked(userRepository.updateUserDetail).mockResolvedValue(mockResult);

    // Call the UserService.updateUserDetail method with the base user detail
    const res = await UserService.updateUserDetail(BASE_USER_DETAIL);

    // Assert that the userRepository.updateUserDetail method was called with
    // the correct argument and that the result matches the mock result
    expect(userRepository.updateUserDetail).toHaveBeenCalledWith(
      BASE_USER_DETAIL,
    );
    expect(res).toEqual(mockResult);
  });
});
