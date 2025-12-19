import ResponseError from "../error/response-error.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      throw new ResponseError(
        401,
        "You are not authenticated, Please log out to continue."
      );
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (err) {
        res.clearCookie("jwt", {
          httpOnly: true,
          secure: true,
          sameSite: "none"
        });
        throw new ResponseError(401, "Token is invalid or expired");
      }

      if (!payload.userId) {
        throw new ResponseError(401, "Invalid token payload");
      }

      req.userId = payload.userId;
      req.userEmail = payload.email; // Store email if needed
      next();
    });
  } catch (error) {
    next(error);
  }
};
