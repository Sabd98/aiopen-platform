import { CreationOptional, DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/index.js";

export interface ConversationAttributes {
  id: string;
  userId: string;
  title?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ConversationCreationAttributes = Optional<
  ConversationAttributes,
  "id" | "title"
>;

export class Conversation
  extends Model<
    ConversationAttributes,
    ConversationCreationAttributes
  >
  implements ConversationAttributes
{
  declare id: CreationOptional<string>;
  declare userId: string;
  declare title: string | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Association
  declare messages?: any[];
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "conversations",
    modelName: "Conversation",
    timestamps: true,
    underscored: false,
  }
);

