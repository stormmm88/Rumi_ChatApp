//khi dùng memoryStorage thì multer sẽ lưu file dưới dạng dữ liệu thô trong bộ nhớ RAM
//thay vì lưu file trong ổ đĩa cứng của máy chủ, vì RAM nhanh hơn ổ đĩa cứng nên
//gửi file từ RAM lên cloudinary sẽ nhanh hơn và tối ưu hơn.

//limits: giới hạn kích thước file

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiOptions, UploadApiResponse } from "cloudinary";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1, //1MB
  },
});

//hàm xử lý việc gửi ảnh đã nhận lên cloudinary
export const uploadImageFromBuffer = (
  buffer: Buffer,
  options?: UploadApiOptions,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "rumi_chat/avatars",
        resource_type: "image",
        transformation: [{ width: 200, height: 200, crop: "fill" }],
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!);
        }
      },
    );

    uploadStream.end(buffer);
  });
};
