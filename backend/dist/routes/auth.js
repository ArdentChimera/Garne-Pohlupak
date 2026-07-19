"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const drizzle_orm_1 = require("drizzle-orm");
const jwt_1 = require("../utils/jwt");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// Validation schemas
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// POST /api/auth/register - Register new user
router.post("/register", (0, validate_1.validateRequest)(registerSchema), async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        // Check if user already exists
        const existingUser = await index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
        if (existingUser.length > 0) {
            res.status(400).json({ success: false, error: "Email already registered" });
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user
        const [newUser] = await index_1.db
            .insert(schema_1.users)
            .values({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: "customer",
            isActive: 1,
        })
            .returning();
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
        });
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
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, error: "Registration failed" });
    }
});
// POST /api/auth/login - Login user
router.post("/login", (0, validate_1.validateRequest)(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const [user] = await index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
        if (!user || !user.password) {
            res.status(401).json({ success: false, error: "Invalid email or password" });
            return;
        }
        // Check if user is active
        if (user.isActive === 0) {
            res.status(403).json({ success: false, error: "Account is deactivated" });
            return;
        }
        // Verify password
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ success: false, error: "Invalid email or password" });
            return;
        }
        // Generate token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
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
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, error: "Login failed" });
    }
});
// POST /api/auth/guest - Generate guest token
router.post("/guest", (req, res) => {
    const token = (0, jwt_1.generateGuestToken)();
    res.json({
        success: true,
        data: { token },
        message: "Guest token generated (valid for 24 hours)",
    });
});
exports.default = router;
