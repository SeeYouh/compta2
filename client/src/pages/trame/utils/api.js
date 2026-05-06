import { config } from "../../../config/env.js";

const BASE = `${config.apiUrl}/api/organigramme`;

function getToken() {
  return localStorage.getItem("token");
}

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Canvas
  getAllCanvases: () => request("GET", "/canvas"),
  createCanvas: (parentNodeId) => request("POST", "/canvas", { parentNodeId }),
  deleteCanvas: (id) => request("DELETE", `/canvas/${id}`),
  updateViewport: (id, viewport) =>
    request("PATCH", `/canvas/${id}/viewport`, { viewport }),
  replaceCanvas: (id, data) => request("PUT", `/canvas/${id}`, data),

  // Nodes
  createNode: (canvasId, position, data) =>
    request("POST", "/node", { canvasId, position, data }),
  updateNode: (id, canvasId, updates) =>
    request("PATCH", `/node/${id}`, { canvasId, ...updates }),
  deleteNode: (id, canvasId) => request("DELETE", `/node/${id}`, { canvasId }),

  // Edges
  createEdge: (canvasId, source, target, sourceHandle, targetHandle) =>
    request("POST", "/edge", {
      canvasId,
      source,
      target,
      sourceHandle,
      targetHandle,
    }),
  deleteEdge: (id, canvasId) => request("DELETE", `/edge/${id}`, { canvasId }),
};
