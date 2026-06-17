import { IConversation } from "../models/Conversation";
import { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
      conversation: IConversation;
    }
  }
}
declare module "socket.io" {
  interface Socket {
    User: IUser;
  }
}
