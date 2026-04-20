import { useEffect } from "react";
import {
  Handle,
  type Node,
  Position,
  useUpdateNodeInternals,
  type NodeProps,
} from "@xyflow/react";
import type { JobInfoQuestionType } from "@/types/jobInformation";

export type BranchingGraphNodeRow = {
  id: string;
  handleId: string;
  label: string;
  variant: "rule" | "draft" | "fallback";
};

export type BranchingGraphNodeData = {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionType: JobInfoQuestionType;
  rows: BranchingGraphNodeRow[];
  onEditBranching: (questionId: string) => void;
};

export type BranchingGraphFlowNode = Node<
  BranchingGraphNodeData,
  "branchingQuestion"
>;

export default function BranchingGraphNode({
  id,
  data,
  selected,
}: NodeProps<BranchingGraphFlowNode>) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [data.rows.length, id, updateNodeInternals]);

  return (
    <div
      className={`w-[320px] rounded-[24px] border bg-white px-4 py-4 shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition ${
        selected
          ? "border-[#F25C54] ring-2 ring-[#FDE4DF]"
          : "border-gray-200 hover:border-[#F8C9C2]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-white !bg-[#007B8C]"
        style={{ top: 56 }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-[#FFF2EE] px-2.5 py-1 text-[11px] font-semibold text-secondary-300">
            Q{data.questionNumber}
          </span>
          <p className="mt-3 text-sm font-semibold leading-5 text-gray-800">
            {data.questionText || "Untitled question"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            <span>{data.questionType === "checkbox" ? "Checkbox" : "Choice"}</span>
            <span>{data.rows.length} route handle{data.rows.length === 1 ? "" : "s"}</span>
          </div>
        </div>
        <button
          type="button"
          className="nodrag rounded-md border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-600 hover:border-[#F25C54] hover:text-[#F25C54]"
          onClick={() => data.onEditBranching(data.questionId)}
        >
          Edit
        </button>
      </div>

      <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
          Routes
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {data.rows.length ? (
          data.rows.map((row) => (
            <div
              key={row.id}
              className={`relative rounded-xl border px-3 py-2.5 pr-10 text-xs font-semibold ${
                row.variant === "fallback"
                  ? "border-dashed border-gray-300 bg-gray-50 text-gray-600"
                  : row.variant === "draft"
                    ? "border-[#FBE3DE] bg-[#FFF6F4] text-[#C95B4B]"
                    : "border-[#F2D0CB] bg-[#FFF2EE] text-[#C95B4B]"
              }`}
            >
              <span className="block break-words leading-5">{row.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={row.handleId}
                className={`!h-3 !w-3 !border-2 !border-white ${
                  row.variant === "fallback" ? "!bg-gray-400" : "!bg-[#F25C54]"
                }`}
              />
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-xs text-gray-500">
            No rules yet. Use Edit to add conditions.
          </div>
        )}
      </div>
    </div>
  );
}
