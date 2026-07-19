"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// GET /api/products - List all active products with pagination and filters
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : undefined;
        const categoryId = req.query.categoryId
            ? parseInt(req.query.categoryId)
            : undefined;
        const offset = (page - 1) * limit;
        // Build query conditions
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.products.isActive, 1)];
        if (search) {
            conditions.push((0, drizzle_orm_1.ilike)(schema_1.products.name, `%${search}%`));
        }
        if (minPrice !== undefined) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.products.price, minPrice));
        }
        if (maxPrice !== undefined) {
            conditions.push((0, drizzle_orm_1.lte)(schema_1.products.price, maxPrice));
        }
        if (categoryId !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.products.categoryId, categoryId));
        }
        // Fetch products
        const productsList = await index_1.db
            .select({
            id: schema_1.products.id,
            name: schema_1.products.name,
            description: schema_1.products.description,
            price: schema_1.products.price,
            imageUrl: schema_1.products.imageUrl,
            stockQuantity: schema_1.products.stockQuantity,
            categoryId: schema_1.products.categoryId,
        })
            .from(schema_1.products)
            .where((0, drizzle_orm_1.and)(...conditions))
            .limit(limit)
            .offset(offset);
        // Count total products for pagination
        const [{ count }] = await index_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.products)
            .where((0, drizzle_orm_1.and)(...conditions));
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
        });
    }
    catch (error) {
        console.error("List products error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch products" });
    }
});
// GET /api/products/:id - Get single product details with specs
router.get("/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const [product] = await index_1.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.id, productId), (0, drizzle_orm_1.eq)(schema_1.products.isActive, 1)))
            .limit(1);
        if (!product) {
            res.status(404).json({ success: false, error: "Product not found" });
            return;
        }
        // Fetch product specs
        const specs = await index_1.db
            .select({
            key: schema_1.productSpecs.key,
            value: schema_1.productSpecs.value,
        })
            .from(schema_1.productSpecs)
            .where((0, drizzle_orm_1.eq)(schema_1.productSpecs.productId, productId));
        res.json({
            success: true,
            data: {
                ...product,
                specs,
            },
        });
    }
    catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch product" });
    }
});
exports.default = router;
