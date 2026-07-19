import { Request, Response, NextFunction } from "express"
import { z, ZodError } from "zod"

export const validateRequest =
	(schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body)
			next()
		} catch (error) {
			if (error instanceof ZodError) {
				const formattedErrors = error.issues.map((err) => ({
					path: err.path.join("."),
					message: err.message,
				}))
				return res.status(400).json({
					success: false,
					error: "Validation failed",
					details: formattedErrors,
				})
			}
			next(error)
		}
	}
