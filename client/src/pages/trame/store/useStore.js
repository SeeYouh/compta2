import { create } from "zustand";

const useStore = create((set, get) => ({
  activeCanvasId: "root",
  breadcrumb: [{ canvasId: "root", nodeLabel: "Racine" }],
  canvases: {},
  contextMenu: null,
  isTransitioning: false,

  setCanvases(canvases) {
    const root = Object.values(canvases).find((c) => c.parentNodeId === null);
    const rootId = root?.id ?? "root";
    set({
      canvases,
      activeCanvasId: rootId,
      breadcrumb: [{ canvasId: rootId, nodeLabel: "Racine" }],
    });
  },

  getActiveCanvas() {
    const { canvases, activeCanvasId } = get();
    return canvases[activeCanvasId] || null;
  },

  setNodes(canvasId, nodes) {
    set((state) => ({
      canvases: {
        ...state.canvases,
        [canvasId]: { ...state.canvases[canvasId], nodes },
      },
    }));
  },

  setEdges(canvasId, edges) {
    set((state) => ({
      canvases: {
        ...state.canvases,
        [canvasId]: { ...state.canvases[canvasId], edges },
      },
    }));
  },

  navigateToChild(childCanvasId, nodeLabel) {
    const { breadcrumb } = get();
    set({
      activeCanvasId: childCanvasId,
      breadcrumb: [...breadcrumb, { canvasId: childCanvasId, nodeLabel }],
      isTransitioning: true,
    });
    setTimeout(() => set({ isTransitioning: false }), 400);
  },

  navigateTo(canvasId) {
    const { breadcrumb } = get();
    const index = breadcrumb.findIndex((b) => b.canvasId === canvasId);
    if (index === -1) return;
    set({
      activeCanvasId: canvasId,
      breadcrumb: breadcrumb.slice(0, index + 1),
      isTransitioning: true,
    });
    setTimeout(() => set({ isTransitioning: false }), 400);
  },

  openContextMenu(nodeId, x, y) {
    set({ contextMenu: { nodeId, x, y } });
  },

  closeContextMenu() {
    set({ contextMenu: null });
  },

  updateNodeLocal(canvasId, nodeId, data) {
    set((state) => {
      const canvas = state.canvases[canvasId];
      if (!canvas) return state;
      return {
        canvases: {
          ...state.canvases,
          [canvasId]: {
            ...canvas,
            nodes: canvas.nodes.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
            ),
          },
        },
      };
    });
  },

  updateNodePosition(canvasId, nodeId, position) {
    set((state) => {
      const canvas = state.canvases[canvasId];
      if (!canvas) return state;
      return {
        canvases: {
          ...state.canvases,
          [canvasId]: {
            ...canvas,
            nodes: canvas.nodes.map((n) =>
              n.id === nodeId ? { ...n, position } : n,
            ),
          },
        },
      };
    });
  },

  addNodeLocal(canvasId, node) {
    set((state) => {
      const canvas = state.canvases[canvasId];
      if (!canvas) return state;
      return {
        canvases: {
          ...state.canvases,
          [canvasId]: { ...canvas, nodes: [...canvas.nodes, node] },
        },
      };
    });
  },

  removeNodeLocal(canvasId, nodeId) {
    set((state) => {
      const canvas = state.canvases[canvasId];
      if (!canvas) return state;
      return {
        canvases: {
          ...state.canvases,
          [canvasId]: {
            ...canvas,
            nodes: canvas.nodes.filter((n) => n.id !== nodeId),
            edges: canvas.edges.filter(
              (e) => e.source !== nodeId && e.target !== nodeId,
            ),
          },
        },
      };
    });
  },

  addEdgeLocal(canvasId, edge) {
    set((state) => {
      const canvas = state.canvases[canvasId];
      if (!canvas) return state;
      return {
        canvases: {
          ...state.canvases,
          [canvasId]: { ...canvas, edges: [...canvas.edges, edge] },
        },
      };
    });
  },

  removeEdgeLocal(canvasId, edgeId) {
    set((state) => {
      const canvas = state.canvases[canvasId];
      if (!canvas) return state;
      return {
        canvases: {
          ...state.canvases,
          [canvasId]: {
            ...canvas,
            edges: canvas.edges.filter((e) => e.id !== edgeId),
          },
        },
      };
    });
  },

  addCanvasLocal(canvas) {
    set((state) => ({
      canvases: { ...state.canvases, [canvas.id]: canvas },
    }));
  },

  removeCanvasLocal(canvasId) {
    set((state) => {
      const canvases = { ...state.canvases };
      delete canvases[canvasId];
      return { canvases };
    });
  },
}));

export default useStore;
