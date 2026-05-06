import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import {
  createCanvas,
  createEdge,
  createNode,
  deleteCanvas,
  deleteEdge,
  deleteNode,
  getAllCanvases,
  replaceCanvas,
  updateNode,
  updateViewport,
} from "../controllers/orgController.js";

const router = Router();

router.use(authenticate);

// Canvas
router.get("/canvas", getAllCanvases);
router.post("/canvas", createCanvas);
router.delete("/canvas/:id", deleteCanvas);
router.patch("/canvas/:id/viewport", updateViewport);
router.put("/canvas/:id", replaceCanvas);

// Nodes
router.post("/node", createNode);
router.patch("/node/:id", updateNode);
router.delete("/node/:id", deleteNode);

// Edges
router.post("/edge", createEdge);
router.delete("/edge/:id", deleteEdge);

export default router;
