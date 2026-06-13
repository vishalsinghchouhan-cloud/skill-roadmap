"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Check, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillNodeData {
  label: string;
  description?: string;
  optional?: boolean;
  choices?: string[];
  nodeId: string;
  depth: number;
  isChoice?: boolean;
  parentId?: string;
}

function SkillNodeInner({ data, selected }: NodeProps<SkillNodeData>) {
  const { label, depth, isChoice } = data;

  const colorByDepth = [
    "border-primary bg-primary/10 text-primary",
    "border-blue-500 bg-blue-500/10 text-blue-600",
    "border-emerald-500 bg-emerald-500/10 text-emerald-600",
    "border-amber-500 bg-amber-500/10 text-amber-600",
    "border-rose-500 bg-rose-500/10 text-rose-600",
    "border-violet-500 bg-violet-500/10 text-violet-600",
  ];

  const depthColor = colorByDepth[depth % colorByDepth.length];

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 px-4 py-3 shadow-sm transition-all cursor-pointer min-w-[160px] text-center",
        depthColor,
        selected && "ring-2 ring-primary ring-offset-2",
        isChoice && "border-dashed"
      )}
    >
      {depth > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !bg-primary !border-2 !border-white"
        />
      )}

      <div className="flex items-center justify-center gap-1">
        <span className="text-sm font-medium leading-tight">{label}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-primary !border-2 !border-white"
      />
    </div>
  );
}

export const SkillNode = memo(SkillNodeInner);
