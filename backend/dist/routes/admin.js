"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// All routes require admin authentication
router.use(auth_1.authenticate, (0, auth_1.requireRole)("admin"));
// Validation schemas
const createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Product name is required"),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().int().positive("Price must be a positive integer (in cents)"),
    imageUrl: zod_1.z.string().url().optional().nullable(),
    stockQuantity: zod_1.z.number().int().nonnegative().default(0),
    categoryId: zod_1.z.number().int().optional().nullable(),
});
const updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    price: zod_1.z.number().int().positive().optional(),
    imageUrl: zod_1.z.string().url().optional().nullable(),
    stockQuantity: zod_1.z.number().int().nonnegative().optional(),
    categoryId: zod_1.z.number().int().optional().nullable(),
    isActive: zod_1.z.number().int().min(0).max(1).optional(),
});
const updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
});
// ============= PRODUCT MANAGEMENT =============
// GET /api/admin/products - List all products (including inactive)
router.get("/products", async (req, res) => {
    try {
        const allProducts = await index_1.db.select().from(schema_1.products).orderBy((0, drizzle_orm_1.desc)(schema_1.products.createdAt));
        res.json({
            success: true,
            data: allProducts,
        });
    }
    catch (error) {
        console.error("Admin list products error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch products" });
    }
});
// GET /api/admin/products/:id - Get single product
router.get("/products/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const [product] = await index_1.db.select().from(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, productId)).limit(1);
        if (!product) {
            res.status(404).json({ success: false, error: "Product not found" });
            return;
        }
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error("Admin get product error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch product" });
    }
});
// POST /api/admin/products - Create new product
router.post("/products", (0, validate_1.validateRequest)(createProductSchema), async (req, res) => {
    try {
        const { name, description, price, imageUrl, stockQuantity, categoryId } = req.body;
        const [newProduct] = await index_1.db
            .insert(schema_1.products)
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
            .returning();
        res.status(201).json({
            success: true,
            data: newProduct,
        });
    }
    catch (error) {
        console.error("Admin create product error:", error);
        res.status(500).json({ success: false, error: "Failed to create product" });
    }
});
// PUT /api/admin/products/:id - Update product
router.put("/products/:id", (0, validate_1.validateRequest)(updateProductSchema), async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const [updatedProduct] = await index_1.db
            .update(schema_1.products)
            .set({ ...req.body, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId))
            .returning();
        if (!updatedProduct) {
            res.status(404).json({ success: false, error: "Product not found" });
            return;
        }
        res.json({
            success: true,
            data: updatedProduct,
        });
    }
    catch (error) {
        console.error("Admin update product error:", error);
        res.status(500).json({ success: false, error: "Failed to update product" });
    }
});
// DELETE /api/admin/products/:id - Soft delete product (set isActive = 0)
router.delete("/products/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const [deletedProduct] = await index_1.db
            .update(schema_1.products)
            .set({ isActive: 0, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId))
            .returning();
        if (!deletedProduct) {
            res.status(404).json({ success: false, error: "Product not found" });
            return;
        }
        res.json({
            success: true,
            message: "Product deactivated successfully",
        });
    }
    catch (error) {
        console.error("Admin delete product error:", error);
        res.status(500).json({ success: false, error: "Failed to delete product" });
    }
});
// ============= ORDER MANAGEMENT =============
// GET /api/admin/orders - List all orders
router.get("/orders", async (req, res) => {
    try {
        const allOrders = await index_1.db.select().from(schema_1.orders).orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
        res.json({
            success: true,
            data: allOrders,
        });
    }
    catch (error) {
        console.error("Admin list orders error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch orders" });
    }
});
// GET /api/admin/orders/:id - Get single order with items
router.get("/orders/:id", async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const [order] = await index_1.db.select().from(schema_1.orders).where((0, drizzle_orm_1.eq)(schema_1.orders.id, orderId)).limit(1);
        if (!order) {
            res.status(404).json({ success: false, error: "Order not found" });
            return;
        }
        const items = await index_1.db
            .select({
            id: schema_1.orderItems.id,
            quantity: schema_1.orderItems.quantity,
            priceAtPurchase: schema_1.orderItems.priceAtPurchase,
            productId: schema_1.orderItems.productId,
            productName: schema_1.products.name,
            productImage: schema_1.products.imageUrl,
        })
            .from(schema_1.orderItems)
            .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.orderItems.productId, schema_1.products.id))
            .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, orderId));
        res.json({
            success: true,
            data: {
                ...order,
                items,
            },
        });
    }
    catch (error) {
        console.error("Admin get order error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch order" });
    }
});
// PATCH /api/admin/orders/:id/status - Update order status
router.patch("/orders/:id/status", (0, validate_1.validateRequest)(updateOrderStatusSchema), async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        const [updatedOrder] = await index_1.db
            .update(schema_1.orders)
            .set({ status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.orders.id, orderId))
            .returning();
        if (!updatedOrder) {
            res.status(404).json({ success: false, error: "Order not found" });
            return;
        }
        res.json({
            success: true,
            data: updatedOrder,
        });
    }
    catch (error) {
        console.error("Admin update order status error:", error);
        res.status(500).json({ success: false, error: "Failed to update order status" });
    }
});
// ============= USER MANAGEMENT =============
// GET /api/admin/users - List all users
router.get("/users", async (req, res) => {
    try {
        const allUsers = await index_1.db
            .select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            firstName: schema_1.users.firstName,
            lastName: schema_1.users.lastName,
            role: schema_1.users.role,
            isActive: schema_1.users.isActive,
            createdAt: schema_1.users.createdAt,
        })
            .from(schema_1.users)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.users.createdAt));
        res.json({
            success: true,
            data: allUsers,
        });
    }
    catch (error) {
        console.error("Admin list users error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
});
exports.default = router;
