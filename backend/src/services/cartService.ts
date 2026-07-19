import { db } from "../db"
import { products, cartReservations } from "../db/schema"
import { eq, sql } from "drizzle-orm"
import { io } from "../server"

export const reserveItem = async (
	userId: number,
	productId: number,
	quantity: number
) => {
	return await db.transaction(async tx => {
		// 1. Fetch product with row-level lock (if supported/needed, or rely on atomic updates)
		const [product] = await tx
			.select()
			.from(products)
			.where(eq(products.id, productId))

		if (!product) throw new Error("Product not found")

		const availableStock = product.stockQuantity - product.reservedQuantity
		if (availableStock < quantity) throw new Error("Insufficient stock")

		// 2. Update reserved quantity
		await tx
			.update(products)
			.set({ reservedQuantity: product.reservedQuantity + quantity })
			.where(eq(products.id, productId))

		// 3. Create Reservation (Expires in 15 mins)
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
		await tx.insert(cartReservations).values({
			userId,
			productId,
			quantity,
			expiresAt,
		})

		// 4. Emit WebSocket event to update all connected frontends
		io.emit("stock_updated", {
			productId,
			available: availableStock - quantity,
		})

		return { success: true, message: "Item reserved" }
	})
}
