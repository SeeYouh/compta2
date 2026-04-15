import { Router } from "express";

import {
  acceptInvitation,
  declineInvitation,
  getMembers,
  getPendingInvitations,
  inviteUser,
  removeMember,
  revokeInvitation,
  updateMemberRole,
} from "../controllers/sharingController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Invitations reçues (pour l'utilisateur connecté)
router.get("/invitations/pending", getPendingInvitations);
router.post("/invitations/:token/accept", acceptInvitation);
router.post("/invitations/:token/decline", declineInvitation);

// Gestion des membres d'un compte
router.post("/:accountId/invite", inviteUser);
router.get("/:accountId/members", getMembers);
router.patch("/:accountId/members/:memberId", updateMemberRole);
router.delete("/:accountId/members/:memberId", removeMember);
router.delete("/:accountId/invitations/:token", revokeInvitation);

export default router;
