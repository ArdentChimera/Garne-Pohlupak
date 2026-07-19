import cron from "node-cron"
import { db } from "../db"
import { cartReservations, products } from "../db/schema"
import { eq, lt, sql } from "drizzle-orm"

export const startCronJobs = () => {
	cron.schedule("* * * * *", async () => {
		// Runs every minute
		console.log("Running cart cleanup...")
		const now = new Date()

		// Find expired reservations
		const expired = await db
			.select()
			.from(cartReservations)
			.where(lt(cartReservations.expiresAt, now))

		for (const res of expired) {
			await db.transaction(async tx => {
				// Decrement reserved stock
				await tx
					.update(products)
					.set({
						reservedQuantity: sql`${products.reservedQuantity} - ${res.quantity}`,
					})
					.where(eq(products.id, res.productId))

				// Delete reservation
				await tx.delete(cartReservations).where(eq(cartReservations.id, res.id))
			})
		}
	})
}
