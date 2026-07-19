"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const formattedErrors = error.issues.map((err) => ({
                path: err.path.join("."),
                message: err.message,
            }));
            return res.status(400).json({
                success: false,
                error: "Validation failed",
                details: formattedErrors,
            });
        }
        next(error);
    }
};
exports.validateRequest = validateRequest;
