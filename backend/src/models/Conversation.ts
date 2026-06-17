import mongoose from "mongoose";

export interface IConversation extends mongoose.Document {
  type: "direct" | "group";
  participants: {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
  }[];
  group?: {
    name: string;
    createdBy: mongoose.Types.ObjectId;
  };
  lastMessageAt?: Date;
  seenBy: mongoose.Types.ObjectId[];
  lastMessage?: {
    _id: string;
    content?: string;
    senderId: mongoose.Types.ObjectId;
    createdAt: Date;
  };
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new mongoose.Schema<IConversation["participants"][0]>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now, //mặc định là thời điểm tạo document
    },
  },
  {
    _id: false, //tắt tính năng tự động tạo _id cho subdocument này, vì chúng ta sẽ không cần _id riêng cho mỗi participant
  },
);

const groupSchema = new mongoose.Schema<NonNullable<IConversation["group"]>>(
  {
    name: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false, //tắt tính năng tự động tạo _id cho subdocument này, vì chúng ta sẽ không cần _id riêng cho group
  },
);

const lastMessageSchema = new mongoose.Schema<
  NonNullable<IConversation["lastMessage"]>
>(
  {
    _id: { type: String }, //lưu ID của tin nhắn cuối cùng dưới dạng string để dễ dàng truy xuất thông tin tin nhắn khi cần
    content: {
      type: String,
      default: null,
    }, //lưu nội dung của tin nhắn cuối cùng để hiển thị nhanh trong danh sách cuộc hội thoại mà không cần truy vấn toàn bộ tin nhắn
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    participants: {
      type: [participantSchema],
      required: true,
    },
    group: {
      type: groupSchema,
    },
    lastMessageAt: {
      type: Date,
    },
    seenBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);
//tạo 1 bảng tra cứu nhanh với dữ liệu được sắp xếp theo participants.userId trước với thứ tự tăng dần, rồi theo lastMessageAt với thứ tự giảm dần.
conversationSchema.index({ "participants.userId": 1, lastMessageAt: -1 });
//khi truy vấn cuộc hội thoại của người dùng, MongoDB có thể lấy ra nhanh nhất cuộc hội thoại vừa có tin nhắn mới.

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
export default Conversation;
