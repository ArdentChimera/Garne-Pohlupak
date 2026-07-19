import { Request, Response, NextFunction } from "express"
import { verifyToken, JWTPayload } from "../utils/jwt"

// Extend Express Request to include user info
declare global {
	namespace Express {
		interface Request {
			user?: JWTPayload
		}
	}
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).json({ success: false, error: "No token provided" })
		return
	}

	const token = authHeader.substring(7) // Remove "Bearer " prefix
	const payload = verifyToken(token)

	if (!payload) {
		res.status(401).json({ success: false, error: "Invalid or expired token" })
		return
	}

	req.user = payload
	next()
}

export function requireRole(...allowedRoles: string[]) {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({ success: false, error: "Authentication required" })
			return
		}

		if (!allowedRoles.includes(req.user.role)) {
			res.status(403).json({ success: false, error: "Insufficient permissions" })
			return
		}

		next()
	}
}

// Optional authentication - doesn't fail if no token, but populates req.user if valid
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization

	if (authHeader && authHeader.startsWith("Bearer ")) {
		const token = authHeader.substring(7)
		const payload = verifyToken(token)
		if (payload) {
			req.user = payload
		}
	}

	next()
}
