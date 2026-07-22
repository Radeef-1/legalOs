import { PrismaService } from './shared/database/prisma.service';
import { comparePassword } from './shared/utils/crypto';

async function verifyHash() {
  const prisma = new PrismaService();
  await prisma.$connect();

  const user = await prisma.user.findUnique({
    where: { email: 'lawyer.a@firma.sa' },
  });

  if (!user) {
    console.log('User lawyer.a@firma.sa not found!');
    await prisma.$disconnect();
    return;
  }

  console.log('User found in database:');
  console.log(`Email: ${user.email}`);
  console.log(`Password Hash: ${user.passwordHash}`);

  if (user.passwordHash) {
    const isMatch = comparePassword('password123', user.passwordHash);
    console.log(`Does 'password123' match stored hash? ${isMatch}`);
  } else {
    console.log('Stored password hash is null or undefined!');
  }

  await prisma.$disconnect();
}

verifyHash().catch(console.error);
