import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

//authorization - xác minh user là ai

//next là 1 hàm callback dùng trong middleware của express, khi bạn gọi hàm next(),
//express sẽ hiểu là chuyển tiếp luồng xử lý xem bước kế tiếp (chuyển tới middleware tiếp theo hoặc API). 
export const protectedRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //lấy access token mà client gửi lên request header.
        const authHeader = req.headers["authorization"];//lấy ra phần authorization trong request header mà client gửi lên
        const token = authHeader && authHeader.split(" ")[1]; //access token thường được gửi dưới dạng "Bearer <token>", nên mình sẽ tách lấy phần token

        if (!token) {
            return res.status(401).json({ message: "Access token không tồn tại" });
        }

        //Xác minh xem token có hợp lệ không.
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, async (err, decodedUser) => {
            //nếu token hợp lệ, nó sẽ giải mã token và trả về thông tin người dùng trong decodedUser. 
            //Nếu token không hợp lệ hoặc đã hết hạn, err sẽ chứa thông tin lỗi.
            if (err) {
                return res.status(401).json({ message: "Access token không hợp lệ hoặc đã hết hạn" });
            }
            //nếu token hợp lệ, tìm user tương ứng trong db để chắc chắc userId là thật và tài khoản chưa bị xóa
            const user = await User.findById((decodedUser as jwt.JwtPayload).userId).select("-passwordHash"); //loại bỏ trường passwordHash khi truy vấn để tăng cường bảo mật.

            if (!user) {
                return res.status(401).json({ message: "Người dùng không tồn tại" });
            }
            //gắn thông tin user vào req.user để các middleware hoặc API tiếp theo có thể sử dụng thông tin này mà không cần phải truy vấn lại database.
            req.user = user;
            next();
        });
        //tham số đầu tiên là token cần xác minh, 
        //tham số thứ hai là secret key dùng để xác minh token, 
        //tham số thứ ba là callback function sẽ được gọi sau khi quá trình xác minh hoàn tất. 
        //Callback này nhận vào hai tham số: err (nếu có lỗi xảy ra trong quá trình xác minh) và decoded (nếu token hợp lệ, đây sẽ là payload đã được giải mã từ token).
    }catch (error) {
        console.error("Lỗi khi xác minh JWT trong authMiddleware:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
}