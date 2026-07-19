import { Router, Request, Response } from "express"
import { db } from "../db/index"
import { products, productSpecs } from "../db/schema"
import { eq, and, ilike, gte, lte, sql } from "drizzle-orm"

const router = Router()

// GET /api/products - List all active products with pagination and filters
router.get("/", async (req: Request, res: Response): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string) || 1
		const limit = parseInt(req.query.limit as string) || 20
		const search = req.query.search as string
		const minPrice = req.query.minPrice
			? parseInt(req.query.minPrice as string)
			: undefined
		const maxPrice = req.query.maxPrice
			? parseInt(req.query.maxPrice as string)
			: undefined
		const categoryId = req.query.categoryId
			? parseInt(req.query.categoryId as string)
			: undefined

		const offset = (page - 1) * limit

		// Build query conditions
		const conditions = [eq(products.isActive, 1)]

		if (search) {
			conditions.push(ilike(products.name, `%${search}%`))
		}

		if (minPrice !== undefined) {
			conditions.push(gte(products.price, minPrice))
		}

		if (maxPrice !== undefined) {
			conditions.push(lte(products.price, maxPrice))
		}

		if (categoryId !== undefined) {
			conditions.push(eq(products.categoryId, categoryId))
		}

		// Fetch products
		const productsList = await db
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
				price: products.price,
				imageUrl: products.imageUrl,
				stockQuantity: products.stockQuantity,
				categoryId: products.categoryId,
			})
			.from(products)
			.where(and(...conditions))
			.limit(limit)
			.offset(offset)

		// Count total products for pagination
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(products)
			.where(and(...conditions))

		res.json({
			success: true,
			data: {
				products: productsList,
				pagination: {
					page,
					limit,
					total: Number(count),
					totalPages: Math.ceil(Number(count) / limit),
				},
			},
		})
	} catch (error: any) {
		console.error("List products error:", error)
		res.status(500).json({ success: false, error: "Failed to fetch products" })
	}
})

// GET /api/products/:id - Get single product details with specs
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
	try {
		const productId = parseInt(req.params.id as string)

		const [product] = await db
			.select()
			.from(products)
			.where(and(eq(products.id, productId), eq(products.isActive, 1)))
			.limit(1)

		if (!product) {
			res.status(404).json({ success: false, error: "Product not found" })
			return
		}

		// Fetch product specs
		const specs = await db
			.select({
				key: productSpecs.key,
				value: productSpecs.value,
			})
			.from(productSpecs)
			.where(eq(productSpecs.productId, productId))

		res.json({
			success: true,
			data: {
				...product,
				specs,
			},
		})
	} catch (error: any) {
		console.error("Get product error:", error)
		res.status(500).json({ success: false, error: "Failed to fetch product" })
	}
})

export default router
