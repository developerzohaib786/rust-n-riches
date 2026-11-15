import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { CATALOG } from "./catalog";

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
    await seedCatalog();
  }
}

// Seeds the jewelry catalog from prisma/catalog.ts. Safe to re-run: products that
// already exist (matched by name) are left alone, so dashboard edits are never overwritten.
async function seedCatalog() {
  for (const { category, products } of CATALOG) {
    const existing =
      (await prisma.category.findFirst({ where: { name: category } })) ??
      (await prisma.category.create({ data: { name: category } }));

    for (const { images, ...product } of products) {
      const found = await prisma.product.findFirst({ where: { name: product.name } });
      if (!found) {
        await prisma.product.create({
          data: {
            ...product,
            imageUrl: images[0] ?? null,
            images: images.slice(1),
            categoryId: existing.id,
          },
        });
      }
    }
  }

  // The first demo run seeded grocery items. Hide them from the storefront; they stay in the
  // database because past orders refer to them.
  await prisma.product.updateMany({
    where: { name: { in: OLD_DEMO_PRODUCTS } },
    data: { isActive: false },
  });

  console.log("Seeded jewelry categories and products");
}

const OLD_DEMO_PRODUCTS = ["Basmati Rice", "Cooking Oil", "Sugar", "Fresh Milk", "Eggs", "Yogurt"];

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
