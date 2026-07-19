import { Router, Request, Response } from "express"
import { db } from "../db/index"
import { orders, orderItems, cartReservations, products } from "../db/schema"
import { eq, and } from "drizzle-orm"
import { optionalAuth, authenticate } from "../middleware/auth"
import { validateRequest } from "../middleware/validate"
import { z } from "zod"

const router = Router()

// Validation schemas
const createOrderSchema = z.object({
	shippingAddress: z
		.string()
		.min(10, "Shipping address must be at least 10 characters"),
	guestEmail: z.string().email().optional(), // Required for guest orders
})

// POST /api/orders - Create order from cart
router.post(
	"/",
	optionalAuth,
	validateRequest(createOrderSchema),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { shippingAddress, guestEmail } = req.body

			// For guests, require email
			if ((!req.user || req.user.role === "guest") && !guestEmail) {
				res.status(400).json({
					success: false,
					error: "Email is required for guest orders",
				})
				return
			}

			const userId = req.user && req.user.userId > 0 ? req.user.userId : null

			// Get cart items
			let cartItems
			if (userId) {
				cartItems = await db
					.select({
						cartId: cartReservations.id,
						productId: cartReservations.productId,
						quantity: cartReservations.quantity,
						price: products.price,
						availableStock: products.stockQuantity,
						reservedQuantity: products.reservedQuantity,
					})
					.from(cartReservations)
					.leftJoin(products, eq(cartReservations.productId, products.id))
					.where(eq(cartReservations.userId, userId))
			} else {
				cartItems = []
			}

			if (!cartItems || cartItems.length === 0) {
				res.status(400).json({ success: false, error: "Cart is empty" })
				return
			}

			// Verify stock availability
			for (const item of cartItems) {
				if (item.availableStock! < item.quantity) {
					res.status(400).json({
						success: false,
						error: `Insufficient stock for product ID ${item.productId}`,
					})
					return
				}
			}

			// Calculate total
			const totalAmount = cartItems.reduce(
				(sum, item) => sum + item.price! * item.quantity,
				0
			)

			// Start transaction: Create order
			const [newOrder] = await db
				.insert(orders)
				.values({
					userId,
					guestEmail: guestEmail || null,
					status: "pending",
					totalAmount,
					shippingAddress,
				})
				.returning()

			// Create order items and update stock
			for (const item of cartItems) {
				// Insert order item
				await db.insert(orderItems).values({
					orderId: newOrder.id,
					productId: item.productId,
					quantity: item.quantity,
					priceAtPurchase: item.price!,
				})

				// Update product stock (remove from stock and reserved)
				await db
					.update(products)
					.set({
						stockQuantity: item.availableStock! - item.quantity,
						reservedQuantity: Math.max(
							0,
							item.reservedQuantity! - item.quantity
						),
					})
					.where(eq(products.id, item.productId))
			}

			// Clear cart
			if (userId) {
				await db
					.delete(cartReservations)
					.where(eq(cartReservations.userId, userId))
			}

			res.status(201).json({
				success: true,
				data: newOrder,
				message: "Order created successfully",
			})
		} catch (error: any) {
			console.error("Create order error:", error)
			res.status(500).json({ success: false, error: "Failed to create order" })
		}
	}
)

// GET /api/orders - Get user's orders (authenticated users only)
router.get(
	"/",
	authenticate,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const userOrders = await db
				.select()
				.from(orders)
				.where(eq(orders.userId, req.user!.userId))
				.orderBy(orders.createdAt)

			res.json({
				success: true,
				data: userOrders,
			})
		} catch (error: any) {
			console.error("Get orders error:", error)
			res.status(500).json({ success: false, error: "Failed to fetch orders" })
		}
	}
)

// GET /api/orders/:id - Get single order details
router.get(
	"/:id",
	authenticate,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const orderId = parseInt(req.params.id as string)

			const [order] = await db
				.select()
				.from(orders)
				.where(and(eq(orders.id, orderId), eq(orders.userId, req.user!.userId)))
				.limit(1)

			if (!order) {
				res.status(404).json({ success: false, error: "Order not found" })
				return
			}

			// Get order items
			const items = await db
				.select({
					id: orderItems.id,
					productId: orderItems.productId,
					quantity: orderItems.quantity,
					priceAtPurchase: orderItems.priceAtPurchase,
					productName: products.name,
					productImage: products.imageUrl,
				})
				.from(orderItems)
				.leftJoin(products, eq(orderItems.productId, products.id))
				.where(eq(orderItems.orderId, orderId))

			res.json({
				success: true,
				data: {
					...order,
					items,
				},
			})
		} catch (error: any) {
			console.error("Get order error:", error)
			res.status(500).json({ success: false, error: "Failed to fetch order" })
		}
	}
)

export default router
