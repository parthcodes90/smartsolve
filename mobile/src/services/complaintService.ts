import api from "@/services/api";
import type {
  ApiResponse,
  Complaint,
  ComplaintFilters,
  PaginatedResponse,
  SubmitComplaintPayload,
} from "@/types/api";

const buildFileName = (uri: string, fallback = "complaint-photo.jpg") => {
  const candidate = uri.split("/").pop();
  return candidate && candidate.includes(".") ? candidate : fallback;
};

export const submitComplaint = async (payload: SubmitComplaintPayload): Promise<Complaint> => {
  const fileName = payload.photoFileName ?? buildFileName(payload.photoUri);

  const photoBlob = await (await fetch(payload.photoUri)).blob();
  const formData = new FormData();

  formData.append("description", payload.description);
  formData.append("category_id", payload.categoryId);
  formData.append("latitude", String(payload.latitude));
  formData.append("longitude", String(payload.longitude));
  formData.append("address", payload.address ?? "");
  formData.append("submitted_by", payload.submittedBy ?? "anonymous");
  formData.append("photo", photoBlob, fileName);

  const response = await api.post<ApiResponse<Complaint>>("/api/complaints", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (payload.onUploadProgress && event.total) {
        payload.onUploadProgress(event.loaded / event.total);
      }
    },
  });

  return response.data.data;
};

export const getComplaints = async (
  filters: ComplaintFilters = {}
): Promise<PaginatedResponse<Complaint>> => {
  const response = await api.get<ApiResponse<Complaint[]>>("/api/complaints", {
    params: {
      status: filters.status,
      zoneId: filters.zoneId,
      page: filters.page,
      limit: filters.limit,
    },
  });

  const items = response.data.data;
  const meta = response.data.meta as PaginatedResponse<Complaint>["meta"] | undefined;

  return {
    items,
    meta: meta ?? {
      page: filters.page ?? 1,
      limit: filters.limit ?? (items.length || 10),
      total: items.length,
      totalPages: 1,
    },
  };
};

export const getComplaintById = async (id: string): Promise<Complaint> => {
  const response = await api.get<ApiResponse<Complaint>>(`/api/complaints/${id}`);
  return response.data.data;
};
