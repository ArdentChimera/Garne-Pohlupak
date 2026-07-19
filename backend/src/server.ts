import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { createServer } from "http"
import { Server } from "socket.io"
import "dotenv/config"

// Import routes
import authRoutes from "./routes/auth"
import adminRoutes from "./routes/admin"
import productRoutes from "./routes/products"
import cartRoutes from "./routes/cart"
import orderRoutes from "./routes/orders"

// Import cron jobs
import "./cron/cleanup"

const app = express()
app.set("trust proxy", true)
const httpServer = createServer(app)

// Allow multiple origins for development
const allowedOrigins = [
	"http://localhost:3030",
	"http://localhost:5173",
	"http://localhost:5174",
	process.env.FRONTEND_URL,
].filter(Boolean)

export const io = new Server(httpServer, {
	cors: { origin: allowedOrigins },
})

// Security middleware
app.use(helmet())

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps, curl, or Cloud Run internal health checks)
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true)
			} else {
				// Log the blocked origin for debugging instead of throwing a fatal error
				console.warn(`⚠️ CORS blocked request from origin: ${origin}`)
				callback(null, false)
			}
		},
		credentials: true,
	})
)

app.use(express.json())

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: {
		success: false,
		error: "Too many requests, please try again later",
	},
})

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 login/register attempts per windowMs
	message: {
		success: false,
		error: "Too many attempts, please try again later",
	},
})

app.use("/api/", limiter)
app.use("/api/auth/login", authLimiter)
app.use("/api/auth/register", authLimiter)

// Health Check
app.get("/health", (req, res) => res.json({ status: "ok" }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)

// 404 handler
app.use((_req, res) => {
	res.status(404).json({ success: false, error: "Route not found" })
})

// Global error handler
app.use(
	(
		err: any,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction
	) => {
		console.error("Global error:", err)
		res.status(500).json({ success: false, error: "Internal server error" })
	}
)

// Parse port and explicitly bind to '0.0.0.0' for Cloud Run visibility
const PORT = Number(process.env.PORT) || 8080
httpServer.listen(PORT, "0.0.0.0", () => {
	console.log(`🚀 Server running on port ${PORT}`)
	console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`)
	console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`)
})
