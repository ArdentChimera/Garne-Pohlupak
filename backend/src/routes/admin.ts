import { Router, Request, Response } from "express"
import { db } from "../db/index"
import { products, orders, orderItems, users } from "../db/schema"
import { eq, desc } from "drizzle-orm"
import { authenticate, requireRole } from "../middleware/auth"
import { validateRequest } from "../middleware/validate"
import { z } from "zod"

const router = Router()

// All routes require admin authentication
router.use(authenticate, requireRole("admin"))

// Validation schemas
const createProductSchema = z.object({
	name: z.string().min(1, "Product name is required"),
	description: z.string().optional(),
	price: z
		.number()
		.int()
		.positive("Price must be a positive integer (in cents)"),
	imageUrl: z.string().url().optional().nullable(),
	stockQuantity: z.number().int().nonnegative().default(0),
	categoryId: z.number().int().optional().nullable(),
})

const updateProductSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional().nullable(),
	price: z.number().int().positive().optional(),
	imageUrl: z.string().url().optional().nullable(),
	stockQuantity: z.number().int().nonnegative().optional(),
	categoryId: z.number().int().optional().nullable(),
	isActive: z.number().int().min(0).max(1).optional(),
})

const updateOrderStatusSchema = z.object({
	status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
})

// ============= PRODUCT MANAGEMENT =============

// GET /api/admin/products - List all products (including inactive)
router.get("/products", async (req: Request, res: Response): Promise<void> => {
	try {
		const allProducts = await db
			.select()
			.from(products)
			.orderBy(desc(products.createdAt))

		res.json({
			success: true,
			data: allProducts,
		})
	} catch (error: any) {
		console.error("Admin list products error:", error)
		res.status(500).json({ success: false, error: "Failed to fetch products" })
	}
})

// GET /api/admin/products/:id - Get single product
router.get(
	"/products/:id",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const productId = parseInt(req.params.id as string)

			const [product] = await db
				.select()
				.from(products)
				.where(eq(products.id, productId))
				.limit(1)

			if (!product) {
				res.status(404).json({ success: false, error: "Product not found" })
				return
			}

			res.json({
				success: true,
				data: product,
			})
		} catch (error: any) {
			console.error("Admin get product error:", error)
			res.status(500).json({ success: false, error: "Failed to fetch product" })
		}
	}
)

// POST /api/admin/products - Create new product
router.post(
	"/products",
	validateRequest(createProductSchema),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { name, description, price, imageUrl, stockQuantity, categoryId } =
				req.body

			const [newProduct] = await db
				.insert(products)
				.values({
					name,
					description,
					price,
					imageUrl,
					stockQuantity: stockQuantity || 0,
					reservedQuantity: 0,
					categoryId,
					isActive: 1,
				})
				.returning()

			res.status(201).json({
				success: true,
				data: newProduct,
			})
		} catch (error: any) {
			console.error("Admin create product error:", error)
			res
				.status(500)
				.json({ success: false, error: "Failed to create product" })
		}
	}
)

// PUT /api/admin/products/:id - Update product
router.put(
	"/products/:id",
	validateRequest(updateProductSchema),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const productId = parseInt(req.params.id as string)

			const [updatedProduct] = await db
				.update(products)
				.set({ ...req.body, updatedAt: new Date() })
				.where(eq(products.id, productId))
				.returning()

			if (!updatedProduct) {
				res.status(404).json({ success: false, error: "Product not found" })
				return
			}

			res.json({
				success: true,
				data: updatedProduct,
			})
		} catch (error: any) {
			console.error("Admin update product error:", error)
			res
				.status(500)
				.json({ success: false, error: "Failed to update product" })
		}
	}
)

// DELETE /api/admin/products/:id - Soft delete product (set isActive = 0)
router.delete(
	"/products/:id",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const productId = parseInt(req.params.id as string)

			const [deletedProduct] = await db
				.update(products)
				.set({ isActive: 0, updatedAt: new Date() })
				.where(eq(products.id, productId))
				.returning()

			if (!deletedProduct) {
				res.status(404).json({ success: false, error: "Product not found" })
				return
			}

			res.json({
				success: true,
				message: "Product deactivated successfully",
			})
		} catch (error: any) {
			console.error("Admin delete product error:", error)
			res
				.status(500)
				.json({ success: false, error: "Failed to delete product" })
		}
	}
)

// ============= ORDER MANAGEMENT =============

// GET /api/admin/orders - List all orders
router.get("/orders", async (req: Request, res: Response): Promise<void> => {
	try {
		const allOrders = await db
			.select()
			.from(orders)
			.orderBy(desc(orders.createdAt))

		res.json({
			success: true,
			data: allOrders,
		})
	} catch (error: any) {
		console.error("Admin list orders error:", error)
		res.status(500).json({ success: false, error: "Failed to fetch orders" })
	}
})

// GET /api/admin/orders/:id - Get single order with items
router.get(
	"/orders/:id",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const orderId = parseInt(req.params.id as string)

			const [order] = await db
				.select()
				.from(orders)
				.where(eq(orders.id, orderId))
				.limit(1)

			if (!order) {
				res.status(404).json({ success: false, error: "Order not found" })
				return
			}

			const items = await db
				.select({
					id: orderItems.id,
					quantity: orderItems.quantity,
					priceAtPurchase: orderItems.priceAtPurchase,
					productId: orderItems.productId,
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
			console.error("Admin get order error:", error)
			res.status(500).json({ success: false, error: "Failed to fetch order" })
		}
	}
)

// PATCH /api/admin/orders/:id/status - Update order status
router.patch(
	"/orders/:id/status",
	validateRequest(updateOrderStatusSchema),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const orderId = parseInt(req.params.id as string)
			const { status } = req.body

			const [updatedOrder] = await db
				.update(orders)
				.set({ status, updatedAt: new Date() })
				.where(eq(orders.id, orderId))
				.returning()

			if (!updatedOrder) {
				res.status(404).json({ success: false, error: "Order not found" })
				return
			}

			res.json({
				success: true,
				data: updatedOrder,
			})
		} catch (error: any) {
			console.error("Admin update order status error:", error)
			res
				.status(500)
				.json({ success: false, error: "Failed to update order status" })
		}
	}
)

// ============= USER MANAGEMENT =============

// GET /api/admin/users - List all users
router.get("/users", async (req: Request, res: Response): Promise<void> => {
	try {
		const allUsers = await db
			.select({
				id: users.id,
				email: users.email,
				firstName: users.firstName,
				lastName: users.lastName,
				role: users.role,
				isActive: users.isActive,
				createdAt: users.createdAt,
			})
			.from(users)
			.orderBy(desc(users.createdAt))

		res.json({
			success: true,
			data: allUsers,
		})
	} catch (error: any) {
		console.error("Admin list users error:", error)
		res.status(500).json({ success: false, error: "Failed to fetch users" })
	}
})

export default router
