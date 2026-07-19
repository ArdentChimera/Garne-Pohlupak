"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveItem = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const server_1 = require("../server");
const reserveItem = async (userId, productId, quantity) => {
    return await db_1.db.transaction(async (tx) => {
        // 1. Fetch product with row-level lock (if supported/needed, or rely on atomic updates)
        const [product] = await tx
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
        if (!product)
            throw new Error("Product not found");
        const availableStock = product.stockQuantity - product.reservedQuantity;
        if (availableStock < quantity)
            throw new Error("Insufficient stock");
        // 2. Update reserved quantity
        await tx
            .update(schema_1.products)
            .set({ reservedQuantity: product.reservedQuantity + quantity })
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
        // 3. Create Reservation (Expires in 15 mins)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await tx.insert(schema_1.cartReservations).values({
            userId,
            productId,
            quantity,
            expiresAt,
        });
        // 4. Emit WebSocket event to update all connected frontends
        server_1.io.emit("stock_updated", {
            productId,
            available: availableStock - quantity,
        });
        return { success: true, message: "Item reserved" };
    });
};
exports.reserveItem = reserveItem;
