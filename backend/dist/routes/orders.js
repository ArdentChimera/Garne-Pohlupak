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
// Validation schemas
const createOrderSchema = zod_1.z.object({
    shippingAddress: zod_1.z.string().min(10, "Shipping address must be at least 10 characters"),
    guestEmail: zod_1.z.string().email().optional(), // Required for guest orders
});
// POST /api/orders - Create order from cart
router.post("/", auth_1.optionalAuth, (0, validate_1.validateRequest)(createOrderSchema), async (req, res) => {
    try {
        const { shippingAddress, guestEmail } = req.body;
        // For guests, require email
        if ((!req.user || req.user.role === "guest") && !guestEmail) {
            res.status(400).json({
                success: false,
                error: "Email is required for guest orders",
            });
            return;
        }
        const userId = req.user && req.user.userId > 0 ? req.user.userId : null;
        // Get cart items
        let cartItems;
        if (userId) {
            cartItems = await index_1.db
                .select({
                cartId: schema_1.cartReservations.id,
                productId: schema_1.cartReservations.productId,
                quantity: schema_1.cartReservations.quantity,
                price: schema_1.products.price,
                availableStock: schema_1.products.stockQuantity,
                reservedQuantity: schema_1.products.reservedQuantity,
            })
                .from(schema_1.cartReservations)
                .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.cartReservations.productId, schema_1.products.id))
                .where((0, drizzle_orm_1.eq)(schema_1.cartReservations.userId, userId));
        }
        else {
            cartItems = [];
        }
        if (!cartItems || cartItems.length === 0) {
            res.status(400).json({ success: false, error: "Cart is empty" });
            return;
        }
        // Verify stock availability
        for (const item of cartItems) {
            if (item.availableStock < item.quantity) {
                res.status(400).json({
                    success: false,
                    error: `Insufficient stock for product ID ${item.productId}`,
                });
                return;
            }
        }
        // Calculate total
        const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        // Start transaction: Create order
        const [newOrder] = await index_1.db
            .insert(schema_1.orders)
            .values({
            userId,
            guestEmail: guestEmail || null,
            status: "pending",
            totalAmount,
            shippingAddress,
        })
            .returning();
        // Create order items and update stock
        for (const item of cartItems) {
            // Insert order item
            await index_1.db.insert(schema_1.orderItems).values({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.price,
            });
            // Update product stock (remove from stock and reserved)
            await index_1.db
                .update(schema_1.products)
                .set({
                stockQuantity: item.availableStock - item.quantity,
                reservedQuantity: Math.max(0, item.reservedQuantity - item.quantity),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.products.id, item.productId));
        }
        // Clear cart
        if (userId) {
            await index_1.db.delete(schema_1.cartReservations).where((0, drizzle_orm_1.eq)(schema_1.cartReservations.userId, userId));
        }
        res.status(201).json({
            success: true,
            data: newOrder,
            message: "Order created successfully",
        });
    }
    catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ success: false, error: "Failed to create order" });
    }
});
// GET /api/orders - Get user's orders (authenticated users only)
router.get("/", auth_1.authenticate, async (req, res) => {
    try {
        const userOrders = await index_1.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.userId, req.user.userId))
            .orderBy(schema_1.orders.createdAt);
        res.json({
            success: true,
            data: userOrders,
        });
    }
    catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch orders" });
    }
});
// GET /api/orders/:id - Get single order details
router.get("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const [order] = await index_1.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.orders.id, orderId), (0, drizzle_orm_1.eq)(schema_1.orders.userId, req.user.userId)))
            .limit(1);
        if (!order) {
            res.status(404).json({ success: false, error: "Order not found" });
            return;
        }
        // Get order items
        const items = await index_1.db
            .select({
            id: schema_1.orderItems.id,
            productId: schema_1.orderItems.productId,
            quantity: schema_1.orderItems.quantity,
            priceAtPurchase: schema_1.orderItems.priceAtPurchase,
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
        console.error("Get order error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch order" });
    }
});
exports.default = router;
