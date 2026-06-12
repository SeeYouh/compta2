import express from "express";

import organigrammeRoutes from "./organigramme.js";

const router = express.Router();

router.use("/organigramme", organigrammeRoutes);

export default router;
