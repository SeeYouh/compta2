import dotenv from "dotenv";

dotenv.config();

const {
  MONGODB_USERS_USER,
  MONGODB_USERS_PASSWORD,
  MONGODB_USERS_ADDRESS,
  MONGODB_USERS_DATABASE,
  MONGODB_SYNAPSE_USER,
  MONGODB_SYNAPSE_PASSWORD,
  MONGODB_SYNAPSE_ADDRESS,
  MONGODB_SYNAPSE_DATABASE,
  MONGODB_TRAME_USER,
  MONGODB_TRAME_PASSWORD,
  MONGODB_TRAME_ADDRESS,
  MONGODB_TRAME_DATABASE,
  MONGODB_ODYSSEE_USER,
  MONGODB_ODYSSEE_PASSWORD,
  MONGODB_ODYSSEE_ADDRESS,
  MONGODB_ODYSSEE_DATABASE,
  APP_URL,
  CORS_ORIGIN,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  NODE_ENV,
  PORT,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM_EMAIL,
  SMTP_FROM_NAME,
} = process.env;

// ─── Validation au démarrage ─────────────────────────────────────────────────
// Toute variable manquante ou malformée doit faire échouer le serveur ici,
// avec le nom de la variable fautive. Sans cela, les conséquences sont différées
// et difficiles à diagnostiquer : un JWT_SECRET absent laisse le serveur démarrer
// puis fait échouer chaque requête authentifiée en 500.

const requiredVars = {
  MONGODB_USERS_USER,
  MONGODB_USERS_PASSWORD,
  MONGODB_USERS_ADDRESS,
  MONGODB_USERS_DATABASE,
  MONGODB_SYNAPSE_USER,
  MONGODB_SYNAPSE_PASSWORD,
  MONGODB_SYNAPSE_ADDRESS,
  MONGODB_SYNAPSE_DATABASE,
  MONGODB_TRAME_USER,
  MONGODB_TRAME_PASSWORD,
  MONGODB_TRAME_ADDRESS,
  MONGODB_TRAME_DATABASE,
  MONGODB_ODYSSEE_USER,
  MONGODB_ODYSSEE_PASSWORD,
  MONGODB_ODYSSEE_ADDRESS,
  MONGODB_ODYSSEE_DATABASE,
  APP_URL,
  CORS_ORIGIN,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  NODE_ENV,
  PORT,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM_EMAIL,
  SMTP_FROM_NAME,
};

const missing = Object.entries(requiredVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(
    `Variable(s) manquante(s) dans .env : ${missing.join(", ")}`,
  );
}

// Présence ne suffit pas : une valeur non numérique produit NaN silencieusement
// (parseInt(undefined) → NaN → comportement du rate limiter non défini).
const numericVars = {
  PORT,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  SMTP_PORT,
};

const notNumeric = Object.entries(numericVars)
  .filter(([, value]) => !Number.isFinite(Number(value)))
  .map(([key]) => key);

if (notNumeric.length > 0) {
  throw new Error(
    `Variable(s) .env devant être numérique(s) : ${notNumeric.join(", ")}`,
  );
}

// NODE_ENV pilote deux branchements (origine CORS, service des fichiers statiques).
// Une faute de frappe ne doit pas basculer silencieusement sur la mauvaise branche.
// "test" est indispensable : Vitest positionne NODE_ENV=test, et sans lui le
// département de test ne peut même pas importer la configuration.
const VALID_ENVS = ["development", "production", "test"];
if (!VALID_ENVS.includes(NODE_ENV)) {
  throw new Error(
    `NODE_ENV doit valoir ${VALID_ENVS.join(" ou ")} — valeur reçue : "${NODE_ENV}"`,
  );
}

/**
 * Construit l'URI d'un module. Un `MONGODB_<MODULE>_URI` explicite prend le pas
 * sur l'URI dérivée des identifiants.
 *
 * Raison d'être : le département de test doit pouvoir pointer les 4 connexions
 * vers une base en mémoire (`mongodb://127.0.0.1:port`), ce que le schéma
 * `mongodb+srv://` codé en dur rendait impossible. Sans cette prise, l'isolation
 * des données ne serait testable que contre la base de production — inacceptable.
 *
 * En production, aucune de ces variables n'est définie : le comportement est
 * strictement inchangé, et les identifiants restent obligatoires.
 */
const uriFor = (moduleName, user, password, address) =>
  process.env[`MONGODB_${moduleName}_URI`] ??
  `mongodb+srv://${user}:${password}@${address}`;

export const config = {
  mongodbUsers: {
    uri: uriFor("USERS", MONGODB_USERS_USER, MONGODB_USERS_PASSWORD, MONGODB_USERS_ADDRESS),
    dbName: MONGODB_USERS_DATABASE,
  },
  mongodbSynapse: {
    uri: uriFor("SYNAPSE", MONGODB_SYNAPSE_USER, MONGODB_SYNAPSE_PASSWORD, MONGODB_SYNAPSE_ADDRESS),
    dbName: MONGODB_SYNAPSE_DATABASE,
  },
  mongodbTrame: {
    uri: uriFor("TRAME", MONGODB_TRAME_USER, MONGODB_TRAME_PASSWORD, MONGODB_TRAME_ADDRESS),
    dbName: MONGODB_TRAME_DATABASE,
  },
  mongodbOdyssee: {
    uri: uriFor("ODYSSEE", MONGODB_ODYSSEE_USER, MONGODB_ODYSSEE_PASSWORD, MONGODB_ODYSSEE_ADDRESS),
    dbName: MONGODB_ODYSSEE_DATABASE,
  },
  server: {
    port: PORT,
    env: NODE_ENV,
  },
  app: {
    url: APP_URL,
  },
  cors: {
    origin: CORS_ORIGIN,
  },
  jwt: {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRES_IN,
  },
  rateLimit: {
    windowMs: parseInt(RATE_LIMIT_WINDOW_MS),
    max: parseInt(RATE_LIMIT_MAX_REQUESTS),
  },
  smtp: {
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    user: SMTP_USER,
    password: SMTP_PASSWORD,
    fromEmail: SMTP_FROM_EMAIL,
    fromName: SMTP_FROM_NAME,
  },
};
