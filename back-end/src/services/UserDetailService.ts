import UserDetailRepo from "@src/repos/UserDetailRepo";

/******************************************************************************
                                Constants
******************************************************************************/

/******************************************************************************
                                Functions
******************************************************************************/
const updateChatWithUser = async (userId: string, chatId: string) => {
  const res1 = await UserDetailRepo.updateChatWithUser(userId, chatId);
  const res2 = await UserDetailRepo.updateChatWithUser(chatId, userId);
  return [res1, res2];
};

/******************************************************************************
                                Export default
******************************************************************************/

export default { updateChatWithUser } as const;
