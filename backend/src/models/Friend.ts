import mongoose, { Document } from "mongoose";

export interface IFriend extends Document {
  userA: mongoose.Types.ObjectId;
  userB: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const friendSchema = new mongoose.Schema<IFriend>(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, //tự động thêm createdAt và updatedAt vào mỗi document
  },
);

//chuẩn hóa dữ liệu để tránh trùng lặp (userA và userB có thể hoán đổi vị trí nhưng vẫn được coi là cùng một mối quan hệ bạn bè)
friendSchema.pre("save", function () {
  const a = this.userA.toString();
  const b = this.userB.toString();

  if (a > b) {
    this.userA = new mongoose.Types.ObjectId(b);
    this.userB = new mongoose.Types.ObjectId(a);
  }
});

friendSchema.index({ userA: 1, userB: 1 }, { unique: true }); //đảm bảo rằng mỗi cặp bạn bè chỉ tồn tại một lần trong cơ sở dữ liệu

const Friend = mongoose.model<IFriend>("Friend", friendSchema);
export default Friend;
