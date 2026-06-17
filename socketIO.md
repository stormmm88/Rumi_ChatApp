socketIO: giúp client và server giữ kết nối realtime để mỗi khi có tin nhắn mới thì cả người gửi và người nhận đề đc cập nhật ngay

-- Socket hoạt động: cần 1 socket intance ở backend và frontend (giống 2 đầu giây điện thoại), khi chúng kết nối với nhau, socketIO sẽ kích hoạt 1 sự kiện mặc định là connect, khi đó giữa FE và BE sẽ mở ra 1 kết nối tạm thời và được đuy trì liên tục trong suốt thời gian người dùng online (khác với BE thì sau khi BE trả về res nó sẽ đóng kết nối ngay, với socketIo, kết nối luôn đc mở => có thể gửi dữ liệu qua lại mà không cần tạo req)

--tại BE không giữ kết nối liên tục: BE được thiết kế để xử lý các tác vụ lớn như truy vấn database, xử lý logic và mỗi req có thể rất nặng => nếu BE giữ hàng chục nghìn kêt nối liên tục thì sẽ bị quá tải

--tại sao socket giữ kết nối liên tục được: trao đổi những sự kiện nhỏ như thông báo có tin nhắn mới, thông báo người dùng này mới online (những sự kiện này rất nhẹ và diễn ra nhanh) nên socket có thể giữ kết nối liên tục mà làm nghẽn server

--socket.on: lắng nghe sự kiện (sự kiện này xảy ra thì chạy hàm này).
--socket.emit: gửi sự kiên đi

--tạo middleware để bảo vệ socket: nếu không kiểm tra token, bất cứ ai cũng có thể mở socket và đọc dữ liệu realtime, tương tự như authentication middleware của express API thì socket middleware cũng lấy accessToken, verify với JWT, tìm user và gắn user vào socket, nếu tkoen sai hoặc user không tồn tại thì từ chối kết nối. Lưu ý: socket middleware chỉ chạy đúng 1 lần khi connect socket không chạy lại cho từng event như middleware của express API

--để gửi tin nhắn realtime: khi BE xử lý xong API sendMessages, nó sẽ phát đi tín hiệu để báo cho các client liên quan là có tin nhắn mới gửi xong(client liên quan gồm người gửi và tất cả người nhận trong 1 cuộc hội thoại), khi nhận được sự kiện đó, mỗi client sẽ tự động cập nhật UI để hiển thị tin nhắn mới. Sự kiện gửi tin nhắn không thông báo cho toàn bộ client đang kết nối.

--SocketIO cho phép chia nhóm theo kiểu phòng (room). Zoom là 1 không gian ảo, chỉ những client nào tham gia vào không gian đó mới nhận được sự kiện. Trong RUMI, mỗi cuộc hội thoại là 1 room nên khi user kết nối socket, việc đầu tiên là đưa họ vào tất cả các room tương ứng với các cuộc hội thoại mà họ đang tham gia, khi đã có room thì trong sendDirectMessage và sendGroupMessage chúng ta chỉ cần emit sự kiện vào 1 room, không emit cho tất cả client đang kết nối

--Lắng nghe sự kiện gửi tin nhắn ở FE: thêm tin nhắn mới store để UI cập nhật tin nhắn cho đúng,update conversation (unreadCounts, lastMessage, trạng thái đã đọc)

--flow theo dõi trạng thái tin nhắn (tin được đọc hay chưa): khi user click mở 1 cuộc trò chuyện thì FE sẽ gọi APi market seen để báo cho BE biết user này vừa đọc tin nhắn, khi nhận đc req này thì BE làm 2 việc gồm cập nhật lại dữ liệu (thêm user vào danh sách seenBy, đưa unreadCounts của user đó về 0, phát 1 socket event, để báo cho tất cả client trong cuộc trò chuyện là tin nhắn này đã đc đọc rồi), sau khi API markSeen trả về thì FE phải cập nhật conversation trong store để UI thay đổi trạng thái mà ko cần reload, xử lý trường hợp khi có tin nhắn mới, tin nhắn đó thuộc đúng cùng cuộc thoại mà user đang mở thì FE gọi marketSeen liền, vì user đang nhìn màn hình thì coi như đang đọc rồi. Có 2 trường hợp FE gọi marketSeen: khi user mở hộp chát và hộp chát đã mở sẵn có tin nhắn mới
