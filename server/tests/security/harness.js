import express from "express";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * Banc d'essai des tests de sécurité.
 *
 * Démarre une VRAIE base MongoDB en mémoire et y pointe les 4 connexions du
 * serveur. Un mock ne prouverait rien sur l'isolation des données : c'est
 * précisément le comportement des requêtes réelles que l'on veut vérifier.
 *
 * L'ordre compte — les variables d'environnement doivent être posées AVANT le
 * premier import de `config/index.js`, car les connexions sont créées au
 * chargement du module.
 */
let memoryServer;

export async function startMemoryMongo() {
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();

  for (const mod of ["USERS", "SYNAPSE", "TRAME", "ODYSSEE"]) {
    process.env[`MONGODB_${mod}_URI`] = uri;
    process.env[`MONGODB_${mod}_USER`] ??= "test";
    process.env[`MONGODB_${mod}_PASSWORD`] ??= "test";
    process.env[`MONGODB_${mod}_ADDRESS`] ??= "127.0.0.1";
    process.env[`MONGODB_${mod}_DATABASE`] ??= `test_${mod.toLowerCase()}`;
  }

  process.env.NODE_ENV ??= "test";
  process.env.PORT ??= "5000";
  process.env.APP_URL ??= "http://localhost:5173";
  process.env.CORS_ORIGIN ??= "http://localhost:5173";
  process.env.JWT_SECRET ??= "secret-de-test-suffisamment-long-pour-hs256";
  process.env.JWT_EXPIRES_IN ??= "1h";
  process.env.RATE_LIMIT_WINDOW_MS ??= "900000";
  process.env.RATE_LIMIT_MAX_REQUESTS ??= "100000";
  process.env.SMTP_HOST ??= "localhost";
  process.env.SMTP_PORT ??= "587";
  process.env.SMTP_SECURE ??= "false";
  process.env.SMTP_USER ??= "test";
  process.env.SMTP_PASSWORD ??= "test";
  process.env.SMTP_FROM_EMAIL ??= "test@example.com";
  process.env.SMTP_FROM_NAME ??= "Test";

  return uri;
}

export async function stopMemoryMongo() {
  const { usersConn, synapseConn, trameConn, odysseeConn } = await import(
    "../../src/config/database.js"
  );
  await Promise.all([
    usersConn.close(),
    synapseConn.close(),
    trameConn.close(),
    odysseeConn.close(),
  ]);
  await memoryServer?.stop();
}

/**
 * Monte une application Express minimale sur les vraies routes du projet.
 * Aucun middleware de sécurité n'est ajouté ni retiré : on teste la chaîne telle
 * qu'elle tourne en production.
 */
export async function buildApp() {
  const routes = (await import("../../src/routes/index.js")).default;
  const { errorHandler, notFound } = await import(
    "../../src/middleware/errorHandler.js"
  );

  const app = express();
  app.use(express.json());
  app.use("/api", routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

/** Jeton signé avec le même secret que le serveur. */
export function tokenFor(userId, role = "user") {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` });
