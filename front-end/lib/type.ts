import { HousingAreaStatus } from "@/utils/constants/housing-area-status";

// Room Type
export interface RoomImage {
  url: string;
  caption?: string;
  uploaded_at?: string;
}

export interface Room {
  _id: string;
  id: string;
  housing_area_id: string;
  tenant_id: string | null;
  title: string;
  room_number: string;
  price: number;
  housing_area: HousingArea;
  area: number;
  facilities: any[];
  images: RoomImage[];
  boost_history: any[];
  type: "SINGLE" | "COUPLE" | string;
  max_occupancy: number;
  owner: {
    avatar_url: string;
    identity_card: {
      full_name: string
    }
  };
  status: "AVAILABLE" | "OCCUPIED" | string;
  rental_history: any[];
  pending_update: any[];
  priority: number;
  boost_status: string;
  boost_start_at: string | null;
  boost_end_at: string | null;
  createdAt: string;
  updatedAt: string;
}

// Housing Area Type
export interface HousingAreaLocation {
  address: string;
  district: string;
  city: string;
}

export interface LegalDocument {
  url: string;
  type: string;
  uploaded_at: Date | string;
}

export interface HousingAreaRating {
  user_id: string;
  score: number;
  comment: string;
  status: string;
  created_at: Date | string;
}

export interface PendingUpdate {
  name?: string;
  description?: string;
  location?: {
    address?: string;
    district?: string;
    city?: string;
  };
  expected_rooms?: number;
  legal_documents?: {
    url?: string;
    type?: string;
    uploaded_at?: Date | string;
  }[];
}

export interface HousingArea {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  location: HousingAreaLocation;
  expected_rooms: number;
  legal_documents: LegalDocument[];
  status: HousingAreaStatus;
  rating: HousingAreaRating[];
  admin_unpublished: boolean;
  view_count: number;
  pending_update?: PendingUpdate;
  reject_reason?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// User Type
export interface SupabaseUser {
  auth_user_id: string;
  phone: string;
  email: string;
  name: string;
  role: "user" | "landlord" | "admin";
  is_active: boolean;
  phone_confirmed: boolean;
  last_active: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateOrderPayload {
  app_trans_id: string;
  app_user: string;
  amount: number;
  embed_data?: any;
  item?: any;
  description?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  isTransfer: number;
  short_name: string;
  logo: string;
  support: number;
}

export interface VietQRResponse {
  code: string;
  desc: string;
  data: Bank[];
}

// Contract
export interface Contract {
  _id: string;
  tenant_id: string;
  owner_id: string;
  room_id: string;
  end_date: string;
  status: "pending" | "active" | "expired" | string;
  signature: {
    tenant_signature: boolean;
    owner_signature: boolean;
  };
  start_date: string;
  createdAt: string;
  updatedAt: string;
  isDispute?: boolean;
}

export enum ContractStatus {
  pending = "pending",
  active = "active",
  terminated = "terminated",
  expired = "expired",
}

// Notification
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "contract" | "payment" | "system" | string;
  is_read: boolean;
  data?: any;
  created_at: string;
}

// Transaction
export enum TransactionType {
  DEPOSIT = "deposit",
  REFUND = "refund",
  SERVICE = "service",
  COMPENSATE = "compensate",
  BOOSTING_ADS = "boosting_ads",
}

// Dispute Resolution
export enum DisputeResolution {
  DISPUTERWINS = "disputer_wins",
  REJECTED = "rejected",
}
