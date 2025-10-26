import { CreationOptional, DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/index.js";

// Minimal TypeScript description of the AI content shape we expect.
export interface ContentPiece {
  type: string;
  text: string;
  [key: string]: any;
}

export interface MessageContent {
  steps: Array<{ content: ContentPiece[]; [key: string]: any }>;
  output: Array<{ content: ContentPiece[]; [key: string]: any }>;
  text: string;
  [key: string]: any;
}

export interface MessageAttributes {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: MessageContent | any; 
  meta?: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MessageCreationAttributes = Optional<
  MessageAttributes,
  "id" | "meta"
>;

export class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  declare id: CreationOptional<string>;
  declare conversationId: string;
  declare role: "user" | "assistant" | "system";
  declare content: any;
  declare meta: object | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "conversations", key: "id" },
    },
    role: {
      type: DataTypes.ENUM("user", "assistant", "system"),
      allowNull: false,
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "messages",
    modelName: "Message",
    timestamps: true,
    underscored: false,
    indexes: [{ fields: ["conversationId"] }, { fields: ["createdAt"] }],
  }
);

