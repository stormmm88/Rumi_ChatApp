import mongoose, { Document } from "mongoose";

export interface IFriendRequest extends Document {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new mongoose.Schema<IFriendRequest>(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  },
);

//thêm index để không  gửi trùng lời mời
//đảm bảo rằng cặp from-to là duy nhất.
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

//index truy vấn tất cả lời mời đã gửi
friendRequestSchema.index({ from: 1 });

//index truy vấn tất cả lời mời đã nhận
friendRequestSchema.index({ to: 1 });

const FriendRequest = mongoose.model<IFriendRequest>(
  "FriendRequest",
  friendRequestSchema,
);
export default FriendRequest;
