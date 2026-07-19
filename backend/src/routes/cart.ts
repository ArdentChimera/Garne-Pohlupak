import { Router, Request, Response } from "express"
import { db } from "../db/index"
import { cartReservations, products } from "../db/schema"
import { eq, and, sql } from "drizzle-orm"
import { optionalAuth } from "../middleware/auth"
import { validateRequest } from "../middleware/validate"
import { z } from "zod"

const router = Router()

// All cart routes support both authenticated users and guests
router.use(optionalAuth)

// Validation schemas
const addToCartSchema = z.object({
	productId: z.number().int().positive(),
	quantity: z.number().int().positive(),
})

const updateCartItemSchema = z.object({
	quantity: z.number().int().nonnegative(), // 0 to remove
})

// GET /api/cart - Get user's cart
router.get("/", async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user || req.user.userId < 0) {
			res.json({
				success: true,
				data: { items: [] },
				message: "No cart found for guest user",
			})
			return
		}

		const cartItems = await db
			.select({
				id: cartReservations.id,
				productId: cartReservations.productId,
				quantity: cartReservations.quantity,
				expiresAt: cartReservations.expiresAt,
				productName: products.name,
				productPrice: products.price,
				productImage: products.imageUrl,
				availableStock: products.stockQuantity,
			})
			.from(cartReservations)
			.leftJoin(products, eq(cartReservations.productId, products.id))
			.where(eq(cartReservations.userId, req.user.userId))

		// Calculate total
		const total = cartItems.reduce(
			(sum, item) => sum + item.productPrice! * item.quantity,
			0
		)

		res.json({
			success: true,
			data: {
				items: cartItems,
				total,
			},
		})
	} catch (error: any) {
		console.error("Get cart error:", error)
		res.status(500).json({ success: false, error: "Failed to fetch cart" })
	}
})

// POST /api/cart - Add item to cart
router.post(
	"/",
	validateRequest(addToCartSchema),
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.user || req.user.userId < 0) {
				res.status(401).json({
					success: false,
					error: "Authentication required. Please login or get a guest token.",
				})
				return
			}

			const { productId, quantity } = req.body

			// Check if product exists and has enough stock
			const [product] = await db
				.select()
				.from(products)
				.where(and(eq(products.id, productId), eq(products.isActive, 1)))
				.limit(1)

			if (!product) {
				res.status(404).json({ success: false, error: "Product not found" })
				return
			}

			const availableStock = product.stockQuantity - product.reservedQuantity

			if (availableStock < quantity) {
				res.status(400).json({
					success: false,
					error: `Insufficient stock. Only ${availableStock} items available.`,
				})
				return
			}

			// Check if item already in cart
			const [existingItem] = await db
				.select()
				.from(cartReservations)
				.where(
					and(
						eq(cartReservations.userId, req.user.userId),
						eq(cartReservations.productId, productId)
					)
				)
				.limit(1)

			if (existingItem) {
				// Update quantity
				const newQuantity = existingItem.quantity + quantity

				if (availableStock < newQuantity) {
					res.status(400).json({
						success: false,
						error: `Insufficient stock. Only ${availableStock} items available.`,
					})
					return
				}

				const [updated] = await db
					.update(cartReservations)
					.set({
						quantity: newQuantity,
						expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Extend expiry by 30 minutes
					})
					.where(eq(cartReservations.id, existingItem.id))
					.returning()

				res.json({
					success: true,
					data: updated,
					message: "Cart updated successfully",
				})
			} else {
				// Add new cart item
				const [newItem] = await db
					.insert(cartReservations)
					.values({
						userId: req.user.userId,
						productId,
						quantity,
						expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
					})
					.returning()

				res.status(201).json({
					success: true,
					data: newItem,
					message: "Item added to cart",
				})
			}

			// Update reserved quantity
			await db
				.update(products)
				.set({
					reservedQuantity: product.reservedQuantity + quantity,
				})
				.where(eq(products.id, productId))
		} catch (error: any) {
			console.error("Add to cart error:", error)
			res
				.status(500)
				.json({ success: false, error: "Failed to add item to cart" })
		}
	}
)

// PUT /api/cart/:id - Update cart item quantity
router.put(
	"/:id",
	validateRequest(updateCartItemSchema),
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.user || req.user.userId < 0) {
				res
					.status(401)
					.json({ success: false, error: "Authentication required" })
				return
			}

			const cartItemId = parseInt(req.params.id as string)
			const { quantity } = req.body

			// Get cart item
			const [cartItem] = await db
				.select()
				.from(cartReservations)
				.where(
					and(
						eq(cartReservations.id, cartItemId),
						eq(cartReservations.userId, req.user.userId)
					)
				)
				.limit(1)

			if (!cartItem) {
				res.status(404).json({ success: false, error: "Cart item not found" })
				return
			}

			// Remove item if quantity is 0
			if (quantity === 0) {
				await db
					.delete(cartReservations)
					.where(eq(cartReservations.id, cartItemId))

				// Release reserved stock
				await db
					.update(products)
					.set({
						reservedQuantity: sql`MAX(0, ${products.reservedQuantity} - ${cartItem.quantity})`,
					})
					.where(eq(products.id, cartItem.productId))

				res.json({
					success: true,
					message: "Item removed from cart",
				})
				return
			}

			// Check stock availability
			const [product] = await db
				.select()
				.from(products)
				.where(eq(products.id, cartItem.productId))
				.limit(1)

			if (!product) {
				res.status(404).json({ success: false, error: "Product not found" })
				return
			}

			const availableStock =
				product.stockQuantity - product.reservedQuantity + cartItem.quantity

			if (availableStock < quantity) {
				res.status(400).json({
					success: false,
					error: `Insufficient stock. Only ${availableStock} items available.`,
				})
				return
			}

			// Update cart item
			const [updated] = await db
				.update(cartReservations)
				.set({
					quantity,
					expiresAt: new Date(Date.now() + 30 * 60 * 1000),
				})
				.where(eq(cartReservations.id, cartItemId))
				.returning()

			// Update reserved quantity
			const quantityDiff = quantity - cartItem.quantity
			await db
				.update(products)
				.set({
					reservedQuantity: Math.max(
						0,
						product.reservedQuantity + quantityDiff
					),
				})
				.where(eq(products.id, cartItem.productId))

			res.json({
				success: true,
				data: updated,
			})
		} catch (error: any) {
			console.error("Update cart error:", error)
			res.status(500).json({ success: false, error: "Failed to update cart" })
		}
	}
)

// DELETE /api/cart/:id - Remove item from cart
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user || req.user.userId < 0) {
			res.status(401).json({ success: false, error: "Authentication required" })
			return
		}

		const cartItemId = parseInt(req.params.id as string)

		const [cartItem] = await db
			.select()
			.from(cartReservations)
			.where(
				and(
					eq(cartReservations.id, cartItemId),
					eq(cartReservations.userId, req.user.userId)
				)
			)
			.limit(1)

		if (!cartItem) {
			res.status(404).json({ success: false, error: "Cart item not found" })
			return
		}

		await db.delete(cartReservations).where(eq(cartReservations.id, cartItemId))

		// Release reserved stock
		await db
			.update(products)
			.set({
				reservedQuantity: sql`MAX(0, ${products.reservedQuantity} - ${cartItem.quantity})`,
			})
			.where(eq(products.id, cartItem.productId))

		res.json({
			success: true,
			message: "Item removed from cart",
		})
	} catch (error: any) {
		console.error("Remove from cart error:", error)
		res
			.status(500)
			.json({ success: false, error: "Failed to remove item from cart" })
	}
})

// DELETE /api/cart - Clear entire cart
router.delete("/", async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user || req.user.userId < 0) {
			res.status(401).json({ success: false, error: "Authentication required" })
			return
		}

		// Get all cart items to release reserved stock
		const cartItems = await db
			.select()
			.from(cartReservations)
			.where(eq(cartReservations.userId, req.user.userId))

		// Release reserved stock for each item
		for (const item of cartItems) {
			await db
				.update(products)
				.set({
					reservedQuantity: sql`MAX(0, ${products.reservedQuantity} - ${item.quantity})`,
				})
				.where(eq(products.id, item.productId))
		}

		// Delete all cart items
		await db
			.delete(cartReservations)
			.where(eq(cartReservations.userId, req.user.userId))

		res.json({
			success: true,
			message: "Cart cleared successfully",
		})
	} catch (error: any) {
		console.error("Clear cart error:", error)
		res.status(500).json({ success: false, error: "Failed to clear cart" })
	}
})

export default router
