import mongoose, {Document} from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  avatarUrl?: string;
  avatarId?: string;
  bio?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  username: { 
    type: String, 
    required: true, // bắt buộc phải có username khi tạo mới user
    unique: true, // đảm bảo rằng mỗi username là duy nhất trong cơ sở dữ liệu
    trim: true, // loại bỏ khoảng trắng ở đầu và cuối chuỗi
    lowercase: true, // tự động chuyển username thành chữ thường để tránh trùng lặp do khác biệt về chữ hoa/chữ thường
  },
  //khi đặt unique: true, MongoDB sẽ tự động tạo một index duy nhất trên trường đó, giúp tăng hiệu suất khi tìm kiếm và đảm bảo tính duy nhất của dữ liệu.
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  //lưu password dưới dạng hash để tăng cường bảo mật, tránh lưu trữ mật khẩu gốc trong cơ sở dữ liệu
  displayName: { 
    type: String, 
    required: true,
    trim: true,
  },
  //displayName là tên hiển thị của người dùng, có thể khác với username và thường được sử dụng để hiển thị trong giao diện người dùng.
  avatarUrl: {
    type: String, //LINK cdn để hiển thị hìnnh
  },
  avatarId: {
    type: String //Cloudinary public_id để quản lý ảnh ( xóa hình )
  },
  bio: {
    type: String, //mô tả ngắn về người dùng
    trim: true,
  },
  phone:{
    type: String, //số điện thoại của người dùng
    sparse: true, //chp phép null, nhưng không được trùng
  }, 
},
{
    timestamps: true, //tự động thêm createdAt và updatedAt vào mỗi document
  }
);

//tạo model User dựa trên userSchema, model này sẽ đại diện cho collection "users" trong MongoDB
const User = mongoose.model("User", userSchema);
export default User;

//User model để lưu thông tin người dùng