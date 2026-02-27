import api from "@/services/api";
import type { ApiResponse, Zone } from "@/types/api";

export const getZones = async (): Promise<Zone[]> => {
  const response = await api.get<ApiResponse<Zone[]>>("/api/zones");
  return response.data.data;
};
