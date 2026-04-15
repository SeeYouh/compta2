import { Router } from "express";

import {
  addContact,
  deleteContact,
  getContacts,
  updateContact,
} from "../controllers/contactsController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getContacts);
router.post("/", addContact);
router.patch("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
