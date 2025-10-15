/******************************************************************************
                                 Constants
******************************************************************************/

import { DisputeStatus } from "@src/common/constants";

// const DEFAULT_USER_VALS = (): IMembership => ({
//   name: '',
//     duration_months: 0,
//     total_price: 0,
// });

/******************************************************************************
                                  Types
******************************************************************************/

export interface IDispute {
  contract_id: string; // Reference to Contract
  disputer_id: string; // Reference to User
  transaction_id: string; // Reference to Transaction
  reason: string; // Reason for the dispute
  evidence: {
    url: string, // URL to the evidence file
    uploaded_at: Date, // Timestamp of when the evidence was uploaded
  }[];
  status: DisputeStatus; // Status of the dispute
  resolution?: {
    resolved_by?: string, // Reference to User who resolved the dispute
    decision?: string, // Decision made in the resolution
    reason?: string, // Reason for the decision
    resolved_at?: Date, // Timestamp of when the dispute was resolved
  };
}

export interface ICreateDispute {
  contract_id: string;
  disputer_id: string;
  transaction_id: string;
  reason: string;
  evidence: string[];
}

export interface ICreateDisputeReq {
  contract_id: string;
  reason: string;
  evidence: string[];
}
/******************************************************************************
                                  Setup
******************************************************************************/

/******************************************************************************
                                 Functions
******************************************************************************/

export function createDisputeTest(arg: unknown): arg is ICreateDisputeReq {
  if (typeof arg !== "object" || arg === null) return false;

  const data = arg as ICreateDisputeReq;

  const validEvidence =
    Array.isArray(data.evidence) &&
    data.evidence.every((item) => typeof item === "string");

  return (
    typeof data.contract_id === "string" &&
    typeof data.reason === "string" &&
    validEvidence
  );
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  createDisputeTest,
} as const;
