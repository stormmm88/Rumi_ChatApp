import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
//lưu ID người dùng để biết session này thuộc về ai
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", //tham chiếu đến model User để dễ dàng truy xuất thông tin người dùng khi cần
    required: true,
    index: true, //tạo index trên trường userId để tăng hiệu suất khi tìm kiếm session theo userId
  },
//lưu refresh token để xác thực khi client gửi yêu cầu làm mới access token
    refreshToken: {
        type: String,
        required: true,
        unique: true, 
    },
    //lưu thời điểm refresh token hết hạn.
    expiresAt: {
        type: Date,
        required: true,
    }
}, {
    timestamps: true, //tự động thêm createdAt và updatedAt vào mỗi document
});

//viết index để tự động xóa document khi expiresAt đã qua
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//khi expiresAt đã qua, MongoDB sẽ tự động xóa document sau 0 giây (ngay lập tức)

export const Session = mongoose.model("Session", sessionSchema);