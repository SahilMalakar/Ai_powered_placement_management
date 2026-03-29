import jwt from "jsonwebtoken";
import { serverConfig } from "../../configs/index.js";

export const generateToken = async (payload: {
  userId: number;
  role: string;
  email: string;
}) => {
  return jwt.sign(payload, serverConfig.JWT_SECRET as string, {
    expiresIn: "1d", // later will update this to 30min
  });
};

export const generateRefreshToken = async(payload:{
  userId:number,
  role:string,
  email: string;
})=>{
  return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET as string,{
    expiresIn:"3d" // later will update this to 1 day
  } )
}
