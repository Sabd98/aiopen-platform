import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

export async function up(queryInterface: any) {
  const now = new Date();
  const alicePassword = await bcrypt.hash('alice-password', 12);
  const bobPassword = await bcrypt.hash('bob-password', 12);

  await queryInterface.bulkInsert('users', [
    {
      id: randomUUID(),
      username: 'alice',
      email: 'alice@example.com',
      password: alicePassword,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      username: 'bob',
      email: 'bob@example.com',
      password: bobPassword,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

export async function down(queryInterface: any) {
  await queryInterface.bulkDelete('users', {
    email: ['alice@example.com', 'bob@example.com'],
  }, {});
}
