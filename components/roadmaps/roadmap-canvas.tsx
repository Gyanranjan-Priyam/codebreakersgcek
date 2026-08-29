/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
  type ReactFlowInstance,
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
  ZoomIn,
  ZoomOut,
  Compass,
  ListOrdered,
  ChevronDown,
  Layers,
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
  const { fitView, setCenter, zoomIn, zoomOut, zoomTo, getZoom } = useReactFlow();
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  const [selectedNode, setSelectedNode] = useState<RoadmapGraphNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMilestoneMenuOpen, setIsMilestoneMenuOpen] = useState(false);

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

  // All milestone topics for the quick-navigation index
  const milestoneTopics = useMemo(() => {
    return roadmap.nodes.filter((n) => n.type === "topic" || n.type === "milestone");
  }, [roadmap.nodes]);

  // Function to focus smoothly on the first main topic and subnodes (like roadmap.sh)
  const focusOnStartNode = useCallback(
    (duration = 700) => {
      const firstTopic =
        roadmap.nodes.find((n) => n.type === "topic") || roadmap.nodes[0];
      if (firstTopic) {
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        const targetX = firstTopic.position.x + 80;
        const targetY = firstTopic.position.y + 40;
        const zoom = isMobile ? 0.85 : 1.05;

        setCenter(targetX, targetY, { zoom, duration });
      } else {
        fitView({ padding: 0.2, duration });
      }
    },
    [roadmap.nodes, setCenter, fitView],
  );

  // Jump to specific milestone node
  const jumpToNode = useCallback(
    (nodeId: string) => {
      const targetNode = roadmap.nodes.find((n) => n.id === nodeId);
      if (targetNode) {
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        const targetX = targetNode.position.x + 80;
        const targetY = targetNode.position.y + 40;
        const zoom = isMobile ? 0.9 : 1.05;

        setCenter(targetX, targetY, { zoom, duration: 600 });
        setIsMilestoneMenuOpen(false);

        // Highlight briefly
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: n.id === nodeId,
          })),
        );
      }
    },
    [roadmap.nodes, setCenter, setNodes],
  );

  // On Canvas initialization, auto-focus on first main node and its subnodes at comfortable 1.05x zoom
  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowInstanceRef.current = instance;
      const firstTopic =
        roadmap.nodes.find((n) => n.type === "topic") || roadmap.nodes[0];
      if (firstTopic) {
        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        const targetX = firstTopic.position.x + 80;
        const targetY = firstTopic.position.y + 40;
        const zoom = isMobile ? 0.85 : 1.05;

        setTimeout(() => {
          instance.setCenter(targetX, targetY, { zoom, duration: 600 });
        }, 50);
      }
    },
    [roadmap.nodes],
  );

  // Handle Node Click -> Smoothly centers camera onto node & opens rich topic drawer
  const handleNodeClick = useCallback(
    (_: any, node: Node) => {
      const nodeData = node.data as any;

      // Center view on clicked node smoothly
      setCenter(node.position.x + 80, node.position.y + 30, {
        zoom: Math.max(0.95, getZoom()),
        duration: 400,
      });

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
    [roadmap.nodes, progress, router, setCenter, getZoom],
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
      if (res.status === "success" && res.data) {
        setProgress(res.data);
        saveProgressToLocalDB(res.data);
      }
    } catch (err: any) {
      console.error("Failed to sync progress to cloud:", err);
    }
  };

  // Reset Progress Handler
  const handleResetProgress = async () => {
    if (!confirm("Are you sure you want to reset all progress on this roadmap?"))
      return;

    const cleared: UserProgressData = {
      roadmapId: roadmap.id,
      completedNodeIds: [],
      inProgressNodeIds: [],
      percentage: 0,
      updatedAt: new Date().toISOString(),
    };

    setProgress(cleared);
    saveProgressToLocalDB(cleared);
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
    setIsMilestoneMenuOpen(false);
  }, []);

  // Filter nodes on search & auto-center on first search match
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

  // When search query changes, jump to first match
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const match = roadmap.nodes.find((n) =>
      (n.data.label || "").toLowerCase().includes(q),
    );
    if (match) {
      setCenter(match.position.x + 80, match.position.y + 30, {
        zoom: 1.05,
        duration: 500,
      });
      setSelectedNode(match);
      setIsDrawerOpen(true);
    } else {
      toast.error("No topic matching search query");
    }
  };

  return (
    <div
      className={`relative w-full h-full flex-1 overflow-hidden bg-background select-none flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "border-0 rounded-none"
      }`}
    >
      {/* ── Top Floating Navigation & Milestone Bar (Roadmap.sh Style) ── */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-auto">
        {/* Milestone Quick Jump Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMilestoneMenuOpen(!isMilestoneMenuOpen)}
            className="h-9 px-3 rounded-xl bg-card/95 backdrop-blur-md border border-border/80 shadow-md font-semibold text-xs flex items-center gap-2 hover:bg-card"
          >
            <ListOrdered className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Topics Index</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>

          {isMilestoneMenuOpen && (
            <div className="absolute left-0 top-11 w-64 max-h-80 overflow-y-auto bg-card/95 backdrop-blur-xl p-1.5 rounded-2xl border border-border/80 shadow-2xl z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Roadmap Milestones
              </div>
              {milestoneTopics.map((m, idx) => {
                const isCompleted = progress.completedNodeIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => jumpToNode(m.id)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCompleted
                          ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </span>
                    <span className="truncate flex-1">{m.data.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Start / Top Focus Button (Roadmap.sh default start view) */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => focusOnStartNode(600)}
          className="h-9 px-3 rounded-xl bg-card/95 backdrop-blur-md border border-border/80 shadow-md font-semibold text-xs flex items-center gap-1.5 hover:bg-card text-foreground"
          title="Focus on First Topic (Start from Top @ 100%)"
        >
          <Compass className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Start from Top</span>
        </Button>
      </div>

      {/* ── Left Floating Controls Panel (Centered Vertically) ── */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-xl pointer-events-auto">
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
            <form
              onSubmit={handleSearchSubmit}
              className="absolute left-12 top-0 w-52 bg-card/95 backdrop-blur-md p-1.5 rounded-xl border border-border/80 shadow-lg z-30"
            >
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topic & press Enter..."
                className="h-7 text-xs"
              />
            </form>
          )}
        </div>

        {/* Focus Start */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => focusOnStartNode(500)}
          className="h-9 w-9 p-0 rounded-xl hover:bg-muted text-muted-foreground"
          title="Focus Start (100% Zoom)"
        >
          <Compass className="w-4 h-4 text-primary" />
        </Button>

        {/* Fit Entire Map */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fitView({ duration: 400, padding: 0.15 })}
          className="h-9 w-9 p-0 rounded-xl hover:bg-muted text-muted-foreground"
          title="Fit Entire Map"
        >
          <Crosshair className="w-4 h-4" />
        </Button>

        {/* Zoom In (+) */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => zoomIn({ duration: 300 })}
          className="h-9 w-9 p-0 rounded-xl hover:bg-muted text-muted-foreground"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        {/* Zoom Out (-) */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => zoomOut({ duration: 300 })}
          className="h-9 w-9 p-0 rounded-xl hover:bg-muted text-muted-foreground"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        {/* Reset 100% Zoom */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => zoomTo(1.0, { duration: 300 })}
          className="h-9 w-9 p-0 rounded-xl hover:bg-muted text-muted-foreground text-[10px] font-bold font-mono"
          title="Reset to 100% Zoom"
        >
          1x
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
          onInit={onInit}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          minZoom={0.2}
          maxZoom={2.0}
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
                <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground border-b border-border/50 truncate">
                  {contextMenu.node.data?.label || "Selected Topic"}
                </div>

                {/* Open Study Guide */}
                <button
                  onClick={() => {
                    setSelectedNode(contextMenu.node);
                    setIsDrawerOpen(true);
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground font-medium text-left cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Open Study Guide</span>
                </button>

                {/* Mark Completed */}
                <button
                  onClick={() => {
                    if (contextMenu.node) {
                      handleStatusChange(contextMenu.node.id, "completed");
                    }
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-emerald-600 font-medium text-left cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </button>

                {/* Mark In Progress */}
                <button
                  onClick={() => {
                    if (contextMenu.node) {
                      handleStatusChange(contextMenu.node.id, "in-progress");
                    }
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-amber-500 font-medium text-left cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Add to In-Progress</span>
                </button>

                {/* Reset Topic */}
                <button
                  onClick={() => {
                    if (contextMenu.node) {
                      handleStatusChange(contextMenu.node.id, "not-started");
                    }
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-muted-foreground font-medium text-left cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Status</span>
                </button>
              </>
            ) : (
              <>
                <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground border-b border-border/50">
                  Canvas View
                </div>

                {/* Focus Start */}
                <button
                  onClick={() => {
                    focusOnStartNode(500);
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground font-medium text-left cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-primary" />
                  <span>Start from Top (100%)</span>
                </button>

                {/* Fit Entire View */}
                <button
                  onClick={() => {
                    fitView({ duration: 400, padding: 0.2 });
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground font-medium text-left cursor-pointer"
                >
                  <Crosshair className="w-4 h-4 text-muted-foreground" />
                  <span>Fit Entire Roadmap</span>
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
