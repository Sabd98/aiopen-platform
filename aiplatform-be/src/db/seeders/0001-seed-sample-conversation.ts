import { randomUUID } from "crypto";

export async function up(queryInterface: any) {
  const conversationId = randomUUID();
  const now = new Date();

  // Try to find an existing user to assign as owner of the sample conversation.

  const [rows] = await queryInterface.sequelize.query(
    'SELECT id FROM "users" ORDER BY "createdAt" LIMIT 1;'
  );
  let userId = rows && rows[0] && rows[0].id;

  if (!userId) {
    const newUserId = randomUUID();
    const bcrypt = await import("bcrypt");
    const passwordHash = await bcrypt.hash("seed-password", 12);

    await queryInterface.bulkInsert("users", [
      {
        id: newUserId,
        username: "seed-user",
        email: "seed@example.com",
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    userId = newUserId;
  }

  await queryInterface.bulkInsert("conversations", [
    {
      id: conversationId,
      userId,
      title: "Sample conversation",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  await queryInterface.bulkInsert("messages", [
    {
      id: randomUUID(),
      conversationId,
      role: "user",
      content: JSON.stringify({ text: "Hello, what is the time?" }),
      meta: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      conversationId,
      role: "assistant",
      content: JSON.stringify({
        text: "I do not have live time, but you can check your system clock.",
      }),
      meta: null,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

export async function down(queryInterface: any) {
  await queryInterface.bulkDelete("messages", null, {});
  await queryInterface.bulkDelete("conversations", null, {});
}
