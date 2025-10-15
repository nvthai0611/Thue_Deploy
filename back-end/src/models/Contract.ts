/******************************************************************************
                                 Constants
******************************************************************************/

import { ContractStatus } from "@src/common/constants";

// const DEFAULT_USER_VALS = (): IMembership => ({
//   name: '',
//     duration_months: 0,
//     total_price: 0,
// });

/******************************************************************************
                                  Types
******************************************************************************/

export interface IContract {
  tenant_id: string; 
  owner_id: string; 
  room_id: string; 
  pending_updates?: {
    new_end_date?: Date,
    signature?: {
      tenant_signature?: boolean, 
      owner_signature?: boolean,
    },
  };
  start_date: Date; 
  end_date: Date; 
  status?: ContractStatus; 
  signature?: {
    tenant_signature?: boolean, 
    owner_signature?: boolean,
  };
  termination?: {
    terminal_by?: string, 
    reason?: string,
    resolve_by?: string,
    resolve_at?: Date,
  };
}
export interface CreateContractRepo {
  tenant_id: string; 
  owner_id: string; 
  room_id: string; 
  end_date: Date; 
}


/******************************************************************************
                                  Setup
******************************************************************************/



/******************************************************************************
                                 Functions
******************************************************************************/

/******************************************************************************
                                Export default
******************************************************************************/

export default {

} as const;
