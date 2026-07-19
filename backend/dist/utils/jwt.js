"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.generateGuestToken = generateGuestToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d"; // Tokens expire in 7 days
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
function generateGuestToken() {
    const guestPayload = {
        userId: -1, // Negative ID indicates guest
        email: `guest_${Date.now()}@temp.local`,
        role: "guest",
    };
    return jsonwebtoken_1.default.sign(guestPayload, JWT_SECRET, { expiresIn: "24h" }); // Shorter expiry for guests
}
