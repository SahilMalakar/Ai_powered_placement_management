import dotenv from "dotenv";

type ServerConfig = {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  GROQ_API_KEY: string;
  REDIS_URL: string;
  MAIL_PASS: string;
  MAIL_USER: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
};

function loadEnv() {
  dotenv.config();
  console.log("Environment variables loaded");
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 4001,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:strongpassword@localhost:5432/placement_db",
  JWT_SECRET: process.env.JWT_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  GROQ_API_KEY: process.env.GROQ_API_KEY!,
  REDIS_URL: process.env.REDIS_URL!,
  MAIL_PASS: process.env.MAIL_PASS!,
  MAIL_USER: process.env.MAIL_USER!,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_KEY_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
};
