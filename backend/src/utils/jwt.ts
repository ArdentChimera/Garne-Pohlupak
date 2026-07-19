import jwt from "jsonwebtoken"
import "dotenv/config"

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = "7d" // Tokens expire in 7 days

export interface JWTPayload {
	userId: number
	email: string
	role: "customer" | "admin" | "guest"
}

export function generateToken(payload: JWTPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as JWTPayload
	} catch (error) {
		return null
	}
}

export function generateGuestToken(): string {
	const guestPayload: JWTPayload = {
		userId: -1, // Negative ID indicates guest
		email: `guest_${Date.now()}@temp.local`,
		role: "guest",
	}
	return jwt.sign(guestPayload, JWT_SECRET, { expiresIn: "24h" }) // Shorter expiry for guests
}
