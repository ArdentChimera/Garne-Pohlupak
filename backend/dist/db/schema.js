"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartReservations = exports.orderItems = exports.orders = exports.productSpecs = exports.products = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }), // Null for OAuth-only users
    googleId: (0, pg_core_1.varchar)("google_id", { length: 255 }),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 100 }),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 100 }),
    role: (0, pg_core_1.varchar)("role", { enum: ["customer", "admin", "guest"] })
        .default("customer")
        .notNull(),
    isActive: (0, pg_core_1.integer)("is_active").default(1).notNull(), // 1 = active, 0 = deactivated
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    emailIdx: (0, pg_core_1.uniqueIndex)("email_idx").on(table.email),
    googleIdIdx: (0, pg_core_1.uniqueIndex)("google_id_idx").on(table.googleId),
}));
exports.products = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.integer)("price").notNull(), // Store in cents (e.g., $10.00 = 1000)
    imageUrl: (0, pg_core_1.varchar)("image_url", { length: 500 }),
    stockQuantity: (0, pg_core_1.integer)("stock_quantity").notNull().default(0),
    reservedQuantity: (0, pg_core_1.integer)("reserved_quantity").notNull().default(0),
    categoryId: (0, pg_core_1.integer)("category_id"),
    isActive: (0, pg_core_1.integer)("is_active").default(1).notNull(), // 1 = active (visible), 0 = hidden
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    nameIdx: (0, pg_core_1.uniqueIndex)("product_name_idx").on(table.name),
    categoryIdx: (0, pg_core_1.uniqueIndex)("product_category_idx").on(table.categoryId),
}));
exports.productSpecs = (0, pg_core_1.pgTable)("product_specs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    productId: (0, pg_core_1.integer)("product_id")
        .references(() => exports.products.id)
        .notNull(),
    key: (0, pg_core_1.varchar)("key", { length: 100 }).notNull(), // e.g., 'color'
    value: (0, pg_core_1.varchar)("value", { length: 100 }).notNull(), // e.g., 'red'
});
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id), // Null for guest orders
    guestEmail: (0, pg_core_1.varchar)("guest_email", { length: 255 }),
    status: (0, pg_core_1.varchar)("status", {
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    })
        .default("pending")
        .notNull(),
    totalAmount: (0, pg_core_1.integer)("total_amount").notNull(), // In cents
    shippingAddress: (0, pg_core_1.text)("shipping_address"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.orderItems = (0, pg_core_1.pgTable)("order_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    orderId: (0, pg_core_1.integer)("order_id")
        .references(() => exports.orders.id)
        .notNull(),
    productId: (0, pg_core_1.integer)("product_id")
        .references(() => exports.products.id)
        .notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    priceAtPurchase: (0, pg_core_1.integer)("price_at_purchase").notNull(), // Store price at time of order
});
exports.cartReservations = (0, pg_core_1.pgTable)("cart_reservations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id")
        .references(() => exports.users.id)
        .notNull(),
    productId: (0, pg_core_1.integer)("product_id")
        .references(() => exports.products.id)
        .notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
