"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useRoadmapStore } from "@/store/roadmapStore";
import { Sidebar } from "@/components/roadmap/Sidebar";
import { SkillNode } from "@/components/roadmap/SkillNode";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { RoadmapNode } from "@/types";

const nodeTypes = { skillNode: SkillNode };

function buildFlowData(
  roadmap: RoadmapNode,
  selectedChoices: Record<string, string[]>,
  depth = 0,
  parentId = "root"
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const positionMap: Record<number, { x: number; y: number }> = {};
  const LEVEL_WIDTH = 300;
  const NODE_HEIGHT = 100;

  const count = (n: RoadmapNode): number => {
    let c = 1;
    if (n.optional && n.choices) {
      c = n.choices.length;
    } else {
      n.children.forEach((child) => (c += count(child)));
    }
    return c;
  };

  const build = (
    node: RoadmapNode,
    level: number,
    yOffset: number,
    pId: string
  ): number => {
    const isRoot = level === 0;
    const displayTitle = isRoot
      ? node.title
      : node.optional && node.choices
      ? node.title
      : node.title;

    nodes.push({
      id: node.id,
      type: "skillNode",
      position: { x: level * LEVEL_WIDTH, y: yOffset },
      data: {
        label: displayTitle,
        description: node.description,
        optional: node.optional,
        choices: node.choices,
        nodeId: node.id,
        depth: level,
      },
    });

    if (pId !== "root") {
      edges.push({
        id: `${pId}-${node.id}`,
        source: pId,
        target: node.id,
        type: "smoothstep",
        animated: false,
        style: { strokeWidth: 2, stroke: "#6366f1" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
      });
    }

    let currentY = yOffset;

    if (node.optional && node.choices) {
      node.choices.forEach((choice, i) => {
        const choiceId = `${node.id}-${choice.toLowerCase().replace(/\s+/g, "-")}`;
        nodes.push({
          id: choiceId,
          type: "skillNode",
          position: { x: (level + 1) * LEVEL_WIDTH, y: currentY },
          data: {
            label: choice,
            description: `Choose ${choice} for ${node.title}`,
            nodeId: choiceId,
            depth: level + 1,
            isChoice: true,
            parentId: node.id,
          },
        });
        edges.push({
          id: `${node.id}-${choiceId}`,
          source: node.id,
          target: choiceId,
          type: "smoothstep",
          style: { strokeWidth: 2, stroke: "#22c55e" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#22c55e" },
        });
        currentY += NODE_HEIGHT + 30;
      });
    } else {
      node.children.forEach((child) => {
        const childCount = count(child);
        const subtreeHeight = childCount * (NODE_HEIGHT + 30);
        const childY = currentY + subtreeHeight / 2 - (NODE_HEIGHT + 30) / 2;
        build(child, level + 1, childY, node.id);
        currentY += subtreeHeight;
      });
    }

    return currentY - yOffset;
  }

  build(roadmap, 0, 0, "root");

  return { nodes, edges };
}

function countAllNodes(node: RoadmapNode): number {
  let count = 1;
  if (node.optional && node.choices) {
    count += node.choices.length;
  } else {
    node.children.forEach((child) => (count += countAllNodes(child)));
  }
  return count;
}

export default function RoadmapPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const skillSlug = params.skill as string;
  const skillName = searchParams.get("q") || skillSlug;

  const { roadmap, setRoadmap, selectedNode, setSelectedNode, selectedChoices, isLoading, setLoading, setError, error } =
    useRoadmapStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const generateRoadmap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: skillName }),
      });
      if (!response.ok) throw new Error("Failed to generate roadmap");
      const data = await response.json();
      setRoadmap(data.roadmap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [skillName, setRoadmap, setLoading, setError]);

  useEffect(() => {
    if (!roadmap) generateRoadmap();
  }, [roadmap, generateRoadmap]);

  const flowData = useMemo(() => {
    if (!roadmap) return { nodes: [], edges: [] };
    return buildFlowData(roadmap, selectedChoices);
  }, [roadmap, selectedChoices]);

  useEffect(() => {
    setNodes(flowData.nodes);
    setEdges(flowData.edges);
  }, [flowData, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const clickedId = node.id;
      const findNode = (n: RoadmapNode): RoadmapNode | null => {
        if (n.id === clickedId) return n;
        if (n.choices) {
          for (const c of n.choices) {
            const cid = `${n.id}-${c.toLowerCase().replace(/\s+/g, "-")}`;
            if (cid === clickedId) return n;
          }
        }
        for (const child of n.children) {
          const found = findNode(child);
          if (found) return found;
        }
        return null;
      };
      if (roadmap) {
        const found = findNode(roadmap);
        if (found) setSelectedNode(found);
      }
    },
    [roadmap, setSelectedNode]
  );

  const totalNodes = roadmap ? countAllNodes(roadmap) : 0;

  if (isLoading && !roadmap) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Generating roadmap for <span className="font-semibold text-foreground">{skillName}</span>...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-destructive">{error}</p>
          <button
            onClick={generateRoadmap}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-semibold">{skillName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalNodes} topics
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={1.5}
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { strokeWidth: 2, stroke: "#6366f1" },
            }}
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor="#6366f1"
              maskColor="rgba(0,0,0,0.1)"
              style={{ borderRadius: 8 }}
            />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        {selectedNode && (
          <Sidebar
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            skillSlug={skillSlug}
          />
        )}
      </div>
    </div>
  );
}
