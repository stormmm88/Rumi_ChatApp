import bcrypt from "bcrypt";
import User from "../models/User";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Session } from "../models/Session";

const ACCESS_TOKEN_TTL = "30m"; //thời gian sống của access token, sau thời gian này token sẽ hết hạn và người dùng cần đăng nhập lại để lấy token mới
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; //thời gian sống của refresh token, sau thời gian này refresh token sẽ hết hạn và người dùng cần đăng nhập lại để lấy refresh token mới

export const signUp = async (req: Request, res: Response) => {
  //lấy dữ liệu từ request body bằng cách object destructuring từ req.body
  try {
    const { username, email, password, firstName, lastName } = req.body;
    //kiểm tra xem đã đủ dữ liệu chưa
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Không thể thiếu username, email, password, firstName hoặc lastName",
      });
    }

    //kiểm tra xem username hoặc email đã tồn tại chưa
    const duplicateUser = await User.findOne({ username });

    if (duplicateUser) {
      return res.status(409).json({ message: "Username đã tồn tại" });
    }

    //mã hóa mật khẩu bằng bcrypt, sử dụng 10 rounds để tăng cường bảo mật
    const passwordHash = await bcrypt.hash(password, 10);
    //10 rounds có nghĩa là bcrypt sẽ thực hiện quá trình hash 10 lần, làm cho việc tấn công brute-force trở nên khó khăn hơn.
    //kiến thức: trước khi tiến hành mã hóa ra 1 chuỗi ngâu nhiên (salt),
    //bcrypt sẽ kết hợp salt này với mật khẩu gốc để tạo ra một chuỗi hash duy nhất sau đó mới bắt đầu quá trình mã hóa nhiều vòng,
    //ngay cả khi hai người dùng có cùng mật khẩu, hash của họ sẽ khác nhau do salt khác nhau.
    //số 10 nghĩa là nó sẽ thực hiện 2 mũ 10 lần (1024 lần) để tạo ra hash cuối cùng, làm tăng thời gian cần thiết để tấn công brute-force.
    //quá trình mã hóa càng chậm thì hacker càng khó khăn trong việc thử nghiệm nhiều mật khẩu trong thời gian ngắn.

    //tạo user mới
    await User.create({
      username,
      email,
      passwordHash,
      displayName: `${lastName} ${firstName}`,
    });

    //return
    return res.sendStatus(204); //204: request thành công nhưng cần gửi thêm dữ liệu gì hết
    //vì mình chỉ gửi dữ liệu về sau khi đã đăng nhập thành công
  } catch (error) {
    console.error("Error in signUp:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
//quy trình hoạt động signUp:
//1. kiểm tra input: khi người dùng gửi yêu cầu đăng ký, server sẽ nhận dữ liệu từ request body và kiểm tra xem tất cả các trường dữ liệu cần thiết đã được cung cấp chưa. Nếu thiếu bất kỳ trường nào, server sẽ trả về lỗi 400 (Bad Request) với thông báo cụ thể về trường nào bị thiếu.
//2. kiểm tra trùng lặp: server sẽ kiểm tra xem username đã tồn tại trong cơ sở dữ liệu chưa. Nếu đã tồn tại, server sẽ trả về lỗi 409 (Conflict) với thông báo rằng username đã tồn tại.
//3. mã hóa mật khẩu: nếu tất cả dữ liệu hợp lệ và username chưa tồn tại, server sẽ sử dụng bcrypt để mã hóa mật khẩu của người dùng. Quá trình này bao gồm việc tạo một chuỗi ngẫu nhiên (salt) và kết hợp nó với mật khẩu gốc trước khi thực hiện quá trình mã hóa nhiều vòng để tạo ra một hash duy nhất.
//4. tạo user mới: sau khi mã hóa mật khẩu thành công, server sẽ tạo một bản ghi mới trong cơ sở dữ liệu với thông tin người dùng, bao gồm username, email, passwordHash và displayName.
//5. trả về phản hồi: nếu tất cả các bước trên thành công, server sẽ trả về mã trạng thái 204 (No Content) để cho biết rằng yêu cầu đã được xử lý thành công nhưng không có dữ liệu nào cần gửi về. Nếu có lỗi xảy ra trong quá trình xử lý, server sẽ trả về lỗi 500 (Internal Server Error) với thông báo lỗi cụ thể.

export const signIn = async (req: Request, res: Response) => {
  try {
    //luồng đăng nhập:
    //1. nhận dữ liệu từ request body
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password" });
    }

    //2. lấy hashpassword từ db để so với password người dùng nhập vào
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Sai username hoặc password" });
    }
    //kiểm tra password
    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!passwordCorrect) {
      return res.status(401).json({ message: "Sai username hoặc password" });
    }

    //3. nếu khớp, tạo access token (JWT) và trả về cho client
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    //hàm jwt.sign() có 3 tham số: payload(những thông tin gửi vào access token),
    //secret key (chuỗi bí mật dùng để ký token, nên đặt trong biến môi trường để tăng cường bảo mật),
    //và options (các tùy chọn như thời gian hết hạn của token).

    //tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex"); //tạo một chuỗi ngẫu nhiên dài 64 byte và chuyển nó thành chuỗi hex để làm refresh token

    //tạo session để lưu refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
      //đặt thời gian hết hạn của refresh token là 14 ngày
    });

    // trả về refresh token trong cookie
    res.cookie("refreshToken", refreshToken, {
      //cấu hình cookie để bảo mật hơn
      httpOnly: true, //chỉ cho phép cookie được truy cập thông qua HTTP(S), không cho phép JavaScript truy cập, giúp ngăn chặn tấn công XSS
      secure: true, //đảm bảo chỉ gửi qua HTTPS.
      sameSite: "none", //cho phép backend và frontend deploy riêng,
      maxAge: REFRESH_TOKEN_TTL, //đặt thời gian sống của cookie bằng với thời gian sống của refresh token để đảm bảo rằng cookie sẽ hết hạn cùng lúc với refresh token
    });

    //trả access token trong response body
    return res.json({
      message: `${user.displayName} Đăng nhập thành công`,
      accessToken,
    });
  } catch (error) {
    console.error("Error in signIn:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    //lấy refresh token từ cookie
    const token = req.cookies.refreshToken;
    //lấy refresh token từ cookie, hoạt động được nhờ cookie-parser
    if (!token) {
      //Xóa refresh token trong session
      await Session.deleteOne({ refreshToken: token }); //xóa refresh token trong session(hủy luôn phiên đăng nhập của user trong db)

      //Xóa cookie refresh token trên trình duyệt
      res.clearCookie("refreshToken"); // xóa cookie trong trình duyệt, đảm bảo user không còn token nào lưu trên client.
    }

    return res.sendStatus(204); //trả về mã trạng thái 204 (No Content) để cho biết rằng yêu cầu đã được xử lý thành công nhưng không có dữ liệu nào cần gửi về.
  } catch (error) {
    console.error("Error in signOut:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

//tạo access token mới từ refesh token
export const refresh = async (req: Request, res: Response) => {
  try {
    //lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    //so với refresh token trong db
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }

    //Kiểm tra refresh token hết hạn chưa?
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Token đã hết hạn" });
    }

    //nếu hết hạn. tạo access token mới
    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    //trả access token
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refeshToken", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
