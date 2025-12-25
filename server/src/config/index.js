import dotenv from "dotenv";

dotenv.config();

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_ADDRESS, MONGODB_DATABASE } =
  process.env;

if (
  !MONGODB_USER ||
  !MONGODB_PASSWORD ||
  !MONGODB_ADDRESS ||
  !MONGODB_DATABASE
) {
  throw new Error("Variables MongoDB manquantes dans .env");
}

export const config = {
  mongodb: {
    uri: `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_ADDRESS}`,
    dbName: MONGODB_DATABASE,
  },
  server: {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  },
};
