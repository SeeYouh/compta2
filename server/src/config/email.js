import nodemailer from "nodemailer";

/**
 * Configuration du service d'envoi d'emails
 */
export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      type: "LOGIN",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Envoie un email de vérification
 */
export const sendVerificationEmail = async (email, name, token) => {
  const transporter = createEmailTransporter();

  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Validez votre adresse email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background-color: #4CAF50; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue ${name} !</h1>
            </div>
            <div class="content">
              <p>Merci de vous être inscrit sur ${process.env.SMTP_FROM_NAME}.</p>
              <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Valider mon email</a>
              </div>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p><strong>Ce lien expire dans 24 heures.</strong></p>
              <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
            </div>
            <div class="footer">
              <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Bienvenue ${name} !
      
      Merci de vous être inscrit sur ${process.env.SMTP_FROM_NAME}.
      
      Pour activer votre compte, veuillez cliquer sur ce lien :
      ${verificationUrl}
      
      Ce lien expire dans 24 heures.
      
      Si vous n'avez pas créé de compte, ignorez cet email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email de vérification envoyé à ${email}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw new Error("Impossible d'envoyer l'email de vérification");
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (email, name, token) => {
  const transporter = createEmailTransporter();

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background-color: #ff9800; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <p><strong>Ce lien expire dans 1 heure.</strong></p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
            <div class="footer">
              <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Bonjour ${name},
      
      Vous avez demandé à réinitialiser votre mot de passe.
      
      Cliquez sur ce lien pour créer un nouveau mot de passe :
      ${resetUrl}
      
      Ce lien expire dans 1 heure.
      
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email de réinitialisation envoyé à ${email}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw new Error("Impossible d'envoyer l'email de réinitialisation");
  }
};

export const sendInvitationEmail = async (
  email,
  invitedByName,
  accountName,
  role,
  token,
) => {
  const transporter = createEmailTransporter();
  const acceptUrl = `${process.env.APP_URL}/accept-invitation?token=${token}`;
  const roleLabel = role === "editor" ? "Éditeur" : "Lecteur";

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: `${invitedByName} vous invite à accéder à un compte`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invitation à partager un compte</h2>
        <p>Bonjour,</p>
        <p><strong>${invitedByName}</strong> vous invite à accéder au compte <strong>"${accountName}"</strong> en tant que <strong>${roleLabel}</strong>.</p>
        <p>
          <a href="${acceptUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
            Accepter l'invitation
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 7 jours.</p>
        <p style="color: #6b7280; font-size: 14px;">Si vous ne souhaitez pas accepter, ignorez cet email.</p>
      </div>
    `,
    text: `
      Bonjour,

      ${invitedByName} vous invite à accéder au compte "${accountName}" en tant que ${roleLabel}.

      Cliquez sur ce lien pour accepter l'invitation :
      ${acceptUrl}

      Ce lien expire dans 7 jours.

      Si vous ne souhaitez pas accepter, ignorez cet email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email d'invitation envoyé à ${email}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'invitation:", error);
    throw new Error("Impossible d'envoyer l'email d'invitation");
  }
};

export const sendInvitationToNewUserEmail = async (
  email,
  invitedByName,
  accountName,
  role,
  token,
) => {
  const transporter = createEmailTransporter();
  const registerUrl = `${process.env.APP_URL}/register?invitationToken=${token}`;
  const roleLabel = role === "editor" ? "Éditeur" : "Lecteur";

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: `${invitedByName} vous invite à rejoindre l'application`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invitation à rejoindre l'application</h2>
        <p>Bonjour,</p>
        <p><strong>${invitedByName}</strong> vous invite à accéder au compte <strong>"${accountName}"</strong> en tant que <strong>${roleLabel}</strong>.</p>
        <p>Pour accepter cette invitation, vous devez d'abord créer un compte :</p>
        <p>
          <a href="${registerUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
            Créer mon compte et accepter
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">Ce lien expire dans 7 jours.</p>
        <p style="color: #6b7280; font-size: 14px;">Si vous ne souhaitez pas participer, ignorez cet email.</p>
      </div>
    `,
    text: `
      Bonjour,

      ${invitedByName} vous invite à accéder au compte "${accountName}" en tant que ${roleLabel}.

      Pour accepter cette invitation, vous devez d'abord créer un compte :
      ${registerUrl}

      Ce lien expire dans 7 jours.

      Si vous ne souhaitez pas participer, ignorez cet email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email d'invitation (nouveau user) envoyé à ${email}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'invitation:", error);
    throw new Error("Impossible d'envoyer l'email d'invitation");
  }
};
