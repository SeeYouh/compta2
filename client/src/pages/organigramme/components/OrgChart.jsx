import "@xyflow/react/dist/style.css";
import "../styles/OrgChart.scss";

import { useCallback, useEffect, useRef } from "react";

import {
  Background,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";

import { api } from "../utils/api.js";
import Breadcrumb from "./Breadcrumb.jsx";
import ContextMenu from "./ContextMenu.jsx";
import CustomNode from "./CustomNode.jsx";
import Toolbar from "./Toolbar.jsx";
import useStore from "../store/useStore.js";

const NODE_TYPES = { customNode: CustomNode };

export default function OrgChart() {
  const {
    activeCanvasId,
    canvases,
    setCanvases,
    closeContextMenu,
    isTransitioning,
    addNodeLocal,
    addEdgeLocal,
    removeEdgeLocal,
    updateNodePosition,
  } = useStore();

  const canvas = canvases[activeCanvasId];
  const [nodes, setNodes, onNodesChange] = useNodesState(canvas?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(canvas?.edges || []);
  const { getViewport, setViewport, getNodes, getEdges } = useReactFlow();

  // Charge l'état initial depuis le serveur
  const isInitializedRef = useRef(false);
  useEffect(() => {
    api
      .getAllCanvases()
      .then((state) => {
        setCanvases(state.canvases);
        isInitializedRef.current = true;
      })
      .catch(console.error);
  }, [setCanvases]);

  const shouldRestoreViewportRef = useRef(true);
  const prevCanvasIdRef = useRef(activeCanvasId);
  useEffect(() => {
    shouldRestoreViewportRef.current = true;
  }, [activeCanvasId]);

  // Synchronise nodes/edges quand le canvas actif change
  useEffect(() => {
    if (!canvas) return;

    const isCanvasSwitch = prevCanvasIdRef.current !== activeCanvasId;
    prevCanvasIdRef.current = activeCanvasId;

    const toRFNode = (n) => ({
      ...n,
      style: {
        ...n.style,
        width: n.data.width || 150,
        height: n.data.height || 150,
      },
    });

    if (isCanvasSwitch) {
      setNodes(canvas.nodes.map(toRFNode));
      setEdges(canvas.edges);
    } else {
      setNodes((prev) => {
        const storeById = Object.fromEntries(
          canvas.nodes.map((n) => [n.id, n]),
        );
        const storeIds = new Set(canvas.nodes.map((n) => n.id));
        const existingIds = new Set(prev.map((n) => n.id));
        const updated = prev
          .filter((n) => storeIds.has(n.id))
          .map((n) => {
            const s = storeById[n.id];
            return {
              ...n,
              data: s.data,
              style: {
                width: s.data.width || 150,
                height: s.data.height || 150,
              },
            };
          });
        const added = canvas.nodes
          .filter((n) => !existingIds.has(n.id))
          .map(toRFNode);
        return [...updated, ...added];
      });
      setEdges(canvas.edges);
    }

    if (shouldRestoreViewportRef.current && canvas.viewport) {
      setViewport(canvas.viewport);
      shouldRestoreViewportRef.current = false;
    }
  }, [activeCanvasId, canvas, setNodes, setEdges, setViewport]);

  const saveAllCanvases = useCallback(async () => {
    const allCanvases = useStore.getState().canvases;
    const vp = getViewport();
    await Promise.all(
      Object.entries(allCanvases).map(([id, c]) => {
        const data =
          id === activeCanvasId
            ? { nodes: getNodes(), edges: getEdges(), viewport: vp }
            : { nodes: c.nodes, edges: c.edges, viewport: c.viewport };
        return api.replaceCanvas(id, data);
      }),
    );
  }, [activeCanvasId, getViewport, getNodes, getEdges]);

  // Ref stable vers saveAllCanvases pour éviter les closures périmées
  const saveAllCanvasesRef = useRef(saveAllCanvases);
  useEffect(() => {
    saveAllCanvasesRef.current = saveAllCanvases;
  }, [saveAllCanvases]);

  // Auto-save debouncé : déclenché 1.5s après chaque mutation du store
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveAllCanvasesRef.current().catch(console.error);
    }, 1500);
    return () => clearTimeout(saveTimerRef.current);
  }, [canvases]);

  const makeNode = useCallback(
    (position) => ({
      id: crypto.randomUUID(),
      type: "customNode",
      position,
      data: {
        label: "Nouveau nœud",
        color: "#ffffff",
        width: 150,
        height: 150,
      },
      style: { width: 150, height: 150 },
    }),
    [],
  );

  const handleAddNode = useCallback(() => {
    const { zoom, x: vpX, y: vpY } = getViewport();
    const position = {
      x: (window.innerWidth / 2 - vpX) / zoom,
      y: (window.innerHeight / 2 - vpY) / zoom,
    };
    addNodeLocal(activeCanvasId, makeNode(position));
  }, [activeCanvasId, addNodeLocal, getViewport, makeNode]);

  const handlePaneDoubleClick = useCallback(
    (e) => {
      if (!e.target.classList.contains("react-flow__pane")) return;
      const { zoom, x: vpX, y: vpY } = getViewport();
      const position = {
        x: (e.clientX - vpX) / zoom,
        y: (e.clientY - vpY) / zoom,
      };
      addNodeLocal(activeCanvasId, makeNode(position));
    },
    [activeCanvasId, addNodeLocal, getViewport, makeNode],
  );

  const onConnect = useCallback(
    (connection) => {
      const edge = {
        id: crypto.randomUUID(),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: "smoothstep",
        markerEnd: { type: "arrowclosed" },
      };
      addEdgeLocal(activeCanvasId, edge);
    },
    [activeCanvasId, addEdgeLocal],
  );

  const onEdgeClick = useCallback(
    (_, edge) => {
      removeEdgeLocal(activeCanvasId, edge.id);
    },
    [activeCanvasId, removeEdgeLocal],
  );

  const onNodeDragStop = useCallback(
    (_, node) => {
      updateNodePosition(activeCanvasId, node.id, node.position);
    },
    [activeCanvasId, updateNodePosition],
  );

  const onPaneClick = useCallback(() => {
    closeContextMenu();
  }, [closeContextMenu]);

  return (
    <div className={`orgchart ${isTransitioning ? "transitioning" : ""}`}>
      <Breadcrumb />
      <Toolbar onAddNode={handleAddNode} onSave={saveAllCanvases} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onPaneContextMenu={(e) => e.preventDefault()}
        onDoubleClick={handlePaneDoubleClick}
        nodeTypes={NODE_TYPES}
        fitView
        deleteKeyCode="Delete"
        minZoom={0.1}
        maxZoom={10}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <MiniMap
          nodeColor={(n) => n.data.color || "#fff"}
          style={{
            background: "#0f1117",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
          }}
          maskColor="rgba(15, 20, 23, 0.7)"
        />
      </ReactFlow>

      <ContextMenu />
    </div>
  );
}
