/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TopicNode } from "./custom-nodes/topic-node";
import { SubtopicNode } from "./custom-nodes/subtopic-node";
import { TitleNode } from "./custom-nodes/title-node";
import { CardNode } from "./custom-nodes/card-node";
import { SectionNode } from "./custom-nodes/section-node";
import { ButtonNode } from "./custom-nodes/button-node";
import { LinksNode } from "./custom-nodes/links-node";
import { ChecklistNode } from "./custom-nodes/checklist-node";
import { MilestoneNode } from "./custom-nodes/milestone-node";
import { BranchNode } from "./custom-nodes/branch-node";
import { AnimatedGlowEdge } from "./custom-edges/animated-glow-edge";
import { InteractiveEdge } from "./custom-edges/interactive-edge";
import { TopicDrawer } from "./topic-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Search,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Crosshair,
  Clock,
  RotateCcw,
  BookOpen,
  ExternalLink,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateNodeProgress,
  resetRoadmapProgress,
} from "@/app/(public)/dashboard/roadmaps/actions";
import { getAutoLayoutedElements } from "@/lib/roadmaps/layout";
import {
  saveRoadmapToLocalDB,
  saveProgressToLocalDB,
  getProgressFromLocalDB,
} from "@/lib/roadmaps/local-db";
import type {
  RoadmapData,
  RoadmapGraphNode,
  RoadmapStatus,
  UserProgressData,
} from "@/lib/roadmaps/types";

interface RoadmapCanvasProps {
  roadmap: RoadmapData;
  initialProgress?: UserProgressData;
}

function RoadmapCanvasInternal({
  roadmap,
  initialProgress,
}: RoadmapCanvasProps) {
  const { fitView } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<RoadmapGraphNode | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Local progress state
  const [progress, setProgress] = useState<UserProgressData>(
    initialProgress || {
      roadmapId: roadmap.id,
      completedNodeIds: [],
      inProgressNodeIds: [],
      percentage: 0,
      updatedAt: new Date().toISOString(),
    },
  );

  // Synchronize with LocalDB on mount for instant zero-latency caching
  useEffect(() => {
    saveRoadmapToLocalDB(roadmap);
    if (initialProgress) {
      saveProgressToLocalDB(initialProgress);
    } else {
      getProgressFromLocalDB(roadmap.id).then((cachedProgress) => {
        if (cachedProgress && cachedProgress.percentage > 0) {
          setProgress(cachedProgress);
        }
      });
    }
  }, [roadmap, initialProgress]);

  // Node types registration
  const nodeTypes = useMemo(
    () => ({
      topic: TopicNode,
      subtopic: SubtopicNode,
      title: TitleNode,
      paragraph: CardNode,
      section: SectionNode,
      button: ButtonNode,
      links: LinksNode,
      checklist: ChecklistNode,
      milestone: MilestoneNode,
      branch: BranchNode,
    }),
    [],
  );

  // Edge types registration
  const edgeTypes = useMemo(
    () => ({
      animated: AnimatedGlowEdge,
      interactive: InteractiveEdge,
    }),
    [],
  );

  // Transform initial nodes with progress status
  const formattedInitialNodes: Node[] = useMemo(() => {
    return roadmap.nodes.map((n) => {
      let status: RoadmapStatus = "not-started";
      if (progress.completedNodeIds.includes(n.id)) status = "completed";
      else if (progress.inProgressNodeIds.includes(n.id))
        status = "in-progress";

      return {
        id: n.id,
        type: n.type || "topic",
        position: n.position,
        data: {
          ...n.data,
          status,
        },
      };
    });
  }, [roadmap.nodes, progress.completedNodeIds, progress.inProgressNodeIds]);

  // Transform initial edges with glow when source is completed
  const formattedInitialEdges: Edge[] = useMemo(() => {
    return roadmap.edges.map((e) => {
      const isSourceCompleted = progress.completedNodeIds.includes(e.source);
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: (e as any).sourceHandle,
        targetHandle: (e as any).targetHandle,
        type: e.type || "interactive",
        animated: isSourceCompleted || e.animated === true,
        style: {
          stroke: isSourceCompleted
            ? "var(--color-emerald-500, #10b981)"
            : "#3b82f6",
          strokeWidth: isSourceCompleted ? 2.5 : 1.8,
          strokeDasharray: (e.style as any)?.strokeDasharray || undefined,
        },
      };
    });
  }, [roadmap.edges, progress.completedNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(formattedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(formattedInitialEdges);

  const router = useRouter();

  // Handle Node Click -> Opens rich topic drawer or navigates link
  const handleNodeClick = useCallback(
    (_: any, node: Node) => {
      const nodeData = node.data as any;
      if (node.type === "button") {
        const targetSlug = nodeData.targetRoadmapSlug;
        if (targetSlug) {
          router.push(`/dashboard/roadmaps/${targetSlug}`);
          return;
        }
        const url =
          nodeData.url ||
          (nodeData.resources && nodeData.resources[0]?.url) ||
          "";
        if (url) {
          if (url.startsWith("/") || url.includes("/dashboard/roadmaps/")) {
            router.push(url);
          } else {
            window.open(url, "_blank", "noopener,noreferrer");
          }
          return;
        }
      }

      const original = roadmap.nodes.find((n) => n.id === node.id);
      if (original) {
        let status: RoadmapStatus = "not-started";
        if (progress.completedNodeIds.includes(original.id))
          status = "completed";
        else if (progress.inProgressNodeIds.includes(original.id))
          status = "in-progress";

        setSelectedNode({
          ...original,
          data: {
            ...original.data,
            status,
          },
        });
        setIsDrawerOpen(true);
      }
    },
    [roadmap.nodes, progress],
  );


  // Handle Status Update
  const handleStatusChange = async (
    nodeId: string,
    newStatus: RoadmapStatus,
  ) => {
    const updatedCompleted = new Set(progress.completedNodeIds);
    const updatedInProgress = new Set(progress.inProgressNodeIds);

    if (newStatus === "completed") {
      updatedCompleted.add(nodeId);
      updatedInProgress.delete(nodeId);
      toast.success("Topic marked as completed! 🎯");
    } else if (newStatus === "in-progress") {
      updatedInProgress.add(nodeId);
      updatedCompleted.delete(nodeId);
      toast.info("Added to your learning queue!");
    } else {
      updatedCompleted.delete(nodeId);
      updatedInProgress.delete(nodeId);
    }

    const totalNodes =
      roadmap.nodes.filter((n) => !n.data.isOptional).length ||
      roadmap.nodes.length;
    const completedCount = updatedCompleted.size;
    const newPercentage = Math.min(
      100,
      Math.round((completedCount / (totalNodes || 1)) * 100),
    );

    const newProgressState: UserProgressData = {
      ...progress,
      completedNodeIds: Array.from(updatedCompleted),
      inProgressNodeIds: Array.from(updatedInProgress),
      percentage: newPercentage,
    };

    setProgress(newProgressState);
    saveProgressToLocalDB(newProgressState);

    // Update node in canvas
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              status: newStatus,
            },
          };
        }
        return n;
      }),
    );

    // Update drawer node
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        data: {
          ...selectedNode.data,
          status: newStatus,
        },
      });
    }

    // Persist to database
    try {
      const res = await updateNodeProgress(roadmap.id, nodeId, newStatus);
      if (res.status === "error") {
        toast.error(res.message || "Failed to update node progress");
      }
    } catch {
      toast.error("Failed to sync progress to cloud");
    }
  };

  // Reset Progress
  const handleResetProgress = async () => {
    const resetState: UserProgressData = {
      roadmapId: roadmap.id,
      completedNodeIds: [],
      inProgressNodeIds: [],
      percentage: 0,
      updatedAt: new Date().toISOString(),
    };
    setProgress(resetState);
    saveProgressToLocalDB(resetState);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: "not-started",
        },
      })),
    );
    try {
      await resetRoadmapProgress(roadmap.id);
      toast.success("Progress reset successfully!");
    } catch {
      toast.error("Failed to reset progress");
    }
  };

  // Context Menu State for Learners
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    node: RoadmapGraphNode | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    node: null,
  });

  const onPaneContextMenu = useCallback((event: any) => {
    event.preventDefault();
    setContextMenu({
      isOpen: true,
      x: event.clientX,
      y: event.clientY,
      node: null,
    });
  }, []);

  const onNodeContextMenu = useCallback(
    (event: any, node: Node) => {
      event.preventDefault();
      const original =
        roadmap.nodes.find((n) => n.id === node.id) || (node as any);
      setContextMenu({
        isOpen: true,
        x: event.clientX,
        y: event.clientY,
        node: original,
      });
    },
    [roadmap.nodes],
  );

  const onPaneClick = useCallback(() => {
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  // Filter nodes on search
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.toLowerCase();
    return nodes.map((n) => {
      const label = (n.data as any)?.label || "";
      const matches = label.toLowerCase().includes(q);
      return {
        ...n,
        selected: matches,
      };
    });
  }, [nodes, searchQuery]);

  return (
    <div
      className={`relative w-full h-full flex-1 overflow-hidden bg-background select-none flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "border-0 rounded-none"
      }`}
    >
      {/* ── Vertical Floating Controls Panel (Center-Left of the Canvas) ── */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 p-2 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-xl pointer-events-auto">
        {/* Progress Display */}
        <div className="flex flex-col items-center p-2 rounded-xl bg-muted/50 border border-border/40 w-12 text-center">
          <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider block">
            Done
          </span>
          <span className="text-xs font-black text-foreground">
            {progress.percentage}%
          </span>
          <div className="w-8 h-1 bg-muted-foreground/20 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="w-full h-px bg-border/60 my-0.5" />

        {/* Search Toggle / Box */}
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`h-9 w-9 p-0 rounded-xl hover:bg-muted ${
              isSearchOpen || searchQuery
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            }`}
            title="Search Topics"
          >
            <Search className="w-4 h-4" />
          </Button>

          {isSearchOpen && (
            <div className="absolute left-12 top-0 w-48 bg-card/95 backdrop-blur-md p-1.5 rounded-xl border border-border/80 shadow-lg z-30">
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topic..."
                className="h-7 text-xs"
              />
            </div>
          )}
        </div>

        {/* Fit View Center */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fitView({ duration: 300, padding: 0.2 })}
          className="h-9 w-9 p-0 rounded-xl hover:bg-muted text-muted-foreground"
          title="Center View"
        >
          <Crosshair className="w-4 h-4" />
        </Button>

        {/* Fullscreen Toggle */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="h-9 w-9 p-0 rounded-xl hover:bg-muted text-muted-foreground"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* ── React Flow Canvas ── */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          className="bg-muted/10"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.2}
            color="currentColor"
            className="text-muted-foreground/15"
          />
          <Controls className="!bg-card/90 !border-border/70 !shadow-md !rounded-xl overflow-hidden !left-4 !bottom-4" />
          <MiniMap
            zoomable
            pannable
            className="!bg-card/95 !border-border/80 !shadow-xl !rounded-2xl hidden md:block !right-4 !bottom-16 overflow-hidden"
            nodeColor={(n) => {
              if (progress.completedNodeIds.includes(n.id)) return "#71717a";
              if (progress.inProgressNodeIds.includes(n.id)) return "#f59e0b";
              return "#94a3b8";
            }}
          />

          {/* Priority & Status Legend Panel at Bottom Right */}
          <Panel position="bottom-right" className="m-4">
            <div className="flex flex-wrap items-center gap-3 p-2 px-3 rounded-xl bg-card/90 backdrop-blur-md border border-border/80 shadow-xs text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#facc15] border border-black inline-block" />{" "}
                Main Topic
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#fdba74] border border-black inline-block" />{" "}
                Subtopic
              </span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex items-center justify-center">
                  <span className="w-5 h-2.5 rounded-xs bg-[#cccccc] border border-black inline-block" />
                  <span className="absolute -right-1 w-2.5 h-2.5 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center text-[7px] font-bold">✓</span>
                </span>{" "}
                Learned / Done
              </span>
            </div>
          </Panel>
        </ReactFlow>

        {/* ── Learner / Public User Context Menu (Right Click) ── */}
        {contextMenu.isOpen && (
          <div
            style={{
              position: "fixed",
              left: Math.min(
                contextMenu.x,
                typeof window !== "undefined" ? window.innerWidth - 230 : 500,
              ),
              top: Math.min(
                contextMenu.y,
                typeof window !== "undefined" ? window.innerHeight - 300 : 500,
              ),
            }}
            onClick={(e) => e.stopPropagation()}
            className="z-50 w-56 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl p-1.5 space-y-1 text-xs select-none animate-in fade-in zoom-in-95 duration-100"
          >
            {contextMenu.node ? (
              <>
                <div className="px-2.5 py-1 text-[11px] font-bold text-foreground truncate border-b border-border/50 pb-1.5">
                  {(contextMenu.node.data as any)?.label || "Selected Topic"}
                </div>

                <div className="px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-1">
                  Learning Status
                </div>

                {/* Mark as Done */}
                <button
                  onClick={() => {
                    handleStatusChange(contextMenu.node!.id, "completed");
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 font-semibold text-left cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Mark as Completed</span>
                </button>

                {/* Start Learning / In Progress */}
                <button
                  onClick={() => {
                    handleStatusChange(contextMenu.node!.id, "in-progress");
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/10 text-amber-500 font-semibold text-left cursor-pointer transition-colors"
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Start Learning</span>
                </button>

                {/* Reset Status */}
                <button
                  onClick={() => {
                    handleStatusChange(contextMenu.node!.id, "not-started");
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium text-muted-foreground hover:text-foreground text-left cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Status</span>
                </button>

                <div className="h-px bg-border/60 my-1" />

                {/* Open Resources Drawer */}
                <button
                  onClick={() => {
                    const node = contextMenu.node!;
                    let status: RoadmapStatus = "not-started";
                    if (progress.completedNodeIds.includes(node.id))
                      status = "completed";
                    else if (progress.inProgressNodeIds.includes(node.id))
                      status = "in-progress";

                    setSelectedNode({
                      ...node,
                      data: {
                        ...node.data,
                        status,
                      },
                    });
                    setIsDrawerOpen(true);
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 text-primary font-medium text-left cursor-pointer transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View Details & Links</span>
                </button>

                {/* If External Link */}
                {((contextMenu.node.data as any)?.url ||
                  (contextMenu.node.data as any)?.resources?.[0]?.url) && (
                  <button
                    onClick={() => {
                      const url =
                        (contextMenu.node!.data as any)?.url ||
                        (contextMenu.node!.data as any)?.resources?.[0]?.url;
                      if (url)
                        window.open(url, "_blank", "noopener,noreferrer");
                      setContextMenu((prev) => ({ ...prev, isOpen: false }));
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground font-medium text-left cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-cyan-500" />
                    <span>Open Resource URL</span>
                  </button>
                )}

                {/* Copy / Share Topic */}
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const shareUrl = `${window.location.origin}${window.location.pathname}#${contextMenu.node!.id}`;
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Topic link copied to clipboard!");
                    }
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-left cursor-pointer transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Copy Topic Link</span>
                </button>
              </>
            ) : (
              <>
                <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Roadmap Navigation
                </div>

                {/* Center Canvas */}
                <button
                  onClick={() => {
                    fitView({ duration: 400, padding: 0.2 });
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground font-medium text-left cursor-pointer"
                >
                  <Crosshair className="w-4 h-4 text-primary" />
                  <span>Center / Fit View</span>
                </button>

                {/* Search Topics */}
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground font-medium text-left cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Roadmap</span>
                </button>

                {/* Fullscreen */}
                <button
                  onClick={() => {
                    setIsFullscreen(!isFullscreen);
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground font-medium text-left cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Toggle Fullscreen</span>
                </button>

                <div className="h-px bg-border/60 my-1" />

                {/* Reset Progress */}
                <button
                  onClick={() => {
                    handleResetProgress();
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 font-medium text-left cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Progress</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Slide-Over Topic Resource Drawer ── */}
      <TopicDrawer
        node={selectedNode}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export function RoadmapCanvas(props: RoadmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <RoadmapCanvasInternal {...props} />
    </ReactFlowProvider>
  );
}
