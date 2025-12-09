const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`
      ALTER TABLE service_order_part 
      ADD COLUMN IF NOT EXISTS deduct_from_warehouse BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS warehouse_deducted_at TIMESTAMP(6) DEFAULT NULL;
    `;
    console.log("Schema updated successfully");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
