import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import PageMeta from "@/components/common/PageMeta";
import PageContentContainer from "@/components/layout/PageContentContainer";
import BranchingGraphNode, {
  type BranchingGraphFlowNode,
} from "@/components/ui/job-information/BranchingGraphNode";
import JobInformationBranchingModal from "@/components/ui/job-information/JobInformationBranchingModal";
import { ChevronLeftIcon } from "@/icons";
import { useJobInformationStore } from "@/stores/jobInformationStore";
import type { JobInfoQuestion, JobInfoTemplate } from "@/types/jobInformation";
import {
  FALLBACK_BRANCH_HANDLE_ID,
  clearBranchHandleConnection,
  connectBranchHandle,
  getBranchRuleHandleId,
  getBranchRuleLabel,
  getDefaultGraphPosition,
  getOptionHandleId,
  getOptionLetter,
  normalizeJobInfoQuestions,
} from "@/utils/jobInformationBranching";

type LocationState = {
  templateName?: string;
  questions?: JobInfoQuestion[];
};

const nodeTypes = {
  branchingQuestion: BranchingGraphNode,
};

const buildGraphNodes = (
  questions: JobInfoQuestion[],
  onEditBranching: (questionId: string) => void
): BranchingGraphFlowNode[] =>
  questions.map((question, index) => {
    const directRuleOptionIds = new Set(
      question.branchRules
        .filter((rule) => rule.conditions.length === 1)
        .map((rule) => rule.conditions[0]?.optionId)
        .filter(Boolean)
    );

    const rows = [
      ...question.branchRules.map((rule) => ({
        id: rule.id,
        handleId: getBranchRuleHandleId(rule.id),
        label: getBranchRuleLabel(question, rule),
        variant: "rule" as const,
      })),
      ...question.options
        .filter((option) => !directRuleOptionIds.has(option.id))
        .map((option) => ({
          id: `draft-${option.id}`,
          handleId: getOptionHandleId(option.id),
          label: `Connect ${getOptionLetter(question, option.id)}. ${option.label || "Option"}`,
          variant: "draft" as const,
        })),
      {
        id: `${question.id}-fallback`,
        handleId: FALLBACK_BRANCH_HANDLE_ID,
        label: "Else / fallback",
        variant: "fallback" as const,
      },
    ];

    return {
      id: question.id,
      type: "branchingQuestion",
      position: question.graphPosition ?? getDefaultGraphPosition(index),
      data: {
        questionId: question.id,
        questionNumber: index + 1,
        questionText: question.text,
        questionType: question.type,
        rows,
        onEditBranching,
      },
      draggable: true,
    };
  });

const buildGraphEdges = (questions: JobInfoQuestion[]) => {
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const edges: Edge[] = [];

  questions.forEach((question) => {
    question.branchRules.forEach((rule) => {
      if (!rule.targetQuestionId || !questionMap.has(rule.targetQuestionId)) return;
      if (rule.targetQuestionId === question.id) return;

      edges.push({
        id: `${question.id}:${rule.id}`,
        source: question.id,
        sourceHandle: getBranchRuleHandleId(rule.id),
        target: rule.targetQuestionId,
        type: "smoothstep",
        label: getBranchRuleLabel(question, rule),
        labelStyle: {
          fill: "#C95B4B",
          fontSize: 11,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: "#FFF7F5",
          stroke: "#F8C9C2",
          strokeWidth: 1,
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 10,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#F25C54",
        },
        reconnectable: "target",
        style: {
          stroke: "#F25C54",
          strokeWidth: 1.8,
        },
      });
    });

    if (
      question.fallbackNextQuestionId &&
      questionMap.has(question.fallbackNextQuestionId) &&
      question.fallbackNextQuestionId !== question.id
    ) {
      edges.push({
        id: `${question.id}:fallback`,
        source: question.id,
        sourceHandle: FALLBACK_BRANCH_HANDLE_ID,
        target: question.fallbackNextQuestionId,
        type: "smoothstep",
        label: "Else",
        labelStyle: {
          fill: "#6B7280",
          fontSize: 11,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: "#F9FAFB",
          stroke: "#D1D5DB",
          strokeWidth: 1,
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 10,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#9CA3AF",
        },
        reconnectable: "target",
        style: {
          stroke: "#9CA3AF",
          strokeWidth: 1.5,
          strokeDasharray: "6 4",
        },
      });
    }
  });

  return edges;
};

export default function JobInformationBranching() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { questions: stateQuestions } = (location.state as LocationState | null) ?? {};
  const templates = useJobInformationStore((state) => state.templates);
  const updateTemplate = useJobInformationStore((state) => state.updateTemplate);

  const template = useMemo<JobInfoTemplate | undefined>(
    () => templates.find((item) => item.id === templateId),
    [templateId, templates]
  );
  const hydratedQuestions = useMemo(
    () => template?.questions ?? stateQuestions ?? [],
    [stateQuestions, template?.questions]
  );

  const [questions, setQuestions] = useState<JobInfoQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<
    BranchingGraphFlowNode
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const nextQuestions = normalizeJobInfoQuestions(hydratedQuestions);
    setQuestions(nextQuestions);
    setSelectedQuestionId((current) =>
      current && nextQuestions.some((question) => question.id === current)
        ? current
        : nextQuestions[0]?.id ?? null
    );
    setEditingQuestionId((current) =>
      current && nextQuestions.some((question) => question.id === current)
        ? current
        : null
    );
  }, [hydratedQuestions]);

  const persistQuestions = useCallback(
    (nextQuestions: JobInfoQuestion[]) => {
      const normalizedQuestions = normalizeJobInfoQuestions(nextQuestions);
      setQuestions(normalizedQuestions);
      if (template?.id) {
        updateTemplate(template.id, { questions: normalizedQuestions });
      }
    },
    [template?.id, updateTemplate]
  );

  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId]
  );
  const editingQuestion = useMemo(
    () => questions.find((question) => question.id === editingQuestionId) ?? null,
    [editingQuestionId, questions]
  );

  const questionIndexMap = useMemo(
    () => new Map(questions.map((question, index) => [question.id, index + 1])),
    [questions]
  );
  const graphSummary = useMemo(() => {
    const savedRules = questions.reduce(
      (count, question) => count + question.branchRules.length,
      0
    );
    const connectedRoutes = questions.reduce((count, question) => {
      const ruleTargets = question.branchRules.filter((rule) => rule.targetQuestionId).length;
      return count + ruleTargets + (question.fallbackNextQuestionId ? 1 : 0);
    }, 0);
    const fallbackRoutes = questions.filter(
      (question) => question.fallbackNextQuestionId
    ).length;

    return {
      savedRules,
      connectedRoutes,
      fallbackRoutes,
    };
  }, [questions]);

  const graphNodes = useMemo(
    () =>
      buildGraphNodes(questions, (questionId) => {
        setSelectedQuestionId(questionId);
        setEditingQuestionId(questionId);
      }),
    [questions]
  );

  const graphEdges = useMemo(() => buildGraphEdges(questions), [questions]);

  useEffect(() => {
    setNodes(graphNodes);
  }, [graphNodes, setNodes]);

  useEffect(() => {
    setEdges(graphEdges);
  }, [graphEdges, setEdges]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.sourceHandle || !connection.target) return;
      if (connection.source === connection.target) return;
      persistQuestions(
        connectBranchHandle(
          questions,
          connection.source,
          connection.sourceHandle,
          connection.target
        )
      );
    },
    [persistQuestions, questions]
  );

  const handleReconnect = useCallback(
    (oldEdge: Edge, connection: Connection) => {
      if (!oldEdge.source || !oldEdge.sourceHandle || !connection.target) return;
      if (oldEdge.source === connection.target) return;
      persistQuestions(
        connectBranchHandle(
          questions,
          oldEdge.source,
          oldEdge.sourceHandle,
          connection.target
        )
      );
    },
    [persistQuestions, questions]
  );

  const handleEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      let nextQuestions = questions;
      deletedEdges.forEach((edge) => {
        if (!edge.source || !edge.sourceHandle) return;
        nextQuestions = clearBranchHandleConnection(
          nextQuestions,
          edge.source,
          edge.sourceHandle
        );
      });
      persistQuestions(nextQuestions);
    },
    [persistQuestions, questions]
  );

  const handleNodeDragStop = useCallback(
    (_event: unknown, node: BranchingGraphFlowNode) => {
      persistQuestions(
        questions.map((question) =>
          question.id === node.id
            ? { ...question, graphPosition: node.position }
            : question
        )
      );
    },
    [persistQuestions, questions]
  );
  const handleResetLayout = useCallback(() => {
    persistQuestions(
      questions.map((question, index) => ({
        ...question,
        graphPosition: getDefaultGraphPosition(index),
      }))
    );
  }, [persistQuestions, questions]);

  return (
    <>
      <PageMeta title="Branching" description="Job information branching" />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <AppBreadcrumb />
        <PageContentContainer className="flex min-h-0 flex-1 flex-col overflow-hidden py-6">
          <div className="flex items-center gap-2 px-6 text-sm font-semibold text-gray-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full p-1 text-gray-400 hover:text-[#007B8C]"
              aria-label="Back"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-[#007B8C]">Branching</span>
          </div>

          <div className="mt-4 grid min-h-0 flex-1 gap-4 px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
              <div className="border-b border-gray-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF9F7_100%)] px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-800">Conditional flow</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Drag nodes to tidy the layout, or pull a route to another question to
                      update where that answer goes. Changes save automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetLayout}
                    disabled={questions.length === 0}
                    className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-[#F25C54] hover:text-[#F25C54] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset layout
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600">
                    {questions.length} question{questions.length === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-full bg-[#FFF2EE] px-3 py-1 text-[11px] font-semibold text-[#C95B4B]">
                    {graphSummary.savedRules} saved rule
                    {graphSummary.savedRules === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-full bg-[#F4F7FB] px-3 py-1 text-[11px] font-semibold text-[#49617A]">
                    {graphSummary.connectedRoutes} connected route
                    {graphSummary.connectedRoutes === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-full bg-gray-50 px-3 py-1 text-[11px] font-semibold text-gray-500">
                    {graphSummary.fallbackRoutes} fallback
                    {graphSummary.fallbackRoutes === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="rounded-full border border-[#F2D0CB] bg-[#FFF2EE] px-3 py-1 text-[#C95B4B]">
                    Saved rule
                  </span>
                  <span className="rounded-full border border-[#FBE3DE] bg-[#FFF6F4] px-3 py-1 text-[#C95B4B]">
                    Quick connect
                  </span>
                  <span className="rounded-full border border-dashed border-gray-300 bg-gray-50 px-3 py-1 text-gray-500">
                    Else / fallback
                  </span>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500">
                  No questions found for this Job Information yet.
                </div>
              ) : (
                <div className="h-full min-h-[540px] bg-[radial-gradient(circle_at_top,#FFF8F6_0%,#FFFFFF_55%,#FFFFFF_100%)]">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={handleConnect}
                    onReconnect={handleReconnect}
                    onEdgesDelete={handleEdgesDelete}
                    onNodeDragStop={handleNodeDragStop}
                    onNodeClick={(_, node) => setSelectedQuestionId(node.id)}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.55}
                    maxZoom={1.4}
                    deleteKeyCode={["Backspace", "Delete"]}
                    proOptions={{ hideAttribution: true }}
                  >
                    <Background gap={20} color="#F3F4F6" />
                    <Controls showInteractive={false} />
                  </ReactFlow>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-800">How to use</h3>
                <ul className="mt-3 space-y-2 text-xs text-gray-500">
                  <li>Solid coral rows are saved rules already attached to a destination.</li>
                  <li>Light coral rows let you connect an option directly from the graph.</li>
                  <li>Drag an existing line endpoint onto another card to retarget the route.</li>
                  <li>Use Reset layout any time you want a cleaner presentation before sharing.</li>
                </ul>
              </div>

              <div className="min-h-0 flex-1 rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-gray-800">Selected question</h3>
                {selectedQuestion ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <span className="bg-[#FFF2EE] px-2 py-1 text-xs font-semibold text-secondary-300">
                        Q{questionIndexMap.get(selectedQuestion.id) ?? "?"}
                      </span>
                      <p className="mt-3 text-sm font-semibold text-gray-800">
                        {selectedQuestion.text || "Untitled question"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                          {selectedQuestion.type === "checkbox" ? "Checkbox" : "Choice"}
                        </span>
                        <span className="rounded-full bg-[#FFF2EE] px-2.5 py-1 text-[#C95B4B]">
                          {selectedQuestion.branchRules.length} rule
                          {selectedQuestion.branchRules.length === 1 ? "" : "s"}
                        </span>
                        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-gray-500">
                          {selectedQuestion.options.length} option
                          {selectedQuestion.options.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingQuestionId(selectedQuestion.id)}
                      className="rounded-md border border-[#F25C54] px-3 py-2 text-xs font-semibold text-[#F25C54] hover:bg-[#FFF2EE]"
                    >
                      Edit branching rules
                    </button>

                    <div className="space-y-2">
                      {selectedQuestion.branchRules.length ? (
                        selectedQuestion.branchRules.map((rule) => {
                          const targetQuestion = questions.find(
                            (question) => question.id === rule.targetQuestionId
                          );

                          return (
                            <div
                              key={rule.id}
                              className="rounded-lg border border-[#F2D0CB] bg-[#FFF7F5] px-3 py-2"
                            >
                              <p className="text-xs font-semibold text-[#C95B4B]">
                                {getBranchRuleLabel(selectedQuestion, rule)}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {targetQuestion
                                  ? `Routes to Q${questionIndexMap.get(targetQuestion.id) ?? "?"} ${targetQuestion.text || "Untitled question"}`
                                  : "Not connected yet"}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-500">
                          No explicit rules yet. Use the light coral option handles or edit the
                          node to add grouped conditions.
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border border-dashed border-gray-300 px-3 py-2">
                      <p className="text-xs font-semibold text-gray-700">Fallback</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {selectedQuestion.fallbackNextQuestionId
                          ? `Routes to Q${questionIndexMap.get(selectedQuestion.fallbackNextQuestionId) ?? "?"}`
                          : "No fallback question connected"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-gray-500">
                    Select a question to inspect or edit its conditions.
                  </p>
                )}
              </div>
            </div>
          </div>
        </PageContentContainer>
      </div>

      <JobInformationBranchingModal
        isOpen={Boolean(editingQuestion)}
        question={editingQuestion}
        questions={questions}
        onClose={() => setEditingQuestionId(null)}
        onSave={(updatedQuestion) =>
          persistQuestions(
            questions.map((question) =>
              question.id === updatedQuestion.id ? updatedQuestion : question
            )
          )
        }
      />
    </>
  );
}
