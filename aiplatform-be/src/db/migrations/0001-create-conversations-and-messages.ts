import type { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface, SequelizeLib: any) {
  // conversations
  await queryInterface.createTable('conversations', {
    id: {
      type: SequelizeLib.DataTypes.UUID,
      defaultValue: SequelizeLib.DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: SequelizeLib.DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    title: {
      type: SequelizeLib.DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: SequelizeLib.DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: SequelizeLib.DataTypes.DATE,
    },
  });

  // messages
  await queryInterface.createTable('messages', {
    id: {
      type: SequelizeLib.DataTypes.UUID,
      defaultValue: SequelizeLib.DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: SequelizeLib.DataTypes.UUID,
      allowNull: false,
      references: { model: 'conversations', key: 'id' },
      onDelete: 'CASCADE',
    },
    role: {
      type: SequelizeLib.DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false,
    },
    content: {
      type: SequelizeLib.DataTypes.JSONB,
      allowNull: false,
    },
    meta: {
      type: SequelizeLib.DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: SequelizeLib.DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: SequelizeLib.DataTypes.DATE,
    },
  });

  await queryInterface.addIndex('messages', ['conversationId']);
  await queryInterface.addIndex('messages', ['createdAt']);
}

export async function down(queryInterface: QueryInterface) {
  // drop messages first due to FK
  await queryInterface.dropTable('messages');
  await queryInterface.dropTable('conversations');

  // drop enum type if exists (Postgres)
  try {
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_role";');
  } catch (e) {
    // ignore
  }
}
