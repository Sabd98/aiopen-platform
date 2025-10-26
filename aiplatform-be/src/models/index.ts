import './user.model.js';
import './conversation.model.js';
import './message.model.js';
import { User } from './user.model.js';
import { Conversation } from './conversation.model.js';
import { Message } from './message.model.js';

// Set associations after all classes are defined to avoid circular initialization

// User associations
User.hasMany(Conversation, {
  foreignKey: 'userId',
  as: 'conversations',
  onDelete: 'CASCADE',
});

Conversation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Conversation-Message associations
Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages',
  onDelete: 'CASCADE',
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation',
});

export { User, Conversation, Message };
