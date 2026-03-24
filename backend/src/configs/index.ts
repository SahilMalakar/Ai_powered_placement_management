import dotenv from 'dotenv';

type ServerConfig = {
  PORT: number;
  DATABASE_URL: string;
};

function loadEnv() {
    dotenv.config();
    console.log("Environment variables loaded");
}

loadEnv();


export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3001,
  DATABASE_URL:
    process.env.DATABASE_URL ||
        "postgresql://postgres:strongpassword@localhost:5432/placement_db",
  
};