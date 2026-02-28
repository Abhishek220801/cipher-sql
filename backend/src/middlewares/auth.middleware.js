import asyncHandler from "../lib/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../lib/ApiError.js";

const createToken = async ({ ip, userAgent }, res) => {
  let user = await User.findOne({ ip, userAgent });
  let token = jwt.sign({ ip, userAgent }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  if (!user) {
    user = await User.create({ ip, userAgent, token });
  } else {
    user.token = token;
    await user.save();
  }

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });

  return token;
};

// auto auth with stateful session
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  const reqIp = req.ip;
  const reqUserAgent = req.get("User-Agent");

  if (!token) {
    token = await createToken({ ip: reqIp, userAgent: reqUserAgent }, res);
  }

  const { ip, userAgent } = jwt.verify(token, process.env.JWT_SECRET);

  if (ip !== reqIp || userAgent !== reqUserAgent) {
    throw new ApiError(401, "Invalid user session");
  }

  const user = await User.findOne({ ip, userAgent });

  if (!user) {
    throw new ApiError(401, "Invalid user session");
  }

  req.user = user;

  next();
});

export default authMiddleware;
