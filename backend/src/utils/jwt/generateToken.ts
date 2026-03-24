import jwt from "jsonwebtoken";
import { serverConfig } from "../../configs/index.js";

export const generateToken = async (payload: {
  userId: number;
  role: string;
}) => {
  return jwt.sign(payload, serverConfig.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};
