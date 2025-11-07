// app/guide/GuidePage.tsx (hoặc nơi bạn muốn)
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  ClipboardCheck,
  Globe,
  HousePlus,
  Images,
  MessageCircle,
  Rocket,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

type Step = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string; // ví dụ: "text-sky-600 bg-sky-100"
};

const renterFlow: Step[] = [
  {
    title: "Khám phá phòng trọ",
    description:
      "Sử dụng bộ lọc theo diện tích, giá, cơ sở vật chất và từ khóa để thu hẹp kết quả và tìm đúng nhu cầu.",
    icon: Search,
    accent: "text-sky-600 bg-sky-100",
  },
  {
    title: "Xem chi tiết phòng",
    description:
      "Mở trang chi tiết để xem mô tả, thư viện hình ảnh, tiện nghi và thông tin liên hệ của chủ trọ.",
    icon: HousePlus,
    accent: "text-emerald-600 bg-emerald-100",
  },
  {
    title: "Trò chuyện trực tiếp",
    description:
      "Trao đổi với chủ trọ ngay trên hệ thống để hỏi đáp về điều kiện thuê và các ưu đãi kèm theo.",
    icon: MessageCircle,
    accent: "text-indigo-600 bg-indigo-100",
  },
  {
    title: "Tạo hợp đồng điện tử",
    description:
      "Khi đồng thuận, chọn thời hạn thuê và tạo hợp đồng thể hiện rõ thông tin hai bên cùng điều khoản.",
    icon: ClipboardCheck,
    accent: "text-amber-600 bg-amber-100",
  },
  {
    title: "Chủ trọ ký xác nhận",
    description:
      "Hệ thống gửi thông báo; chủ trọ rà soát nội dung và ký duyệt để hoàn tất bước xác thực.",
    icon: ShieldCheck,
    accent: "text-rose-600 bg-rose-100",
  },
  {
    title: "Đặt cọc an toàn",
    description:
      "Thanh toán tháng đầu tiên qua cổng thanh toán bảo mật bằng thẻ ngân hàng hoặc phương thức hỗ trợ.",
    icon: Wallet,
    accent: "text-purple-600 bg-purple-100",
  },
  {
    title: "Kích hoạt hợp đồng",
    description:
      "Ngay khi thanh toán thành công, hợp đồng được kích hoạt; hai bên có thể quản lý, phản hồi, khiếu nại.",
    icon: BadgeCheck,
    accent: "text-lime-600 bg-lime-100",
  },
];

const hostFlow: Step[] = [
  {
    title: "Hoàn tất hồ sơ & phê duyệt",
    description:
      "Gửi hồ sơ khu trọ và thông tin chủ trọ. Khi admin duyệt, nút My Ads sẽ mở để quản lý tin đăng.",
    icon: ShieldCheck,
    accent: "text-sky-600 bg-sky-100",
  },
  {
    title: "Khởi tạo phòng nhanh",
    description:
      "Trong My Ads, chọn khu trọ và nhấn Quick Create Room để tạo phòng chỉ với vài thao tác.",
    icon: Rocket,
    accent: "text-emerald-600 bg-emerald-100",
  },
  {
    title: "Điền thông tin cần thiết",
    description:
      "Cung cấp tiêu đề, số người tối đa, diện tích, loại phòng và tiện ích nổi bật để thu hút người thuê.",
    icon: ClipboardCheck,
    accent: "text-amber-600 bg-amber-100",
  },
  {
    title: "Tối ưu & cập nhật",
    description:
      "Chỉnh sửa bất cứ lúc nào để cập nhật giá, mô tả hoặc bổ sung ưu đãi giúp tin đăng luôn nổi bật.",
    icon: Settings2,
    accent: "text-indigo-600 bg-indigo-100",
  },
  {
    title: "Bổ sung hình ảnh",
    description:
      "Nhấn biểu tượng … rồi chọn Thêm hình ảnh để tải ảnh thực tế, tăng độ tin cậy cho người xem.",
    icon: Images,
    accent: "text-rose-600 bg-rose-100",
  },
  {
    title: "Xuất bản lên website",
    description:
      "Hoàn tất các bước, phòng sẽ hiển thị cho sinh viên và người thuê dễ dàng tìm kiếm, liên hệ.",
    icon: Globe,
    accent: "text-purple-600 bg-purple-100",
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <div
      className="group flex gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60"
      role="listitem"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-semibold shadow-inner ${step.accent}`}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold"
          >
            {index + 1}
          </Badge>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {step.title}
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-16 px-4 py-14 text-base leading-relaxed text-slate-700 dark:text-slate-200">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-rose-50 p-10 shadow-xl dark:border-slate-800 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_55%)]" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Badge className="flex items-center gap-2 rounded-full bg-white px-4 py-1 text-sm font-medium text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-300">
            <Sparkles className="h-4 w-4" />
            Hola Rental Guide
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hướng dẫn nhanh cho Người thuê & Chủ trọ
          </h1>
          <p className="max-w-2xl text-slate-600 dark:text-slate-300">
            Làm theo các bước dưới đây để tìm trọ – ký hợp đồng – thanh toán an
            toàn và quản lý phòng đăng tin hiệu quả.
          </p>
        </div>
      </section>

      {/* Flow: Người thuê */}
      <section aria-labelledby="renter-title" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle id="renter-title" className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-lime-600" />
              Quy trình cho Người thuê
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="grid gap-4 sm:grid-cols-2"
              role="list"
              aria-label="Renter steps"
            >
              {renterFlow.map((step, idx) => (
                <StepCard key={step.title} step={step} index={idx} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Flow: Chủ trọ */}
      <section aria-labelledby="host-title" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle id="host-title" className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-emerald-600" />
              Quy trình cho Chủ trọ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="grid gap-4 sm:grid-cols-2"
              role="list"
              aria-label="Host steps"
            >
              {hostFlow.map((step, idx) => (
                <StepCard key={step.title} step={step} index={idx} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
