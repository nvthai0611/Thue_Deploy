# 🏠 HolaRental - Platform Cho Thuê Phòng Trọ

**HolaRental** là một nền tảng toàn diện cho việc cho thuê và tìm kiếm phòng trọ, giúp kết nối chủ nhà và người thuê một cách hiệu quả và an toàn.

## 🚀 Tính năng chính

### 👥 Dành cho người dùng

- 🔐 **Xác thực & Bảo mật**: Đăng ký/đăng nhập an toàn với Supabase Auth
- 🏡 **Tìm kiếm phòng**: Tìm kiếm phòng trọ với bộ lọc thông minh
- 💬 **Chat realtime**: Trò chuyện trực tiếp giữa chủ nhà và người thuê
- 📱 **Xác minh FPT eKYC**: Xác thực danh tính với công nghệ FPT
- 💳 **Thanh toán ZaloPay**: Tích hợp thanh toán trực tuyến an toàn
- 📄 **Quản lý hợp đồng**: Tạo và quản lý hợp đồng thuê phòng
- ⚖️ **Hệ thống tranh chấp**: Giải quyết tranh chấp một cách công bằng

### 🏘️ Dành cho chủ nhà

- ➕ **Đăng tin**: Đăng tin cho thuê phòng với hình ảnh và thông tin chi tiết
- 📊 **Quản lý**: Quản lý danh sách phòng và hợp đồng
- 💰 **Boost quảng cáo**: Tăng độ hiển thị của tin đăng
- 📈 **Thống kê**: Theo dõi hiệu suất và doanh thu

### 👨‍💼 Dành cho Admin

- 🎯 **Dashboard**: Tổng quan hệ thống với biểu đồ và thống kê
- 👥 **Quản lý người dùng**: Quản lý tài khoản và xác minh
- ⚖️ **Giải quyết tranh chấp**: Xử lý các tranh chấp giữa các bên
- 💸 **Quản lý giao dịch**: Theo dõi các giao dịch thanh toán

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Maps**: Google Maps API
- **HTTP Client**: React Query (TanStack Query)
- **Authentication**: Supabase Auth

### Backend

- **Framework**: Express.js + TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: Supabase
- **Logger**: Jet Logger
- **Validation**: Jet Validators
- **Documentation**: Swagger
- **Testing**: Vitest

### Third-party Services

- 💳 **ZaloPay**: Thanh toán trực tuyến
- 🏛️ **FPT eKYC**: Xác thực danh tính
- 🗺️ **Google Maps**: Hiển thị bản đồ và địa chỉ
- 📧 **Email Service**: Gửi thông báo và xác nhận

## 📁 Cấu trúc dự án

```
HolaRental/
├── 📂 front-end/          # Next.js Frontend
│   ├── 📂 app/            # App Router pages
│   ├── 📂 components/     # React components
│   ├── 📂 lib/           # Utilities & configs
│   ├── 📂 queries/       # React Query hooks
│   ├── 📂 store/         # Zustand stores
│   └── 📂 types/         # TypeScript types
├── 📂 back-end/          # Express.js Backend
│   ├── 📂 src/
│   │   ├── 📂 routes/    # API routes
│   │   ├── 📂 services/  # Business logic
│   │   ├── 📂 repos/     # Data access layer
│   │   ├── 📂 models/    # Database models
│   │   ├── 📂 middleware/ # Express middleware
│   │   └── 📂 swagger/   # API documentation
│   └── 📂 tests/         # Unit & integration tests
└── 📄 README.md
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js 18+
- MongoDB
- npm hoặc yarn

### 1. Clone repository

```bash
git clone <repository-url>
cd HolaRental
```

### 2. Cài đặt dependencies

**Frontend:**

```bash
cd front-end
npm install
```

**Backend:**

```bash
cd back-end
npm install
```

### 3. Cấu hình môi trường

**Frontend (.env.local):**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

**Backend (.env):**

```env
DATABASE_URL=mongodb://localhost:27017/holarental
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
ZALOPAY_APP_ID=your_zalopay_app_id
ZALOPAY_KEY1=your_zalopay_key1
ZALOPAY_KEY2=your_zalopay_key2
VNPT_API_KEY=your_vnpt_api_key
```

### 4. Chạy ứng dụng

**Development mode:**

```bash
# Backend (Port 4000)
cd back-end
npm run dev

# Frontend (Port 3000)
cd front-end
npm run dev
```

**Production build:**

```bash
# Backend
cd back-end
npm run build
npm start

# Frontend
cd front-end
npm run build
npm start
```

## 📚 API Documentation

Swagger documentation có sẵn tại: `http://localhost:4000/api-docs`

## 🧪 Testing

```bash
# Backend tests
cd back-end
npm run test

# Frontend tests
cd front-end
npm run test
```

---

**Được phát triển với ❤️ bởi HolaRental Team**
