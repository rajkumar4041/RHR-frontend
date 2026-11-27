export const ASSET_STATUSES = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED'] as const;

export type AssetStatus = (typeof ASSET_STATUSES)[number];

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  category: string | null;
  serialNo: string | null;
  status: AssetStatus;
}

export interface CreateAssetPayload {
  assetCode: string;
  name: string;
  category: string | null;
  serialNo: string | null;
}

export interface UpdateAssetPayload {
  name: string;
  category: string | null;
  serialNo: string | null;
}

export interface AssignAssetPayload {
  employeeId: string;
  notes: string | null;
}

export interface ReturnAssetPayload {
  notes: string | null;
}
