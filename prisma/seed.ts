import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "nishra@email.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "nishra_rustnriches_786";
  const name = process.env.SEED_ADMIN_NAME ?? "Store Admin";

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { name, email, password: hashedPassword },
  });

  console.log(`Seeded admin user: ${admin.email}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`Default password: ${password} (change this after first login)`);
  }

  if (process.env.SEED_DEMO === "true") {
    await seedDemoCatalog();
  }
}

// Optional sample data so a fresh database has something to browse and order.
async function seedDemoCatalog() {
  const demo = [
    {
      category: "Grocery",
      products: [
        { name: "Basmati Rice", price: 320, unit: "kg", stock: 50 },
        { name: "Cooking Oil", price: 540, unit: "litre", stock: 30 },
        { name: "Sugar", price: 140, unit: "kg", stock: 40 },
      ],
    },
    {
      category: "Dairy & Eggs",
      products: [
        { name: "Fresh Milk", price: 220, unit: "litre", stock: 20 },
        { name: "Eggs", price: 360, unit: "dozen", stock: 25 },
        { name: "Yogurt", price: 180, unit: "packet", stock: 3 },
      ],
    },
  ];

  for (const { category, products } of demo) {
    const existing =
      (await prisma.category.findFirst({ where: { name: category } })) ??
      (await prisma.category.create({ data: { name: category } }));

    for (const product of products) {
      const found = await prisma.product.findFirst({ where: { name: product.name } });
      if (!found) {
        await prisma.product.create({ data: { ...product, categoryId: existing.id } });
      }
    }
  }

  console.log("Seeded demo categories and products");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
