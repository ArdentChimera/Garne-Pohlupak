"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, error: "No token provided" });
        return;
    }
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = (0, jwt_1.verifyToken)(token);
    if (!payload) {
        res.status(401).json({ success: false, error: "Invalid or expired token" });
        return;
    }
    req.user = payload;
    next();
}
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: "Authentication required" });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ success: false, error: "Insufficient permissions" });
            return;
        }
        next();
    };
}
// Optional authentication - doesn't fail if no token, but populates req.user if valid
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const payload = (0, jwt_1.verifyToken)(token);
        if (payload) {
            req.user = payload;
        }
    }
    next();
}
