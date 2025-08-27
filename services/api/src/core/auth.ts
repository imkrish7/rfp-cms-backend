import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthUser } from "../interfaces/Auth";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
}

export function requireAuth(roles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = auth.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      let user: AuthUser = {
        sub: decoded.sub, role: decoded.role,
        vendorId: null,
        orgId: null
      };
      if (decoded.role === "VENDOR") {
        user["vendorId"] = decoded.vendorId;
      } else if (decoded.role === "PROCUREMENT") {
        user["orgId"] = decoded.orgId
      }
      req.user = user;
      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}
