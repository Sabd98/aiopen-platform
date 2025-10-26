
import { sequelize } from "./index.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";


export default {
  sequelize,
  User,
  Conversation,
  Message,
};
