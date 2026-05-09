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
 * Rate limiting : 1 demande/5min, max 3 demandes/heure
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

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    // Nettoyer les demandes de plus d'une heure
    user.passwordResetRequests = user.passwordResetRequests.filter(
      (timestamp) => now - timestamp.getTime() < oneHour,
    );

    // Vérifier la limite de 5 minutes depuis la dernière demande
    if (user.passwordResetRequests.length > 0) {
      const lastRequest =
        user.passwordResetRequests[user.passwordResetRequests.length - 1];
      const timeSinceLastRequest = now - lastRequest.getTime();

      if (timeSinceLastRequest < fiveMinutes) {
        const remainingMinutes = Math.ceil(
          (fiveMinutes - timeSinceLastRequest) / 60000,
        );
        return res.status(429).json({
          error: `Veuillez patienter ${remainingMinutes} minute${
            remainingMinutes > 1 ? "s" : ""
          } avant de redemander un lien`,
          remainingTime: Math.ceil((fiveMinutes - timeSinceLastRequest) / 1000),
        });
      }
    }

    // Vérifier la limite de 3 demandes par heure
    if (user.passwordResetRequests.length >= 3) {
      const oldestRequest = user.passwordResetRequests[0];
      const timeSinceOldest = now - oldestRequest.getTime();
      const remainingTime = oneHour - timeSinceOldest;

      if (remainingTime > 0) {
        const remainingMinutes = Math.ceil(remainingTime / 60000);
        return res.status(429).json({
          error: `Limite de 3 demandes par heure atteinte. Veuillez réessayer dans ${remainingMinutes} minute${
            remainingMinutes > 1 ? "s" : ""
          }`,
          remainingTime: Math.ceil(remainingTime / 1000),
        });
      }
    }

    // Ajouter la nouvelle demande
    user.passwordResetRequests.push(new Date(now));

    // Générer le token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = new Date(now + 60 * 60 * 1000); // 1h
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
 * PATCH /api/auth/profile
 * Modifie le pseudo de l'utilisateur connecté
 */
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Le pseudo est requis" });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        error: "Le pseudo ne peut pas dépasser 50 caractères",
      });
    }

    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    user.name = name.trim();
    await user.save();

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error("Erreur updateProfile:", error);
    res.status(500).json({
      error: "Erreur serveur lors de la mise à jour du profil",
    });
  }
};

/**
 * PATCH /api/auth/password
 * Change le mot de passe de l'utilisateur connecté
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Mot de passe actuel et nouveau mot de passe requis",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
    }

    const user = await User.findOne({ id: req.userId });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: "Mot de passe actuel incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur changePassword:", error);
    res.status(500).json({
      error: "Erreur serveur lors du changement de mot de passe",
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
