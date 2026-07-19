"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const startCronJobs = () => {
    node_cron_1.default.schedule("* * * * *", async () => {
        // Runs every minute
        console.log("Running cart cleanup...");
        const now = new Date();
        // Find expired reservations
        const expired = await db_1.db
            .select()
            .from(schema_1.cartReservations)
            .where((0, drizzle_orm_1.lt)(schema_1.cartReservations.expiresAt, now));
        for (const res of expired) {
            await db_1.db.transaction(async (tx) => {
                // Decrement reserved stock
                await tx
                    .update(schema_1.products)
                    .set({
                    reservedQuantity: (0, drizzle_orm_1.sql) `${schema_1.products.reservedQuantity} - ${res.quantity}`,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.products.id, res.productId));
                // Delete reservation
                await tx.delete(schema_1.cartReservations).where((0, drizzle_orm_1.eq)(schema_1.cartReservations.id, res.id));
            });
        }
    });
};
exports.startCronJobs = startCronJobs;
