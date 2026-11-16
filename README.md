# CẤP CỨU 115 — bản web nền tảng

Bản khởi đầu được dựng mới theo định hướng: miễn phí cho người dân, giao diện đỏ-trắng, ưu tiên điện thoại, tìm bệnh viện/phòng khám đa khoa, GPS, khoảng cách, gọi điện, chỉ đường và gửi phản ánh.

## 1. Chạy thử trên máy Windows

1. Cài Node.js bản LTS.
2. Giải nén thư mục dự án.
3. Mở Terminal/CMD tại thư mục `cap-cuu-115`.
4. Chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ localhost được hiển thị trong cửa sổ Terminal.

## 2. Build bản web

```bash
npm run build
```

Thư mục `dist` là bản web đã build để triển khai hosting.

## 3. Đưa lên GitHub Pages

GitHub Pages cần cấu hình base path đúng với tên repository. Với repo `Cap-cuu-115`, thêm `base: '/Cap-cuu-115/'` vào `vite.config.js`, sau đó dùng GitHub Actions để build và publish thư mục `dist`. Không upload nguyên thư mục source lên Pages để chạy trực tiếp.

## 4. Nguồn dữ liệu và giới hạn

- Bản này dùng OpenStreetMap và Overpass API để tìm đối tượng được gắn thẻ `amenity=hospital` hoặc `amenity=clinic`, sau đó lọc tên có cụm “Bệnh viện” hoặc “Phòng khám đa khoa”.
- Dữ liệu OSM do cộng đồng đóng góp, không đầy đủ đồng đều. Số điện thoại và giờ hoạt động có thể thiếu.
- Không dùng kết quả này làm bằng chứng cơ sở có khả năng tiếp nhận cấp cứu hoặc đang mở cửa.
- Overpass API công cộng có giới hạn tải; bản thương mại cần máy chủ/cache riêng hoặc nhà cung cấp dữ liệu phù hợp.
- Chưa tích hợp Google Places. Nếu tích hợp sau này, phải tuân thủ điều khoản Google Maps Platform, bao gồm quy tắc hiển thị dữ liệu Places cùng bản đồ Google phù hợp; không trộn Places data lên bản đồ OSM.

## 5. Bật chức năng nhận phản ánh tập trung

1. Tạo dự án Supabase.
2. Chạy nội dung `supabase/schema.sql` trong SQL Editor.
3. Trong `src/main.js`, điền `SUPABASE_URL` và `SUPABASE_ANON_KEY`.
4. Cấu hình người quản trị với `app_metadata.role = admin` bằng cơ chế quản trị tin cậy. Không cấp role bằng dữ liệu do người dùng tự gửi.
5. Trước khi công khai, bổ sung CAPTCHA/rate limit, xác thực quản trị viên, nhật ký duyệt và sao lưu.

Nếu chưa cấu hình Supabase, biểu mẫu chỉ lưu phản ánh trong localStorage của chính trình duyệt, không gửi cho quản trị viên.

## 6. Những việc bắt buộc trước khi gọi là bản chính thức

- Có backend vận hành, phân quyền quản trị và nhật ký kiểm duyệt.
- Kiểm thử GPS, tìm kiếm, điện thoại, chỉ đường trên iOS/Android và nhiều tỉnh thành.
- Kiểm tra, chuẩn hóa dữ liệu và xác minh số điện thoại/giờ hoạt động.
- Có chính sách quyền riêng tư, điều khoản, thông tin đơn vị vận hành và quy trình xử lý yêu cầu dữ liệu cá nhân.
- Bổ sung cơ chế bảo vệ API, chống spam, giám sát lỗi và sao lưu.
- Đánh giá an toàn nội dung và trải nghiệm để không gây hiểu nhầm đây là tổng đài điều phối cấp cứu.

## 7. Phạm vi của bản này

Đây là bộ mã nguồn nền tảng để tiếp tục hoàn thiện, chưa phải hệ thống cấp cứu đã được chứng nhận, chưa có dữ liệu y tế đầy đủ toàn quốc, chưa có quản trị viên trực tuyến cho tới khi cấu hình Supabase và chưa bật Google Places.
