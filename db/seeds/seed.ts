import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed a default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Tenant',
      slug: 'default',
    },
  });

  console.log(`✓ Tenant created: ${tenant.id}`);

  // Seed a default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@stratix.local' },
    update: {},
    create: {
      email: 'admin@stratix.local',
      name: 'Admin User',
      password: 'hashed_password_here', // In production, use bcrypt
    },
  });

  console.log(`✓ User created: ${user.id}`);

  // Assign user to tenant
  await prisma.tenantUser.upsert({
    where: {
      userId_tenantId: {
        userId: user.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'admin',
    },
  });

  console.log('✓ User assigned to tenant');

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
