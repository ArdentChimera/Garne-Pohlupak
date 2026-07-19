import { Router, Request, Response } from "express"
import { db } from "../db/index"
import { users } from "../db/schema"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import { generateToken, generateGuestToken } from "../utils/jwt"
import { z } from "zod"
import { validateRequest } from "../middleware/validate"

const router = Router()

// Validation schemas
const registerSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
})

const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
})

// POST /api/auth/register - Register new user
router.post(
	"/register",
	validateRequest(registerSchema),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { email, password, firstName, lastName } = req.body

			// Check if user already exists
			const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

			if (existingUser.length > 0) {
				res.status(400).json({ success: false, error: "Email already registered" })
				return
			}

			// Hash password
			const hashedPassword = await bcrypt.hash(password, 10)

			// Create user
			const [newUser] = await db
				.insert(users)
				.values({
					email,
					password: hashedPassword,
					firstName,
					lastName,
					role: "customer",
					isActive: 1,
				})
				.returning()

			// Generate token
			const token = generateToken({
				userId: newUser.id,
				email: newUser.email,
				role: newUser.role as "customer" | "admin" | "guest",
			})

			res.status(201).json({
				success: true,
				data: {
					user: {
						id: newUser.id,
						email: newUser.email,
						firstName: newUser.firstName,
						lastName: newUser.lastName,
						role: newUser.role,
					},
					token,
				},
			})
		} catch (error: any) {
			console.error("Register error:", error)
			res.status(500).json({ success: false, error: "Registration failed" })
		}
	}
)

// POST /api/auth/login - Login user
router.post(
	"/login",
	validateRequest(loginSchema),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { email, password } = req.body

			// Find user
			const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

			if (!user || !user.password) {
				res.status(401).json({ success: false, error: "Invalid email or password" })
				return
			}

			// Check if user is active
			if (user.isActive === 0) {
				res.status(403).json({ success: false, error: "Account is deactivated" })
				return
			}

			// Verify password
			const isValidPassword = await bcrypt.compare(password, user.password)

			if (!isValidPassword) {
				res.status(401).json({ success: false, error: "Invalid email or password" })
				return
			}

			// Generate token
			const token = generateToken({
				userId: user.id,
				email: user.email,
				role: user.role as "customer" | "admin" | "guest",
			})

			res.json({
				success: true,
				data: {
					user: {
						id: user.id,
						email: user.email,
						firstName: user.firstName,
						lastName: user.lastName,
						role: user.role,
					},
					token,
				},
			})
		} catch (error: any) {
			console.error("Login error:", error)
			res.status(500).json({ success: false, error: "Login failed" })
		}
	}
)

// POST /api/auth/guest - Generate guest token
router.post("/guest", (req: Request, res: Response): void => {
	const token = generateGuestToken()
	res.json({
		success: true,
		data: { token },
		message: "Guest token generated (valid for 24 hours)",
	})
})

export default router
