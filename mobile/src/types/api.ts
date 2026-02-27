export type UUID = string;

export type ApiResponse<T> = {
  data: T;
  error: string | null;
  meta?: Record<string, unknown>;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type Department = {
  id: UUID;
  name: string;
  code?: string;
  zoneId?: UUID;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: UUID;
  name: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Zone = {
  id: UUID;
  name: string;
  wardNumber?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ComplaintStatus =
  | "PENDING"
  | "AI_ANALYSIS"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

export type Complaint = {
  id: UUID;
  description: string;
  categoryId?: UUID;
  category?: Category | string;
  address?: string | null;
  photoUrl?: string | null;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  zoneId?: UUID | null;
  zone?: Zone;
  assignedDepartmentId?: UUID | null;
  assignedDepartment?: Department;
  submittedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ComplaintFilters = {
  status?: ComplaintStatus;
  zoneId?: UUID;
  page?: number;
  limit?: number;
};

export type SubmitComplaintPayload = {
  description: string;
  categoryId: UUID;
  latitude: number;
  longitude: number;
  address?: string;
  submittedBy?: string;
  photoUri: string;
  photoFileName?: string;
  photoMimeType?: string;
  onUploadProgress?: (progress: number) => void;
};
