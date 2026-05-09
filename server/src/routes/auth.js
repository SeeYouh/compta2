import express from "express";

import { authenticate } from "../middleware/auth.js";
import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  register,
  resendVerification,
  resetPassword,
  updateProfile,
  verifyEmail,
} from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register - Inscription
router.post("/register", register);

// POST /api/auth/login - Connexion
router.post("/login", login);

// GET /api/auth/me - Récupérer l'utilisateur connecté
router.get("/me", authenticate, getMe);

// GET /api/auth/verify-email/:token - Vérifier l'email
router.get("/verify-email/:token", verifyEmail);

// POST /api/auth/resend-verification - Renvoyer l'email de vérification
router.post("/resend-verification", resendVerification);

// POST /api/auth/forgot-password - Demander réinitialisation mot de passe
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password/:token - Réinitialiser le mot de passe
router.post("/reset-password/:token", resetPassword);

// PATCH /api/auth/profile - Modifier le pseudo
router.patch("/profile", authenticate, updateProfile);

// PATCH /api/auth/password - Changer le mot de passe
router.patch("/password", authenticate, changePassword);

export default router;
