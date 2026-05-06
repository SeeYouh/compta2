import { useCallback } from "react";

import { useReactFlow } from "@xyflow/react";

import { api } from "../utils/api.js";
import useStore from "../store/useStore.js";

export function useSaveCanvas() {
  const { getViewport } = useReactFlow();
  const activeCanvasId = useStore((s) => s.activeCanvasId);

  return useCallback(async () => {
    const allCanvases = useStore.getState().canvases;
    const vp = getViewport();

    await Promise.all(
      Object.entries(allCanvases).map(([id, canvas]) => {
        const data =
          id === activeCanvasId
            ? { nodes: canvas.nodes, edges: canvas.edges, viewport: vp }
            : {
                nodes: canvas.nodes,
                edges: canvas.edges,
                viewport: canvas.viewport,
              };
        return api.replaceCanvas(id, data);
      }),
    );
  }, [activeCanvasId, getViewport]);
}
