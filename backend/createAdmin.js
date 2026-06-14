const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin1234", 10);
  
  const admin = await prisma.admin.create({
    data: {
      email: "admin@estiautodz.com",
      password,
    },
  });

  console.log("✅ Admin créé :", admin.email);
  console.log("📧 Email    : admin@estiautodz.com");
  console.log("🔑 Password : admin1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());