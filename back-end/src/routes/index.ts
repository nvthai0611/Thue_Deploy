import Paths from "@src/common/constants/Paths";
import { Router } from "express";
import AuthRoutes from "./AuthRoutes";
import HousingAreaRoutes from "./HousingAreaRoutes";
import RoomRoutes from "./RoomRoutes";
import UserRoutes from "./UserRoutes";
import ZaloPayRoutes from "./ZaloPayRoutes";
import TransactionRoutes from "./TransactionRoutes";

import { authorize } from "@src/middleware/authorize";
import { checkUserVerified, validateObjectId } from "@src/middleware/validate";
import validateZaloCallback from "@src/common/util/validate-zalo-callback";
import ContractRoutes from "./ContractRoutes";
import DisputeRoutes from "./DisputeRoutes";
import ChatRoutes from "./ChatRoutes";
import statisticRoutes from "./StatisticRoutes";
/******************************************************************************
                                Setup
******************************************************************************/
// Init router
const apiRouter = Router();
const userRouter = Router();
const authRouter = Router();
const housingAreaRouter = Router();
const roomRouter = Router();
const transactionRouter = Router();
const contractRouter = Router();
const zaloPayRouter = Router();
const disputeRouter = Router();
const adminRouter = Router();

//UserRoutes
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.patch(Paths.Users.UpdateChat, UserRoutes.updateChat);
userRouter.get("/test", authorize("read", "HousingArea"), UserRoutes.testHello);
userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.get(Paths.Users.Search, UserRoutes.getSearchList);
userRouter.get(Paths.Users.Detail, UserRoutes.getOne);
userRouter.post(Paths.Users.ChangeStatus, UserRoutes.changeUserStatus);
userRouter.delete(
  "/:userId/property-document",
  UserRoutes.removePropertyDocument,
);

// Auth Routes
authRouter.post(Paths.Auth.SignUp, AuthRoutes.signUp);

// Housing Area Routes
housingAreaRouter.post(
  Paths.HousingAreas.Add,
  checkUserVerified,
  authorize("create", "HousingArea"),
  HousingAreaRoutes.addNewHousingArea,
);
housingAreaRouter.patch(
  Paths.HousingAreas.RejectAdd,
  validateObjectId("housingAreaId"),
  authorize("reject", "HousingArea"),
  HousingAreaRoutes.rejectHousingArea,
);
housingAreaRouter.patch(
  Paths.HousingAreas.ApproveAdd,
  validateObjectId("housingAreaId"),
  authorize("approve", "HousingArea"),
  HousingAreaRoutes.approveHousingArea,
);
housingAreaRouter.patch(
  Paths.HousingAreas.UserPublish,
  checkUserVerified,
  validateObjectId("housingAreaId"),
  authorize("update", "HousingArea"),
  HousingAreaRoutes.publishHousingArea,
);
housingAreaRouter.patch(
  Paths.HousingAreas.UserUnpublish,
  checkUserVerified,
  validateObjectId("housingAreaId"),
  authorize("update", "HousingArea"),
  HousingAreaRoutes.unPubLishHousingArea,
);
housingAreaRouter.patch(
  Paths.HousingAreas.AdminPublish,
  validateObjectId("housingAreaId"),
  authorize("publish", "HousingArea"),
  HousingAreaRoutes.adminPublishHousingArea,
);
housingAreaRouter.patch(
  Paths.HousingAreas.AdminUnpublish,
  validateObjectId("housingAreaId"),
  authorize("unpublish", "HousingArea"),
  HousingAreaRoutes.adminUnPublishHousingArea,
);
housingAreaRouter.get(
  Paths.HousingAreas.GetDetail,
  validateObjectId("housingAreaId"),
  HousingAreaRoutes.getHousingAreaById,
);
housingAreaRouter.patch(
  Paths.HousingAreas.UpdatePending,
  checkUserVerified,
  validateObjectId("housingAreaId"),
  authorize("update", "HousingArea"),
  HousingAreaRoutes.updatePendingHousingArea,
);
housingAreaRouter.patch(
  Paths.HousingAreas.ApproveUpdate,
  validateObjectId("housingAreaId"),
  authorize("approve", "HousingArea"),
  HousingAreaRoutes.approveUpdateHousingArea,
);
housingAreaRouter.patch(
  Paths.HousingAreas.RejectUpdate,
  validateObjectId("housingAreaId"),
  authorize("reject", "HousingArea"),
  HousingAreaRoutes.rejectUpdateHousingArea,
);
housingAreaRouter.patch(
  Paths.HousingAreas.ReSubmit,
  checkUserVerified,
  validateObjectId("housingAreaId"),
  authorize("update", "HousingArea"),
  HousingAreaRoutes.resubmitHousingArea,
);
housingAreaRouter.delete(
  Paths.HousingAreas.Delete,
  checkUserVerified,
  validateObjectId("housingAreaId"),
  authorize("delete", "HousingArea"),
  HousingAreaRoutes.deleteHousingArea,
);
housingAreaRouter.get(
  Paths.HousingAreas.GetListByUserId,
  HousingAreaRoutes.viewHousingAreaByUserId,
);
housingAreaRouter.patch(
  Paths.HousingAreas.AddRate,
  validateObjectId("housingAreaId"),
  HousingAreaRoutes.addHousingAreaRate,
);
housingAreaRouter.patch(
  Paths.HousingAreas.ChangeRateStatus,
  validateObjectId("housingAreaId"),
  validateObjectId("id"),
  HousingAreaRoutes.changeHousingAreaRateStatus,
);
housingAreaRouter.get(
  Paths.HousingAreas.GetRateList,
  validateObjectId("housingAreaId"),
  HousingAreaRoutes.getAllRatingsByHousingId,
);
housingAreaRouter.patch(
  Paths.HousingAreas.UpdateAdmin,
  validateObjectId("housingAreaId"),
  HousingAreaRoutes.updateHousingAreaAdmin,
);
housingAreaRouter.delete(
  Paths.HousingAreas.DeleteAdmin,
  validateObjectId("housingAreaId"),
  authorize("deleteAdmin", "HousingArea"),
  HousingAreaRoutes.deleteHousingAreAdmin,
);
housingAreaRouter.patch(
  "/rate-reply/:housingAreaId/:ratingId",
  HousingAreaRoutes.replyToRating,
);
housingAreaRouter.get(
  Paths.HousingAreas.Search,
  HousingAreaRoutes.searchHousingArea,
);
housingAreaRouter.get(
  "/top-rated-with-rooms",
  HousingAreaRoutes.getTopHousingAreasWithRooms,
);

// Room Routes
roomRouter.post(
  Paths.Rooms.AddMany,
  authorize("create", "Room"),
  checkUserVerified,
  RoomRoutes.addRoom,
);
roomRouter.patch(
  Paths.Rooms.Update,
  checkUserVerified,
  authorize("update", "Room"),
  validateObjectId("roomId"),
  RoomRoutes.updateRoom,
);
roomRouter.get(Paths.Rooms.Search, RoomRoutes.searchRooms);
roomRouter.get(
  Paths.Rooms.GetListByHousingAreaId,
  validateObjectId("housingAreaId"),
  RoomRoutes.getListRoomByHousingAreaId,
);
roomRouter.get(
  Paths.Rooms.GetDetail,
  validateObjectId("roomId"),
  RoomRoutes.getRoomDetailByRoomId,
);
roomRouter.delete(
  Paths.Rooms.Delete,
  checkUserVerified,
  authorize("delete", "Room"),
  validateObjectId("roomId"),
  RoomRoutes.deleteRoom,
);
roomRouter.get(Paths.Rooms.GetBoostingRooms, RoomRoutes.getRoomsHaveBoosting);
roomRouter.post(
  Paths.Rooms.AddSavedRoom,
  validateObjectId("roomId"),
  RoomRoutes.addSavedRoom,
);
roomRouter.get(Paths.Rooms.GetListSavedRooms, RoomRoutes.getListSavedRooms);
roomRouter.delete(
  Paths.Rooms.DeleteRoomSaved,
  validateObjectId("roomId"),
  RoomRoutes.deleteRoomSaved,
);

// Transaction Routes
transactionRouter.post(
  Paths.Transactions.Add,
  TransactionRoutes.addTransaction,
);
transactionRouter.get(
  Paths.Transactions.History,
  TransactionRoutes.getTransaction,
);
transactionRouter.get(Paths.Transactions.All, TransactionRoutes.getAllTransaction);

// ContractRoutes
contractRouter.post(
  Paths.Contracts.Add,
  validateObjectId("roomId"),
  checkUserVerified,
  ContractRoutes.addContractByTenant,
);
contractRouter.get(
  Paths.Contracts.GetByTenant,
  ContractRoutes.getContractByTenant,
);
contractRouter.get(
  Paths.Contracts.GetByOwner,
  ContractRoutes.getContractByOwner,
);
contractRouter.get(
  "/statistics-by-owner",
  ContractRoutes.getContractStatisticsByOwner,
);
contractRouter.get(
  Paths.Contracts.GetById,
  validateObjectId("contractId"),
  ContractRoutes.getContractById,
);
contractRouter.patch(
  Paths.Contracts.SignByLandlord,
  checkUserVerified,
  authorize("update", "Contract"),
  validateObjectId("contractId"),
  ContractRoutes.SignByLandlord,
);
contractRouter.patch(
  Paths.Contracts.UpdateDepositStatus,
  validateObjectId("contractId"),
  ContractRoutes.updateDepositStatus,
);
contractRouter.patch(
  Paths.Contracts.RequestExtension,
  checkUserVerified,
  validateObjectId("contractId"),
  ContractRoutes.requestExtensionContract,
);
contractRouter.patch(
  Paths.Contracts.ConfirmExtension,
  validateObjectId("contractId"),
  ContractRoutes.confirmExtensionContract,
);

// ZaloPay Routes
zaloPayRouter.post(Paths.ZaloPay.AgreementBind, ZaloPayRoutes.agreementBind);
zaloPayRouter.post(Paths.ZaloPay.CreateOrder, ZaloPayRoutes.createOrder);
zaloPayRouter.post(
  Paths.ZaloPay.CreateOrderCallback,
  validateZaloCallback,
  ZaloPayRoutes.createOrderCallback,
);
zaloPayRouter.post(Paths.ZaloPay.QueryOrder, ZaloPayRoutes.queryOrder);
zaloPayRouter.post(Paths.ZaloPay.CreateRefund, ZaloPayRoutes.createRefund);
zaloPayRouter.post(Paths.ZaloPay.QueryRefund, ZaloPayRoutes.queryRefund);

//Dispute Routes
disputeRouter.post(
  Paths.Disputes.Add,
  checkUserVerified,
  DisputeRoutes.addDispute,
);
disputeRouter.get(
  Paths.Disputes.Detail,
  validateObjectId("disputeId"),
  DisputeRoutes.getDisputeDetail,
);
disputeRouter.get(
  Paths.Disputes.GetByContractId,
  validateObjectId("contractId"),
  DisputeRoutes.getDisputeByContractId,
);
disputeRouter.get(
  Paths.Disputes.GetListSearch,
  DisputeRoutes.getListDisputeSearch,
);
disputeRouter.patch(
  Paths.Disputes.AdminHandleDesicion,
  validateObjectId("disputeId"),
  DisputeRoutes.adminHandleDispute,
);

//Admin router
adminRouter.get(Paths.Admin.Statistics.Base, statisticRoutes.housingArea);
adminRouter.get(
  Paths.Admin.Statistics.Overview,
  statisticRoutes.housingAreaOverview,
);
adminRouter.get(
  Paths.Admin.Statistics.BoostRevenue,
  statisticRoutes.boostRevenue,
);
adminRouter.get(
  Paths.Admin.Statistics.PostingRevenue,
  statisticRoutes.postingRevenue,
);
adminRouter.get(
  Paths.Admin.Statistics.PostingRevenueOverview,
  statisticRoutes.postingRevenueOverview,
);

// Add all routers to the API router
apiRouter.use(Paths.HousingAreas.Base, housingAreaRouter);
apiRouter.use(Paths.Users.Base, userRouter);
apiRouter.use(Paths.Rooms.Base, roomRouter);
apiRouter.use(Paths.Auth.Base, authRouter);
apiRouter.use(Paths.Transactions.Base, transactionRouter);
apiRouter.use(Paths.ZaloPay.Base, zaloPayRouter);
apiRouter.use(Paths.Contracts.Base, contractRouter);
apiRouter.use(Paths.Disputes.Base, disputeRouter);
apiRouter.use("/chat", ChatRoutes);
apiRouter.use(Paths.Admin.Base, adminRouter);
/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
