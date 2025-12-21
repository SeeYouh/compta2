import crypto from "crypto";
import jwt from "jsonwebtoken";

import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../config/email.js";
import { User } from "../models/User.js";

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, mot de passe et nom requis",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: "Cet email est déjà utilisé",
      });
    }

    // Générer le token de vérification
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Créer l'utilisateur
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });

    // Envoyer l'email de vérification
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
      // On continue quand même, l'utilisateur peut redemander l'email
    }

    res.status(201).json({
      message:
        "Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({
      error: "Erreur serveur lors de l'inscription",
    });
  }
};

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email et mot de passe requis",
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        error: "Email ou mot de passe incorrect",
      });
    }

    // Vérifier si l'email est vérifié
    if (!user.isVerified) {
      return res.status(403).json({
        error:
          "Veuillez vérifier votre email avant de vous connecter. Vérifiez votre boîte de réception.",
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Email ou mot de passe incorrect",
      });
    }

    // Générer le token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la connexion",
    });
  }
};

/**
 * GET /api/auth/me
 * Récupère les informations de l'utilisateur connecté
 */
export const getMe = async (req, res) => {
  try {
    // req.userId est défini par le middleware auth
    const user = await User.findOne({ id: req.userId });

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
      });
    }

    res.json(user.toJSON());
  } catch (error) {
    console.error("Erreur getMe:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération de l'utilisateur",
    });
  }
};

/**
 * GET /api/auth/verify-email/:token
 * Vérifie l'email de l'utilisateur avec le token
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Trouver l'utilisateur avec ce token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Token de vérification invalide ou expiré",
      });
    }

    // Marquer l'email comme vérifié
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    // Générer le token JWT pour connexion automatique
    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({
      message: "Email vérifié avec succès ! Vous êtes maintenant connecté.",
      user: user.toJSON(),
      token: jwtToken,
    });
  } catch (error) {
    console.error("Erreur verifyEmail:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la vérification de l'email",
    });
  }
};

/**
 * POST /api/auth/resend-verification
 * Renvoie l'email de vérification
 */
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requis" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email déjà vérifié" });
    }

    // Générer un nouveau token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Envoyer l'email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      message: "Email de vérification renvoyé avec succès",
    });
  } catch (error) {
    console.error("Erreur resendVerification:", error);
    res.status(500).json({
      error: "Erreur serveur lors du renvoi de l'email",
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Demande de réinitialisation de mot de passe
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requis" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return res.json({
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé",
      });
    }

    // Générer le token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    // Envoyer l'email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé",
    });
  } catch (error) {
    console.error("Erreur forgotPassword:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la demande de réinitialisation",
    });
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Réinitialise le mot de passe avec le token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Trouver l'utilisateur avec ce token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Token de réinitialisation invalide ou expiré",
      });
    }

    // Mettre à jour le mot de passe
    user.password = password; // Sera hashé par le pre-save hook
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();

    res.json({
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    console.error("Erreur resetPassword:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la réinitialisation du mot de passe",
    });
  }
};
