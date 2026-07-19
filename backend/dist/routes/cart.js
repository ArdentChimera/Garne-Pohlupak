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
// All cart routes support both authenticated users and guests
router.use(auth_1.optionalAuth);
// Validation schemas
const addToCartSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive(),
    quantity: zod_1.z.number().int().positive(),
});
const updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().nonnegative(), // 0 to remove
});
// GET /api/cart - Get user's cart
router.get("/", async (req, res) => {
    try {
        if (!req.user || req.user.userId < 0) {
            res.json({
                success: true,
                data: { items: [] },
                message: "No cart found for guest user",
            });
            return;
        }
        const cartItems = await index_1.db
            .select({
            id: schema_1.cartReservations.id,
            productId: schema_1.cartReservations.productId,
            quantity: schema_1.cartReservations.quantity,
            expiresAt: schema_1.cartReservations.expiresAt,
            productName: schema_1.products.name,
            productPrice: schema_1.products.price,
            productImage: schema_1.products.imageUrl,
            availableStock: schema_1.products.stockQuantity,
        })
            .from(schema_1.cartReservations)
            .leftJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.cartReservations.productId, schema_1.products.id))
            .where((0, drizzle_orm_1.eq)(schema_1.cartReservations.userId, req.user.userId));
        // Calculate total
        const total = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
        res.json({
            success: true,
            data: {
                items: cartItems,
                total,
            },
        });
    }
    catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch cart" });
    }
});
// POST /api/cart - Add item to cart
router.post("/", (0, validate_1.validateRequest)(addToCartSchema), async (req, res) => {
    try {
        if (!req.user || req.user.userId < 0) {
            res.status(401).json({
                success: false,
                error: "Authentication required. Please login or get a guest token.",
            });
            return;
        }
        const { productId, quantity } = req.body;
        // Check if product exists and has enough stock
        const [product] = await index_1.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.products.id, productId), (0, drizzle_orm_1.eq)(schema_1.products.isActive, 1)))
            .limit(1);
        if (!product) {
            res.status(404).json({ success: false, error: "Product not found" });
            return;
        }
        const availableStock = product.stockQuantity - product.reservedQuantity;
        if (availableStock < quantity) {
            res.status(400).json({
                success: false,
                error: `Insufficient stock. Only ${availableStock} items available.`,
            });
            return;
        }
        // Check if item already in cart
        const [existingItem] = await index_1.db
            .select()
            .from(schema_1.cartReservations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.cartReservations.userId, req.user.userId), (0, drizzle_orm_1.eq)(schema_1.cartReservations.productId, productId)))
            .limit(1);
        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            if (availableStock < newQuantity) {
                res.status(400).json({
                    success: false,
                    error: `Insufficient stock. Only ${availableStock} items available.`,
                });
                return;
            }
            const [updated] = await index_1.db
                .update(schema_1.cartReservations)
                .set({
                quantity: newQuantity,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Extend expiry by 30 minutes
            })
                .where((0, drizzle_orm_1.eq)(schema_1.cartReservations.id, existingItem.id))
                .returning();
            res.json({
                success: true,
                data: updated,
                message: "Cart updated successfully",
            });
        }
        else {
            // Add new cart item
            const [newItem] = await index_1.db
                .insert(schema_1.cartReservations)
                .values({
                userId: req.user.userId,
                productId,
                quantity,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
            })
                .returning();
            res.status(201).json({
                success: true,
                data: newItem,
                message: "Item added to cart",
            });
        }
        // Update reserved quantity
        await index_1.db
            .update(schema_1.products)
            .set({
            reservedQuantity: product.reservedQuantity + quantity,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
    }
    catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ success: false, error: "Failed to add item to cart" });
    }
});
// PUT /api/cart/:id - Update cart item quantity
router.put("/:id", (0, validate_1.validateRequest)(updateCartItemSchema), async (req, res) => {
    try {
        if (!req.user || req.user.userId < 0) {
            res.status(401).json({ success: false, error: "Authentication required" });
            return;
        }
        const cartItemId = parseInt(req.params.id);
        const { quantity } = req.body;
        // Get cart item
        const [cartItem] = await index_1.db
            .select()
            .from(schema_1.cartReservations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.cartReservations.id, cartItemId), (0, drizzle_orm_1.eq)(schema_1.cartReservations.userId, req.user.userId)))
            .limit(1);
        if (!cartItem) {
            res.status(404).json({ success: false, error: "Cart item not found" });
            return;
        }
        // Remove item if quantity is 0
        if (quantity === 0) {
            await index_1.db.delete(schema_1.cartReservations).where((0, drizzle_orm_1.eq)(schema_1.cartReservations.id, cartItemId));
            // Release reserved stock
            await index_1.db
                .update(schema_1.products)
                .set({
                reservedQuantity: Math.max(0, schema_1.products.reservedQuantity - cartItem.quantity),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.products.id, cartItem.productId));
            res.json({
                success: true,
                message: "Item removed from cart",
            });
            return;
        }
        // Check stock availability
        const [product] = await index_1.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, cartItem.productId))
            .limit(1);
        if (!product) {
            res.status(404).json({ success: false, error: "Product not found" });
            return;
        }
        const availableStock = product.stockQuantity - product.reservedQuantity + cartItem.quantity;
        if (availableStock < quantity) {
            res.status(400).json({
                success: false,
                error: `Insufficient stock. Only ${availableStock} items available.`,
            });
            return;
        }
        // Update cart item
        const [updated] = await index_1.db
            .update(schema_1.cartReservations)
            .set({
            quantity,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.cartReservations.id, cartItemId))
            .returning();
        // Update reserved quantity
        const quantityDiff = quantity - cartItem.quantity;
        await index_1.db
            .update(schema_1.products)
            .set({
            reservedQuantity: Math.max(0, product.reservedQuantity + quantityDiff),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, cartItem.productId));
        res.json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({ success: false, error: "Failed to update cart" });
    }
});
// DELETE /api/cart/:id - Remove item from cart
router.delete("/:id", async (req, res) => {
    try {
        if (!req.user || req.user.userId < 0) {
            res.status(401).json({ success: false, error: "Authentication required" });
            return;
        }
        const cartItemId = parseInt(req.params.id);
        const [cartItem] = await index_1.db
            .select()
            .from(schema_1.cartReservations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.cartReservations.id, cartItemId), (0, drizzle_orm_1.eq)(schema_1.cartReservations.userId, req.user.userId)))
            .limit(1);
        if (!cartItem) {
            res.status(404).json({ success: false, error: "Cart item not found" });
            return;
        }
        await index_1.db.delete(schema_1.cartReservations).where((0, drizzle_orm_1.eq)(schema_1.cartReservations.id, cartItemId));
        // Release reserved stock
        await index_1.db
            .update(schema_1.products)
            .set({
            reservedQuantity: Math.max(0, schema_1.products.reservedQuantity - cartItem.quantity),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, cartItem.productId));
        res.json({
            success: true,
            message: "Item removed from cart",
        });
    }
    catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({ success: false, error: "Failed to remove item from cart" });
    }
});
// DELETE /api/cart - Clear entire cart
router.delete("/", async (req, res) => {
    try {
        if (!req.user || req.user.userId < 0) {
            res.status(401).json({ success: false, error: "Authentication required" });
            return;
        }
        // Get all cart items to release reserved stock
        const cartItems = await index_1.db
            .select()
            .from(schema_1.cartReservations)
            .where((0, drizzle_orm_1.eq)(schema_1.cartReservations.userId, req.user.userId));
        // Release reserved stock for each item
        for (const item of cartItems) {
            await index_1.db
                .update(schema_1.products)
                .set({
                reservedQuantity: Math.max(0, schema_1.products.reservedQuantity - item.quantity),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.products.id, item.productId));
        }
        // Delete all cart items
        await index_1.db.delete(schema_1.cartReservations).where((0, drizzle_orm_1.eq)(schema_1.cartReservations.userId, req.user.userId));
        res.json({
            success: true,
            message: "Cart cleared successfully",
        });
    }
    catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({ success: false, error: "Failed to clear cart" });
    }
});
exports.default = router;
