import { create } from "zustand";
import { getZones } from "@/services/zoneService";
import type { Zone } from "@/types/api";

type ZoneStoreState = {
  zones: Zone[];
  isLoading: boolean;
  error: string | null;
  fetchZones: () => Promise<void>;
};

export const useZoneStore = create<ZoneStoreState>((set) => ({
  zones: [],
  isLoading: false,
  error: null,

  fetchZones: async () => {
    set({ isLoading: true, error: null });
    try {
      const zones = await getZones();
      set({ zones, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch zones",
      });
    }
  },
}));

export const useZones = () => useZoneStore((state) => state.zones);
export const useZoneLoading = () => useZoneStore((state) => state.isLoading);
export const useZoneError = () => useZoneStore((state) => state.error);
export const useZoneActions = () => useZoneStore((state) => ({ fetchZones: state.fetchZones }));
