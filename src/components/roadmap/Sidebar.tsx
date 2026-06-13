"use client";

import { useState, useEffect } from "react";
import { X, BookOpen, Video, Code, ExternalLink, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapNode, NodeResources } from "@/types";

interface SidebarProps {
  node: RoadmapNode;
  onClose: () => void;
  skillSlug: string;
}

export function Sidebar({ node, onClose, skillSlug }: SidebarProps) {
  const [resources, setResources] = useState<NodeResources | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeId: node.id,
            title: node.title,
            description: node.description,
          }),
        });
        if (!response.ok) throw new Error("Failed to load resources");
        const data = await response.json();
        setResources(data.resources);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load resources");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [node.id, node.title, node.description]);

  return (
    <aside className="flex h-full w-[400px] flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold">{node.title}</h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-destructive">{error}</div>
        ) : resources ? (
          <div className="space-y-6">
            {/* Summary */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {resources.summary}
            </p>

            {/* Step 1: Learn */}
            <ResourceSection
              icon={<BookOpen className="h-4 w-4" />}
              title="Step 1: Learn"
              color="text-blue-500"
              resources={resources.theoretical}
            />

            {/* Step 2: Watch */}
            <ResourceSection
              icon={<Video className="h-4 w-4" />}
              title="Step 2: Watch"
              color="text-rose-500"
              resources={resources.practical}
            />

            {/* Step 3: Practice */}
            <ResourceSection
              icon={<Code className="h-4 w-4" />}
              title="Step 3: Practice"
              color="text-emerald-500"
              resources={resources.practice}
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function ResourceSection({
  icon,
  title,
  color,
  resources,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  resources: { title: string; url: string; type: string }[];
}) {
  return (
    <div>
      <div className={cn("mb-2 flex items-center gap-2 font-medium", color)}>
        {icon}
        {title}
      </div>
      <div className="space-y-1.5">
        {resources.map((r, i) => (
          <a
            key={i}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary/50"
          >
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            <div className="flex-1 overflow-hidden">
              <div className="truncate font-medium">{r.title}</div>
              <div className="truncate text-xs text-muted-foreground">
                {r.type}
              </div>
            </div>
            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </div>
    </div>
  );
}
