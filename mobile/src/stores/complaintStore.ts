import { create } from "zustand";
import { getComplaintById, getComplaints, submitComplaint } from "@/services/complaintService";
import type { Complaint, ComplaintFilters, PaginationMeta, SubmitComplaintPayload } from "@/types/api";

type ComplaintStoreState = {
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;
  fetchComplaints: (filters?: ComplaintFilters) => Promise<void>;
  submitComplaint: (payload: SubmitComplaintPayload) => Promise<Complaint>;
  fetchComplaintById: (id: string) => Promise<Complaint | null>;
};

const initialPagination: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const useComplaintStore = create<ComplaintStoreState>((set) => ({
  complaints: [],
  selectedComplaint: null,
  isLoading: false,
  error: null,
  pagination: initialPagination,

  fetchComplaints: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getComplaints(filters);
      set({ complaints: response.items, pagination: response.meta, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch complaints",
      });
    }
  },

  submitComplaint: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await submitComplaint(payload);
      set((state) => ({
        complaints: [created, ...state.complaints],
        isLoading: false,
        pagination: { ...state.pagination, total: state.pagination.total + 1 },
      }));
      return created;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit complaint";
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  fetchComplaintById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const complaint = await getComplaintById(id);
      set({ selectedComplaint: complaint, isLoading: false });
      return complaint;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch complaint",
      });
      return null;
    }
  },
}));

export const useComplaintList = () => useComplaintStore((state) => state.complaints);
export const useComplaintLoading = () => useComplaintStore((state) => state.isLoading);
export const useComplaintError = () => useComplaintStore((state) => state.error);
export const useComplaintPagination = () => useComplaintStore((state) => state.pagination);
export const useSelectedComplaint = () => useComplaintStore((state) => state.selectedComplaint);
export const useComplaintActions = () =>
  useComplaintStore((state) => ({
    fetchComplaints: state.fetchComplaints,
    submitComplaint: state.submitComplaint,
    fetchComplaintById: state.fetchComplaintById,
  }));
