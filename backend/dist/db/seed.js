"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const schema_1 = require("./schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
require("dotenv/config");
async function seed() {
    console.log("🌱 Seeding database...");
    try {
        // Check if admin user exists
        const existingAdmin = await index_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, "admin@garne-pohlupak.com"))
            .limit(1);
        if (existingAdmin.length === 0) {
            const hashedPassword = await bcrypt_1.default.hash("admin123", 10);
            const [admin] = await index_1.db
                .insert(schema_1.users)
                .values({
                email: "admin@garne-pohlupak.com",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "User",
                role: "admin",
                isActive: 1,
            })
                .returning();
            console.log("✓ Admin user created:", admin.email);
        }
        else {
            console.log("ℹ Admin user already exists, skipping...");
        }
        // Delete existing products
        console.log("🗑️  Deleting existing products...");
        await index_1.db.delete(schema_1.products);
        console.log("✓ Existing products deleted");
        // Create sample products - Traditional Bulgarian Clay Pots
        const sampleProducts = [
            {
                name: "Традиционно гърне 5л",
                description: "Ръчно изработено глинено гърне с капацитет 5 литра. Идеално за приготвяне на традиционни ястия като яхния, варено, гювеч. Запазва аромата и вкуса на храната.",
                price: 4500, // 45.00 лв
                imageUrl: "https://placehold.co/400x400/8B4513/FFF?text=Pot+5L",
                stockQuantity: 25,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Паничка за лечо 3л",
                description: "Традиционна глинена паничка за приготвяне на лечо, луканка и други консерви. Изработена от висококачествена червена глина по стар занаятчийски метод.",
                price: 3850, // 38.50 лв
                imageUrl: "https://placehold.co/400x400/A0522D/FFF?text=Pan+3L",
                stockQuantity: 30,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Гърне за варене 7л",
                description: "Голямо глинено гърне за варене на супи, чорби и яхнии. Дебели стени за равномерно разпределение на топлината. Подходящо за фурна и котлони.",
                price: 6500, // 65.00 лв
                imageUrl: "https://placehold.co/400x400/8B4513/FFF?text=Pot+7L",
                stockQuantity: 15,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Гювеч класически",
                description: "Автентичен български гювеч за печене в пещ. Перфектен за гювеч със зеленчуци, капама, гърненце. Всеки гювеч е уникален и ръчно изработен.",
                price: 2800, // 28.00 лв
                imageUrl: "https://placehold.co/400x400/CD853F/FFF?text=Gyuvech",
                stockQuantity: 40,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Делва за боб 4л",
                description: "Традиционна делва за варене на боб, леща, грах. Глинената съд придава неповторим вкус и аромат на бобените ястия. Използва се от поколения.",
                price: 4200, // 42.00 лв
                imageUrl: "https://placehold.co/400x400/A0522D/FFF?text=Bowl+4L",
                stockQuantity: 20,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Комплект гърнета 3бр",
                description: "Комплект от 3 гърнета (2л, 3л, 5л) за всекидневна употреба. Икономична оферта за вашата кухня. Всички гърнета са ръчно изработени и покрити с естествена глазура.",
                price: 12500, // 125.00 лв
                imageUrl: "https://placehold.co/400x400/8B4513/FFF?text=Set+3pcs",
                stockQuantity: 10,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Малко гърне 1л",
                description: "Компактно гърне за едно или две порции. Идеално за приготвяне на плакия, задушени зеленчуци, гъби. Удобно за съхранение.",
                price: 2500, // 25.00 лв
                imageUrl: "https://placehold.co/400x400/CD853F/FFF?text=Pot+1L",
                stockQuantity: 35,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Тенджера 6л",
                description: "Голяма глинена тенджера за семейни празници и големи готвачки. Подходяща за сватби, кръщенета и традиционни празници.",
                price: 5800, // 58.00 лв
                imageUrl: "https://placehold.co/400x400/A0522D/FFF?text=Pot+6L",
                stockQuantity: 12,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Керамична паничка 2л",
                description: "Малка паничка за приготвяне на лютеница, кисело мляко, мармалад. Компактна и практична за всяка кухня.",
                price: 3200, // 32.00 лв
                imageUrl: "https://placehold.co/400x400/CD853F/FFF?text=Pan+2L",
                stockQuantity: 28,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Голяма делва 8л",
                description: "Голяма делва за варене на боб и леща за цялото семейство. Масивна и здрава, изработена по традиционен метод от Троянски майстори.",
                price: 7500, // 75.00 лв
                imageUrl: "https://placehold.co/400x400/8B4513/FFF?text=Bowl+8L",
                stockQuantity: 8,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Комплект чинии 6бр",
                description: "Комплект от 6 традиционни глинени чинии с ръчно рисувани мотиви. Диаметър 24см. Подходящи за сервиране на салати, предястия и десерти.",
                price: 5500, // 55.00 лв
                imageUrl: "https://placehold.co/400x400/CD853F/FFF?text=Plates+6pcs",
                stockQuantity: 18,
                reservedQuantity: 0,
                isActive: 1,
            },
            {
                name: "Чаши за ракия 6бр",
                description: "Комплект от 6 ръчно изработени глинени чашки за ракия и бяло вино. Украсени с традиционни български шевици и мотиви.",
                price: 2800, // 28.00 лв
                imageUrl: "https://placehold.co/400x400/A0522D/FFF?text=Cups+6pcs",
                stockQuantity: 22,
                reservedQuantity: 0,
                isActive: 1,
            },
        ];
        const insertedProducts = await index_1.db.insert(schema_1.products).values(sampleProducts).returning();
        console.log(`✓ ${insertedProducts.length} sample products created`);
        console.log("\n✅ Database seeded successfully!");
        console.log("\n📋 Admin Credentials:");
        console.log("   Email: admin@garne-pohlupak.com");
        console.log("   Password: admin123");
        console.log("\n💡 Please change the admin password after first login!\n");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error seeding database:", error.message);
        process.exit(1);
    }
}
seed();
