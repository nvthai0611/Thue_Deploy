import { ContractStatus } from "@src/common/constants";
import { CreateContractRepo } from "@src/models/Contract";
import Contract, { ContractDocument } from "@src/models/mongoose/Contract";
import DisputeRepo from "./DisputeRepo";
import { supabase } from "@src/common/util/supabase";

/******************************************************************************
                                Functions
******************************************************************************/
async function findContractById(
  contractId: string,
): Promise<ContractDocument | null> {
  const contract = await Contract.findById(contractId);
  return contract;
}

async function addContract(
  data: CreateContractRepo,
): Promise<ContractDocument> {
  const newContract = new Contract({
    tenant_id: data.tenant_id,
    owner_id: data.owner_id,
    room_id: data.room_id,
    end_date: data.end_date,
    signature: {
      tenant_signature: true,
    },
  });
  return await newContract.save();
}
async function getContractByRoomId(
  roomId: string,
): Promise<ContractDocument[] | null> {
  const contract = await Contract.find({
    room_id: roomId,
    status: {
      $in: [
        ContractStatus.active,
        ContractStatus.expired,
        ContractStatus.terminated,
      ],
    },
  });
  return contract;
}
async function getContractsByTenantId(
  tenantId: string,
): Promise<(Record<string, any> & { isDispute: boolean })[]> {
  const contracts = await Contract.find({ tenant_id: tenantId });
  const contractIds = contracts.map((c) => String(c._id));
  const disputes = await DisputeRepo.findByContractIds(contractIds);
  const disputeContractIds = new Set(
    disputes.map((d) => String(d.contract_id)),
  );

  return contracts.map((contract) => {
    const plainContract = contract.toObject();
    return {
      _id: plainContract._id,
      tenant_id: plainContract.tenant_id,
      owner_id: plainContract.owner_id,
      room_id: plainContract.room_id,
      start_date: plainContract.start_date,
      end_date: plainContract.end_date,
      status: plainContract.status,
      signature: plainContract.signature,
      isDispute: disputeContractIds.has(String(contract._id)),
    };
  });
}
async function getContractsByOwnerId(
  ownerId: string,
): Promise<(Record<string, any> & { isDispute: boolean })[]> {
  const contracts = await Contract.find({ owner_id: ownerId });
  const contractIds = contracts.map((c) => String(c._id));
  const disputes = await DisputeRepo.findByContractIds(contractIds);

  const disputeContractIds = new Set(
    disputes.map((d) => String(d.contract_id)),
  );

  return contracts.map((contract) => {
    const plainContract = contract.toObject();
    return {
      _id: plainContract._id,
      tenant_id: plainContract.tenant_id,
      owner_id: plainContract.owner_id,
      room_id: plainContract.room_id,
      start_date: plainContract.start_date,
      end_date: plainContract.end_date,
      status: plainContract.status,
      signature: plainContract.signature,
      isDispute: disputeContractIds.has(String(contract._id)),
    };
  });
}
async function updateDeposit(
  contractId: string,
): Promise<ContractDocument | null> {
  const contract = await Contract.findByIdAndUpdate(
    contractId,
    { $set: { status: ContractStatus.active } },
    { new: true },
  );
  return contract;
}

async function deleteAllContrctsByRoomId(roomId: string): Promise<void> {
  await Contract.deleteMany({
    room_id: roomId,
    status: ContractStatus.pending,
  });
}

async function getContractActivingByRoomId(
  roomId: string,
): Promise<ContractDocument | null> {
  const contract = await Contract.findOne({
    room_id: roomId,
    status: ContractStatus.active,
  });
  return contract;
}

async function getContractStatisticsByOwnerId(
  ownerId: string,
): Promise<{
  totalContracts: number,
  contractsByRoom: {
    room_id: string,
    room_title: string,
    room_number: string,
    housing_area_name: string,
    contractCount: number,
    contracts: {
      _id: string,
      tenant_id: string,
      tenant_name?: string,
      status: string,
      start_date: Date,
      end_date: Date,
      isDispute: boolean,
    }[],
  }[],
  contractsByStatus: {
    pending: number,
    active: number,
    expired: number,
    terminated: number,
  },
}> {
  const contracts = await Contract.find({ owner_id: ownerId });
  
  const roomIds = [...new Set(contracts.map(c => c.room_id.toString()))];
  
  const tenantIds = [...new Set(contracts.map(c => c.tenant_id.toString()))];
  
  const RoomModel = (await import("@src/models/mongoose/Room")).default;
  const HousingAreaModel = (await import("@src/models/mongoose/HousingArea")).default;
  
  const rooms = await RoomModel.find({ _id: { $in: roomIds } });
  const housingAreaIds = [...new Set(rooms.map(r => r.housing_area_id.toString()))];
  const housingAreas = await HousingAreaModel.find({ _id: { $in: housingAreaIds } });
  
  const tenantNameMap = new Map();
  if (tenantIds.length > 0) {
    try {
      const { data: tenantUsers, error: tenantError } = await supabase
        .from("users")
        .select("auth_user_id, name")
        .in("auth_user_id", tenantIds);

      if (tenantError) {
        throw new Error(
          `Error fetching tenant names: ${tenantError.message}`,
        );
      } else if (tenantUsers) {
        tenantUsers.forEach(user => {
          tenantNameMap.set(user.auth_user_id, user.name);
        });
      }
    } catch (error) {
      throw new Error(
        `Supabase connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
  
  const roomMap = new Map(rooms.map(r => [String(r._id), r]));
  const housingAreaMap = new Map<string, { name?: string }>(
    housingAreas.map(h => [String(h._id), h as { name?: string }]),
  );
  
  const contractIds = contracts.map(c => String(c._id));
  const disputes = await DisputeRepo.findByContractIds(contractIds);
  const disputeContractIds = new Set(
    disputes.map(d => String(d.contract_id)),
  );
  
  const contractsByRoomMap = new Map<string, {
    room_id: string,
    room_title: string,
    room_number: string,
    housing_area_name: string,
    contractCount: number,
    contracts: {
      _id: string,
      tenant_id: string,
      tenant_name?: string,
      status: string,
      start_date: Date,
      end_date: Date,
      isDispute: boolean,
    }[],
  }>();
  
  contracts.forEach(contract => {
    const roomId = contract.room_id.toString();
    const room = roomMap.get(roomId);
    let housingArea = null;
    if (room && room.housing_area_id) {
      housingArea = housingAreaMap.get(String(room.housing_area_id));
    }
    
    if (!contractsByRoomMap.has(roomId)) {
      contractsByRoomMap.set(roomId, {
        room_id: roomId,
        room_title: room?.title ?? "Phòng không xác định",
        room_number: room?.room_number ?? "Không xác định",
        housing_area_name: housingArea?.name ?? "Khu nhà trọ không xác định",
        contractCount: 0,
        contracts: [],
      });
    }
    
    const roomStats = contractsByRoomMap.get(roomId)!;
    roomStats.contractCount++;
    
    roomStats.contracts.push({
      _id: String(contract._id),
      tenant_id: contract.tenant_id,
      tenant_name: tenantNameMap.get(contract.tenant_id) ?? 
        `Tenant ${String(contract.tenant_id).slice(0, 8)}...`,
      status: contract.status ?? 'unknown',
      start_date: contract.start_date,
      end_date: contract.end_date,
      isDispute: disputeContractIds.has(String(contract._id)),
    });
  });
  
  const totalContracts = contracts.length;
  
  const contractsByStatus = {
    pending: contracts.filter(c => c.status === ContractStatus.pending).length,
    active: contracts.filter(c => c.status === ContractStatus.active).length,
    expired: contracts.filter(c => c.status === ContractStatus.expired).length,
    terminated: contracts.filter(c => c.status === ContractStatus.terminated).length,
  };
  
  return {
    totalContracts,
    contractsByRoom: Array.from(contractsByRoomMap.values()),
    contractsByStatus,
  };
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  findContractById,
  addContract,
  getContractByRoomId,
  getContractsByTenantId,
  getContractsByOwnerId,
  getContractStatisticsByOwnerId,
  updateDeposit,
  deleteAllContrctsByRoomId,
  getContractActivingByRoomId,
} as const;
