"use client";

import { create } from "zustand";
import type { Roadmap, RoadmapNode } from "@/types";

interface RoadmapState {
  roadmap: Roadmap | null;
  selectedNode: RoadmapNode | null;
  selectedChoices: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;

  setRoadmap: (roadmap: Roadmap) => void;
  setSelectedNode: (node: RoadmapNode | null) => void;
  toggleChoice: (parentId: string, choice: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useRoadmapStore = create<RoadmapState>((set) => ({
  roadmap: null,
  selectedNode: null,
  selectedChoices: {},
  isLoading: false,
  error: null,

  setRoadmap: (roadmap) => set({ roadmap, error: null }),

  setSelectedNode: (node) => set({ selectedNode: node }),

  toggleChoice: (parentId, choice) =>
    set((state) => {
      const current = state.selectedChoices[parentId] || [];
      const updated = current.includes(choice)
        ? current.filter((c) => c !== choice)
        : [...current, choice];
      return {
        selectedChoices: { ...state.selectedChoices, [parentId]: updated },
      };
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () =>
    set({
      roadmap: null,
      selectedNode: null,
      selectedChoices: {},
      isLoading: false,
      error: null,
    }),
}));
