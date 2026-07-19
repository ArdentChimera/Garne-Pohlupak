import {
	pgTable,
	serial,
	varchar,
	integer,
	timestamp,
	uniqueIndex,
	text,
} from "drizzle-orm/pg-core"

export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		email: varchar("email", { length: 255 }).notNull().unique(),
		password: varchar("password", { length: 255 }), // Null for OAuth-only users
		googleId: varchar("google_id", { length: 255 }),
		firstName: varchar("first_name", { length: 100 }),
		lastName: varchar("last_name", { length: 100 }),
		role: varchar("role", { enum: ["customer", "admin", "guest"] })
			.default("customer")
			.notNull(),
		isActive: integer("is_active").default(1).notNull(), // 1 = active, 0 = deactivated
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		emailIdx: uniqueIndex("email_idx").on(table.email),
		googleIdIdx: uniqueIndex("google_id_idx").on(table.googleId),
	})
)

export const products = pgTable(
	"products",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		price: integer("price").notNull(), // Store in cents (e.g., $10.00 = 1000)
		imageUrl: varchar("image_url", { length: 500 }),
		stockQuantity: integer("stock_quantity").notNull().default(0),
		reservedQuantity: integer("reserved_quantity").notNull().default(0),
		categoryId: integer("category_id"),
		isActive: integer("is_active").default(1).notNull(), // 1 = active (visible), 0 = hidden
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		nameIdx: uniqueIndex("product_name_idx").on(table.name),
		categoryIdx: uniqueIndex("product_category_idx").on(table.categoryId),
	})
)

export const productSpecs = pgTable("product_specs", {
	id: serial("id").primaryKey(),
	productId: integer("product_id")
		.references(() => products.id)
		.notNull(),
	key: varchar("key", { length: 100 }).notNull(), // e.g., 'color'
	value: varchar("value", { length: 100 }).notNull(), // e.g., 'red'
})

export const orders = pgTable("orders", {
	id: serial("id").primaryKey(),
	userId: integer("user_id").references(() => users.id), // Null for guest orders
	guestEmail: varchar("guest_email", { length: 255 }),
	status: varchar("status", {
		enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
	})
		.default("pending")
		.notNull(),
	totalAmount: integer("total_amount").notNull(), // In cents
	shippingAddress: text("shipping_address"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
})

export const orderItems = pgTable("order_items", {
	id: serial("id").primaryKey(),
	orderId: integer("order_id")
		.references(() => orders.id)
		.notNull(),
	productId: integer("product_id")
		.references(() => products.id)
		.notNull(),
	quantity: integer("quantity").notNull(),
	priceAtPurchase: integer("price_at_purchase").notNull(), // Store price at time of order
})

export const cartReservations = pgTable("cart_reservations", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id)
		.notNull(),
	productId: integer("product_id")
		.references(() => products.id)
		.notNull(),
	quantity: integer("quantity").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
})
