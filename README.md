# EduHub - Hệ thống học tập trực tuyến

Website học tập với giao diện pastel hiện đại, hỗ trợ bài tập, tài liệu và phân quyền giáo viên/học sinh.

## 📁 Cấu trúc Project

```
eduhub/
├── frontend/          # Next.js Frontend
│   ├── app/           # Pages và routing
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities và mock data
│   ├── public/        # Static files
│   └── package.json
│
└── backend/           # Node.js/Express Backend
    ├── routes/        # API routes
    ├── db/            # Database connection
    ├── lib/           # Auth utilities
    ├── scripts/       # SQL scripts
    ├── server.js      # Express server
    └── package.json
```

## 🚀 Cài đặt và Chạy

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

### Backend (Node.js/Express)

```bash
cd backend
npm install

# Copy file .env.example thành .env và cập nhật thông tin
cp .env.example .env

# Chạy server
npm start
# hoặc dev mode với nodemon
npm run dev
```

Backend sẽ chạy tại: http://localhost:5000

## 🎨 Tính năng

### Giao diện Pastel sáng sủa
- Màu sắc: Tím, xanh mint, vàng, hồng pastel
- Typography đẹp mắt với Geist font
- Responsive design với Tailwind CSS

### Phân quyền vai trò
- **Học sinh**: Làm bài tập, xem tài liệu, lưu yêu thích
- **Giáo viên**: Tạo bài tập/tài liệu, xem kết quả học sinh, quản lý nội dung
- **Admin**: Quản trị hệ thống, thống kê tổng quan

### Chức năng chính

#### Bài tập
- **Học sinh**: Xem danh sách, làm bài, xem kết quả
- **Giáo viên**: Tạo bài tập, xem chi tiết có đáp án, xem kết quả học sinh

#### Tài liệu
- **Học sinh**: Xem tất cả, tài liệu đã thích
- **Giáo viên**: Xem tất cả, tài liệu của tôi, tài liệu đã thích, tải lên tài liệu mới

#### Cài đặt
- Chỉnh sửa thông tin cá nhân (tên, email, giới tính, ngày sinh)
- Đổi avatar
- Đổi mật khẩu

## 🗄️ Database

Project sử dụng PostgreSQL (qua Neon). SQL scripts để tạo database nằm trong `backend/scripts/`:
- `001-create-enums-and-tables.sql` - Tạo bảng và ENUM types
- `002-seed-data.sql` - Dữ liệu mẫu

## 🔧 Môi trường

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```env
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

## 📝 API Endpoints

### Authentication
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập
- POST `/api/auth/logout` - Đăng xuất
- GET `/api/auth/me` - Lấy thông tin user hiện tại

### Assignments
- GET `/api/assignments` - Danh sách bài tập
- GET `/api/assignments/:id` - Chi tiết bài tập
- POST `/api/assignments/submit` - Nộp bài
- POST `/api/assignments/create` - Tạo bài tập mới (giáo viên)

### Documents
- GET `/api/documents` - Danh sách tài liệu
- GET `/api/documents/:id` - Chi tiết tài liệu
- POST `/api/documents/like` - Like/Unlike tài liệu
- POST `/api/documents/upload` - Tải lên tài liệu (giáo viên)

### User
- PUT `/api/user/update` - Cập nhật thông tin user

## 🎯 Chạy với Mock Data

Hiện tại frontend đang sử dụng mock data trong `frontend/lib/mock-data.js` nên có thể chạy mà không cần backend.

Để kết nối với backend thật:
1. Cập nhật `NEXT_PUBLIC_API_URL` trong frontend
2. Thay thế các mock API calls bằng fetch đến backend
3. Đảm bảo backend đã chạy và kết nối database

## 📦 Tech Stack

### Frontend
- Next.js 16
- React 19
- Tailwind CSS v4
- Zustand (state management)
- shadcn/ui components

### Backend
- Node.js
- Express.js
- PostgreSQL (Neon)
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- cookie-parser

## 👥 Tài khoản mẫu (Mock Data)

```javascript
// Học sinh
Email: student@example.com
Password: password123

// Giáo viên
Email: teacher@example.com
Password: password123

// Admin
Email: admin@example.com
Password: admin123
```

## 📄 License

MIT License
