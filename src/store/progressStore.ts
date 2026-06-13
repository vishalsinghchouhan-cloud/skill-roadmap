"use client";

import { create } from "zustand";

interface ProgressState {
  completedNodes: Record<string, Set<string>>;

  loadProgress: (userId: string, skillSlug: string) => Promise<void>;
  markComplete: (userId: string, skillSlug: string, nodeId: string) => Promise<void>;
  markIncomplete: (userId: string, skillSlug: string, nodeId: string) => Promise<void>;
  isCompleted: (skillSlug: string, nodeId: string) => boolean;
  getProgress: (skillSlug: string, totalNodes: number) => number;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedNodes: {},

  loadProgress: async (userId, skillSlug) => {
    try {
      const response = await fetch(
        `/api/progress?userId=${userId}&skillSlug=${skillSlug}`
      );
      if (!response.ok) throw new Error("Failed to load progress");
      const data = await response.json();
      const nodeSet = new Set<string>(data.completedNodes || []);
      set((state) => ({
        completedNodes: { ...state.completedNodes, [skillSlug]: nodeSet },
      }));
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  },

  markComplete: async (userId, skillSlug, nodeId) => {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, skillSlug, nodeId, completed: true }),
      });
      set((state) => {
        const current = state.completedNodes[skillSlug] || new Set();
        const updated = new Set(current);
        updated.add(nodeId);
        return {
          completedNodes: { ...state.completedNodes, [skillSlug]: updated },
        };
      });
    } catch (error) {
      console.error("Error marking complete:", error);
    }
  },

  markIncomplete: async (userId, skillSlug, nodeId) => {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, skillSlug, nodeId, completed: false }),
      });
      set((state) => {
        const current = state.completedNodes[skillSlug] || new Set();
        const updated = new Set(current);
        updated.delete(nodeId);
        return {
          completedNodes: { ...state.completedNodes, [skillSlug]: updated },
        };
      });
    } catch (error) {
      console.error("Error marking incomplete:", error);
    }
  },

  isCompleted: (skillSlug, nodeId) => {
    const nodes = get().completedNodes[skillSlug];
    return nodes ? nodes.has(nodeId) : false;
  },

  getProgress: (skillSlug, totalNodes) => {
    const nodes = get().completedNodes[skillSlug];
    if (!nodes || totalNodes === 0) return 0;
    return Math.round((nodes.size / totalNodes) * 100);
  },
}));
