import { v4 as uuidv4 } from "uuid";

import { OrgCanvas } from "../models/OrgCanvas.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getRootCanvas(userId) {
  let root = await OrgCanvas.findOne({ userId, parentNodeId: null });
  if (!root) {
    root = await OrgCanvas.create({
      id: uuidv4(),
      userId,
      parentNodeId: null,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    });
  }
  return root;
}

async function deleteCanvasRecursive(userId, canvasId) {
  const canvas = await OrgCanvas.findOne({ id: canvasId, userId });
  if (!canvas) return;

  for (const node of canvas.nodes) {
    if (node.data?.childCanvasId) {
      await deleteCanvasRecursive(userId, node.data.childCanvasId);
    }
  }

  await OrgCanvas.deleteOne({ id: canvasId, userId });
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export async function getAllCanvases(req, res) {
  const userId = req.userId;
  await getRootCanvas(userId);

  const canvases = await OrgCanvas.find({ userId }).lean();

  // Retourne un objet indexé par id (même format qu'avant)
  const result = {};
  for (const c of canvases) {
    result[c.id] = c;
  }

  res.json({ canvases: result });
}

export async function createCanvas(req, res) {
  const userId = req.userId;
  const { parentNodeId } = req.body;

  if (!parentNodeId) {
    return res.status(400).json({ error: "parentNodeId is required" });
  }

  const id = uuidv4();
  const canvas = await OrgCanvas.create({
    id,
    userId,
    parentNodeId,
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  });

  // Marque le nœud parent comme ayant un canvas enfant
  await OrgCanvas.updateOne(
    { userId, "nodes.id": parentNodeId },
    { $set: { "nodes.$.data.childCanvasId": id } },
  );

  res.status(201).json(canvas.toJSON());
}

export async function deleteCanvas(req, res) {
  const userId = req.userId;
  const { id } = req.params;

  const canvas = await OrgCanvas.findOne({ id, userId });
  if (!canvas) {
    return res.status(404).json({ error: "Canvas not found" });
  }
  if (canvas.parentNodeId === null) {
    return res.status(400).json({ error: "Cannot delete root canvas" });
  }

  // Retire la référence childCanvasId du nœud parent
  await OrgCanvas.updateOne(
    { userId, "nodes.id": canvas.parentNodeId },
    { $unset: { "nodes.$.data.childCanvasId": "" } },
  );

  await deleteCanvasRecursive(userId, id);

  res.json({ success: true });
}

export async function updateViewport(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { viewport } = req.body;

  const result = await OrgCanvas.updateOne(
    { id, userId },
    { $set: { viewport } },
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  res.json({ success: true });
}

export async function replaceCanvas(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { nodes, edges, viewport } = req.body;

  const canvas = await OrgCanvas.findOne({ id, userId });
  if (!canvas) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  if (nodes !== undefined) canvas.nodes = nodes;
  if (edges !== undefined) canvas.edges = edges;
  if (viewport !== undefined) canvas.viewport = viewport;

  await canvas.save();
  res.json({ success: true });
}

// ─── Nodes ────────────────────────────────────────────────────────────────────

export async function createNode(req, res) {
  const userId = req.userId;
  const { canvasId, position, data } = req.body;

  if (!canvasId) {
    return res.status(400).json({ error: "canvasId is required" });
  }

  const canvas = await OrgCanvas.findOne({ id: canvasId, userId });
  if (!canvas) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  const node = {
    id: uuidv4(),
    type: "customNode",
    position: position || { x: 100, y: 100 },
    data: {
      label: data?.label || "Nouveau nœud",
      color: data?.color || "#ffffff",
      childCanvasId: null,
      width: data?.width || 150,
      height: data?.height || 150,
    },
    style: {
      width: data?.width || 150,
      height: data?.height || 150,
    },
  };

  canvas.nodes.push(node);
  await canvas.save();
  res.status(201).json(node);
}

export async function updateNode(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { canvasId, ...updates } = req.body;

  if (!canvasId) {
    return res.status(400).json({ error: "canvasId is required" });
  }

  const canvas = await OrgCanvas.findOne({ id: canvasId, userId });
  if (!canvas) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  const node = canvas.nodes.find((n) => n.id === id);
  if (!node) {
    return res.status(404).json({ error: "Node not found" });
  }

  if (updates.position) node.position = updates.position;
  if (updates.data) {
    node.data = { ...node.data.toObject(), ...updates.data };
    if (updates.data.width || updates.data.height) {
      node.style = { width: node.data.width, height: node.data.height };
    }
  }

  await canvas.save();
  res.json(node.toObject());
}

export async function deleteNode(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { canvasId } = req.body;

  if (!canvasId) {
    return res.status(400).json({ error: "canvasId is required" });
  }

  const canvas = await OrgCanvas.findOne({ id: canvasId, userId });
  if (!canvas) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  const node = canvas.nodes.find((n) => n.id === id);
  if (!node) {
    return res.status(404).json({ error: "Node not found" });
  }

  canvas.edges = canvas.edges.filter((e) => e.source !== id && e.target !== id);
  canvas.nodes = canvas.nodes.filter((n) => n.id !== id);

  await canvas.save();
  res.json({ success: true });
}

// ─── Edges ────────────────────────────────────────────────────────────────────

export async function createEdge(req, res) {
  const userId = req.userId;
  const { canvasId, source, target, sourceHandle, targetHandle } = req.body;

  if (!canvasId || !source || !target) {
    return res
      .status(400)
      .json({ error: "canvasId, source and target are required" });
  }

  const canvas = await OrgCanvas.findOne({ id: canvasId, userId });
  if (!canvas) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  const edge = {
    id: uuidv4(),
    source,
    target,
    sourceHandle: sourceHandle || null,
    targetHandle: targetHandle || null,
    type: "smoothstep",
    markerEnd: { type: "arrowclosed" },
  };

  canvas.edges.push(edge);
  await canvas.save();
  res.status(201).json(edge);
}

export async function deleteEdge(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { canvasId } = req.body;

  if (!canvasId) {
    return res.status(400).json({ error: "canvasId is required" });
  }

  const canvas = await OrgCanvas.findOne({ id: canvasId, userId });
  if (!canvas) {
    return res.status(404).json({ error: "Canvas not found" });
  }

  canvas.edges = canvas.edges.filter((e) => e.id !== id);
  await canvas.save();
  res.json({ success: true });
}
