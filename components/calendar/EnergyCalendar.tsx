"use client";

import { EnergyBlockPanel } from "./EnergyBlock";
import type { Task, EnergyBlock } from "@/lib/types";

const BLOCKS: EnergyBlock[] = ["Peak", "Trough", "Rebound"];

interface Props {
  tasks: Task[];
  onRemove: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDropTask: (taskId: string, block: EnergyBlock) => void;
}

export function EnergyCalendar({ tasks, onRemove, onEdit, onDelete, onDropTask }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {BLOCKS.map((block) => (
        <EnergyBlockPanel
          key={block}
          block={block}
          tasks={tasks.filter((t) => t.energy_block === block)}
          onRemove={onRemove}
          onEdit={onEdit}
          onDelete={onDelete}
          onDropTask={onDropTask}
        />
      ))}
    </div>
  );
}
