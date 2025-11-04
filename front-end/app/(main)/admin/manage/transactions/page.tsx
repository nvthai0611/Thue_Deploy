"use client"

import React, { useMemo, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { CheckCircle2, Clock3, DownloadCloud, RefreshCcw, XCircle } from "lucide-react"
import { useGetAllTransactions, type TransactionRecord } from "@/queries/transaction.queries"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

type PaymentStatus = "success" | "pending" | "failed"

type Payment = {
  id: string
  user: string
  amount: number
  method: string
  status: PaymentStatus
  date: string
  displayDate: string
  notes?: string | null
  transaction: TransactionRecord
}

function mapStatus(status?: number | null): PaymentStatus {
  if (status === 1) return "success"
  if (status === 2 || status === 0 || status == null) return "pending"
  return "failed"
}

function resolveDates(...rawDates: Array<string | undefined | null>) {
  const candidate = rawDates.find((value) => Boolean(value))
  if (!candidate) {
    return { filterKey: "", label: "—" }
  }
  const date = new Date(candidate)
  if (Number.isNaN(date.getTime())) {
    return { filterKey: "", label: "—" }
  }
  return {
    filterKey: date.toISOString().slice(0, 10),
    label: date.toLocaleString("vi-VN"),
  }
}

function formatMethod(type?: string | null, hasZalo = false) {
  if (hasZalo) return "ZaloPay"
  if (!type) return "Khác"
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatTransactionType(type?: string | null) {
  if (!type) return "Không xác định"
  const labels: Record<string, string> = {
    service: "Thanh toán dịch vụ",
    deposit: "Đặt cọc",
  }
  return labels[type] ?? type
}

function formatDateTime(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("vi-VN")
}

function statusBadge(status: PaymentStatus) {
  const base = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
  if (status === "success") {
    return (
      <span className={`${base} border-emerald-500/50 bg-emerald-500/10 text-emerald-200`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        Thành công
      </span>
    )
  }
  if (status === "pending") {
    return (
      <span className={`${base} border-amber-400/40 bg-amber-400/10 text-amber-200`}>
        <Clock3 className="h-3.5 w-3.5" />
        Đang chờ
      </span>
    )
  }
  return (
    <span className={`${base} border-rose-500/40 bg-rose-500/10 text-rose-200`}>
      <XCircle className="h-3.5 w-3.5" />
      Thất bại
    </span>
  )
}

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
}

export default function Page() {
  const { data: transactions, isLoading, isError, error } = useGetAllTransactions()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Payment["status"]>("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRecord | null>(null)

  const contractDetail = useMemo<Record<string, unknown> | null>(() => {
    if (!selectedTransaction || typeof selectedTransaction.contract_id !== "object" || selectedTransaction.contract_id === null) {
      return null
    }
    return selectedTransaction.contract_id as Record<string, unknown>
  }, [selectedTransaction])

  const roomDetail = useMemo<Record<string, unknown> | null>(() => {
    if (!contractDetail) return null
    const { room_id: room } = contractDetail as { room_id?: unknown }
    if (room && typeof room === "object") {
      return room as Record<string, unknown>
    }
    return null
  }, [contractDetail])

  const roomFacilities = useMemo<Array<{ name?: string; code?: number }>>(() => {
    if (!roomDetail) return []
    const facilities = (roomDetail as { facilities?: unknown }).facilities
    if (Array.isArray(facilities)) {
      return facilities as Array<{ name?: string; code?: number }>
    }
    return []
  }, [roomDetail])

  const roomImages = useMemo<Array<{ url?: string; uploaded_at?: string }>>(() => {
    if (!roomDetail) return []
    const images = (roomDetail as { images?: unknown }).images
    if (Array.isArray(images)) {
      return images as Array<{ url?: string; uploaded_at?: string }>
    }
    return []
  }, [roomDetail])

  const roomInfo = useMemo(() => {
    if (!roomDetail) {
      return {
        roomNumber: "",
        title: "",
        price: 0,
        area: null as number | null,
        type: "",
        maxOccupancy: null as number | null,
        status: "",
      }
    }
    const room = roomDetail as {
      room_number?: string
      title?: string
      price?: number
      area?: number
      type?: string
      max_occupancy?: number
      status?: string
    }
    return {
      roomNumber: room.room_number ?? "",
      title: room.title ?? "",
      price: room.price ?? 0,
      area: typeof room.area === "number" ? room.area : null,
      type: room.type ?? "",
      maxOccupancy: typeof room.max_occupancy === "number" ? room.max_occupancy : null,
      status: room.status ?? "",
    }
  }, [roomDetail])

  const contractTimings = useMemo(() => {
    if (!contractDetail) {
      return { start: "", end: "" }
    }
    const contract = contractDetail as { start_date?: string | null; end_date?: string | null }
    return {
      start: contract.start_date ?? "",
      end: contract.end_date ?? "",
    }
  }, [contractDetail])

  const housingAreaLabel = useMemo(() => {
    if (!selectedTransaction) return ""
    const { housing_area_id: housingArea } = selectedTransaction
    if (typeof housingArea === "string") return housingArea
    if (housingArea && typeof housingArea === "object") {
      return ((housingArea as { id?: string }).id ?? (housingArea as { _id?: string })._id ?? "") || ""
    }
    return ""
  }, [selectedTransaction])

  const contractCode = useMemo(() => {
    if (!selectedTransaction) return ""
    const { contract_id: contract } = selectedTransaction
    if (typeof contract === "string") return contract
    if (contract && typeof contract === "object") {
      return ((contract as { id?: string }).id ?? (contract as { _id?: string })._id ?? "") || ""
    }
    return ""
  }, [selectedTransaction])

  const selectedSummary = useMemo(() => {
    if (!selectedTransaction) {
      return {
        status: mapStatus(null),
        method: "",
        amount: 0,
        typeLabel: "",
        note: "",
        transactionId: "",
      }
    }
    return {
      status: mapStatus(selectedTransaction.zalo_payment?.status ?? null),
      method: formatMethod(selectedTransaction.type, Boolean(selectedTransaction.zalo_payment?.app_trans_id)),
      amount: selectedTransaction.zalo_payment?.amount ?? 0,
      typeLabel: formatTransactionType(selectedTransaction.type),
      note: selectedTransaction.notes ?? "",
      transactionId: selectedTransaction._id,
    }
  }, [selectedTransaction])

  const hasRoom = Boolean(roomDetail)

  const payments = useMemo<Payment[]>(() => {
    if (!transactions) return []
    return transactions.map((transaction: TransactionRecord) => {
      const zalo = transaction.zalo_payment ?? undefined
      const hasZalo = Boolean(zalo?.app_trans_id)
      const { filterKey, label } = resolveDates(
        transaction.createdAt,
        transaction.updatedAt,
        zalo?.createdAt,
        zalo?.updatedAt,
      )

      const userDetail = transaction.user && typeof transaction.user === "object" ? transaction.user : null
      const userDisplayName = [userDetail?.full_name, userDetail?.name, userDetail?.email, userDetail?.phone, transaction.user_id]
        .find((value) => typeof value === "string" && value.trim().length > 0)
        ?.trim()

      return {
        id: transaction._id,
        user: userDisplayName ?? "Không xác định",
        amount: typeof zalo?.amount === "number" ? zalo.amount : 0,
        method: formatMethod(transaction.type, hasZalo),
        status: mapStatus(zalo?.status ?? null),
        date: filterKey,
        displayDate: label,
        notes: transaction.notes ?? "",
        transaction,
      }
    })
  }, [transactions])

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (statusFilter !== "all" && payment.status !== statusFilter) return false
      if (query && !(`${payment.id} ${payment.user} ${payment.method}`.toLowerCase().includes(query.toLowerCase()))) return false
      if (fromDate) {
        if (!payment.date) return false
        if (payment.date < fromDate) return false
      }
      if (toDate) {
        if (!payment.date) return false
        if (payment.date > toDate) return false
      }
      return true
    })
  }, [payments, query, statusFilter, fromDate, toDate])

  const totals = useMemo(() => {
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const successCount = filteredPayments.filter((payment) => payment.status === "success").length
    const pendingCount = filteredPayments.filter((payment) => payment.status === "pending").length
    const failedCount = filteredPayments.filter((payment) => payment.status === "failed").length
    const totalTransactions = filteredPayments.length
    const successRate = totalTransactions ? Math.round((successCount / totalTransactions) * 100) : 0
    const pendingRate = totalTransactions ? Math.round((pendingCount / totalTransactions) * 100) : 0

    return { totalAmount, successCount, pendingCount, failedCount, totalTransactions, successRate, pendingRate }
  }, [filteredPayments])

  const chartData = useMemo(() => {
    const map: Record<string, number> = {}
    filteredPayments.forEach((payment) => {
      if (!payment.date) return
      map[payment.date] = (map[payment.date] || 0) + payment.amount
    })
    return Object.keys(map)
      .sort()
      .map((date) => ({ date, amount: map[date] }))
  }, [filteredPayments])

  const methodBreakdown = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {}
    filteredPayments.forEach((payment) => {
      if (!map[payment.method]) map[payment.method] = { count: 0, amount: 0 }
      map[payment.method].count += 1
      map[payment.method].amount += payment.amount
    })

    return Object.entries(map)
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.amount - a.amount)
  }, [filteredPayments])

  const maxMethodAmount = useMemo(() => {
    return methodBreakdown.reduce((max, item) => Math.max(max, item.amount), 0)
  }, [methodBreakdown])

  function exportCSV() {
    const headers = ["Mã giao dịch", "Người dùng", "Số tiền", "Phương thức", "Trạng thái", "Ngày"]
    const rows = filteredPayments.map((payment) => [payment.id, payment.user, payment.amount.toString(), payment.method, payment.status, payment.displayDate])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0b1220] via-[#060913] to-black p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {isError && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {(error as Error | undefined)?.message || "Không thể tải dữ liệu giao dịch."}
          </div>
        )}

        <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Nhịp độ doanh thu</p>
                <h2 className="text-lg font-semibold text-white">Biểu đồ thanh toán theo ngày</h2>
              </div>
              <p className="text-sm text-slate-400">
                Tổng: <span className="font-medium text-white">{formatVND(totals.totalAmount)}</span>
              </p>
            </div>
            <div className="mt-6" style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243049" />
                  <XAxis dataKey="date" stroke="#7385a5" tickLine={false} axisLine={false} />
                  <YAxis stroke="#7385a5" tickFormatter={(value) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatVND(value)}
                    labelClassName="text-sm font-medium"
                    contentStyle={{ background: "#0f172a", borderRadius: 12, border: "1px solid rgba(148, 163, 184, 0.2)", color: "#e2e8f0" }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Phương thức nổi bật</h2>
            <p className="mt-1 text-sm text-slate-400">Tập trung vào dữ liệu đã lọc</p>
            <div className="mt-5 space-y-4">
              {methodBreakdown.length === 0 && <p className="text-sm text-slate-400">Chưa có dữ liệu</p>}
              {methodBreakdown.map((method) => (
                <div key={method.method} className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span className="font-medium">{method.method}</span>
                    <span>{method.count} giao dịch</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Doanh thu: <span className="font-medium text-white">{formatVND(method.amount)}</span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
                      style={{ width: `${maxMethodAmount ? Math.round((method.amount / maxMethodAmount) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
            <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">Tìm kiếm</label>
                <input
                  aria-label="Tìm kiếm giao dịch"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Mã, người dùng hoặc phương thức"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="all">Tất cả</option>
                  <option value="success">Thành công</option>
                  <option value="pending">Đang chờ</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">Khoảng ngày</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setQuery("")
                  setStatusFilter("all")
                  setFromDate("")
                  setToDate("")
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700/70"
              >
                <RefreshCcw className="h-4 w-4" />
                Đặt lại
              </button>
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 py-2 text-sm font-medium text-white shadow-lg transition hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400"
              >
                <DownloadCloud className="h-4 w-4" />
                Xuất CSV
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="min-w-full divide-y divide-slate-800 bg-slate-950/60">
              <thead className="bg-slate-950/80">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Mã</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Người dùng</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Số tiền</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Phương thức</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Trạng thái</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Ngày</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="transition hover:bg-slate-900/60">
                    <td className="px-4 py-3 text-sm font-medium text-slate-100">{payment.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{payment.user}</td>
                    <td className="px-4 py-3 text-sm text-slate-100 text-right font-semibold">{formatVND(payment.amount)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{payment.method}</td>
                    <td className="px-4 py-3 text-sm">{statusBadge(payment.status)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{payment.displayDate}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        className="text-indigo-300 transition hover:text-indigo-100 hover:underline"
                        onClick={() => {
                          setSelectedTransaction(payment.transaction)
                          setDetailOpen(true)
                        }}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">Đang tải dữ liệu giao dịch...</td>
                  </tr>
                )}
                {!isLoading && filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">Không có giao dịch phù hợp với bộ lọc hiện tại</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) {
            setSelectedTransaction(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl bg-slate-950 text-slate-100 max-h-[85vh] grid grid-rows-[auto,1fr] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch</DialogTitle>
            <DialogDescription className="text-slate-400">
              Theo dõi thông tin chi tiết của giao dịch và người thực hiện.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 sm:pr-2">
            {selectedTransaction ? (
              <div className="space-y-6">
              <section className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Mã giao dịch</p>
                    <p className="text-base font-semibold text-slate-100">{selectedSummary.transactionId || "—"}</p>
                  </div>
                  <div>{statusBadge(selectedSummary.status)}</div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-slate-400">Loại giao dịch</p>
                    <p className="font-medium text-slate-100">{selectedSummary.typeLabel || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Phương thức</p>
                    <p className="font-medium text-slate-100">{selectedSummary.method || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Số tiền</p>
                    <p className="font-medium text-slate-100">{formatVND(selectedSummary.amount)}</p>
                  </div>
                </div>
                {selectedSummary.note && (
                  <div className="mt-4 rounded-lg border border-white/5 bg-slate-950/60 p-3 text-sm text-slate-200">
                    {selectedSummary.note}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-200">Người thực hiện</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-slate-400">Tên hiển thị</p>
                    <p className="font-medium text-slate-100">
                      {selectedTransaction.user?.name || selectedTransaction.user?.full_name || selectedTransaction.user_id || "Không xác định"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Vai trò</p>
                    <p className="font-medium text-slate-100">{selectedTransaction.user?.role || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Email</p>
                    <p className="font-medium text-slate-100">{selectedTransaction.user?.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Số điện thoại</p>
                    <p className="font-medium text-slate-100">{selectedTransaction.user?.phone || "—"}</p>
                  </div>
                </div>
              </section>

              {selectedTransaction.contract_id || selectedTransaction.housing_area_id ? (
                <section className="space-y-6 rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Thông tin phòng</h3>
                      <p className="text-xs text-slate-400">
                        {housingAreaLabel ? `Khu: ${housingAreaLabel}` : "Không có khu nhà được liên kết"}
                      </p>
                      {contractCode && <p className="text-xs text-slate-500">Hợp đồng: {contractCode}</p>}
                    </div>
                    {roomInfo.roomNumber && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        Phòng {roomInfo.roomNumber}
                      </span>
                    )}
                  </div>

                  {hasRoom ? (
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-slate-400">Tiêu đề</p>
                        <p className="font-medium text-slate-100">{roomInfo.title || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Giá niêm yết</p>
                        <p className="font-medium text-slate-100">{roomInfo.price > 0 ? formatVND(roomInfo.price) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Diện tích</p>
                        <p className="font-medium text-slate-100">{roomInfo.area ? `${roomInfo.area} m²` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Sức chứa tối đa</p>
                        <p className="font-medium text-slate-100">{roomInfo.maxOccupancy ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Loại phòng</p>
                        <p className="font-medium text-slate-100">{roomInfo.type || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Trạng thái</p>
                        <p className="font-medium text-slate-100">{roomInfo.status || "—"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Không có thông tin chi tiết về phòng được cung cấp.</p>
                  )}

                  {(contractTimings.start || contractTimings.end) && (
                    <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                      <div>
                        <p className="text-slate-400">Ngày bắt đầu hợp đồng</p>
                        <p className="font-medium text-slate-100">{formatDateTime(contractTimings.start)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Ngày kết thúc hợp đồng</p>
                        <p className="font-medium text-slate-100">{formatDateTime(contractTimings.end)}</p>
                      </div>
                    </div>
                  )}

                  {hasRoom && roomFacilities.length > 0 && (
                    <>
                      <Separator className="my-2 bg-white/10" />
                      <div>
                        <p className="mb-2 text-sm font-medium text-slate-200">Tiện nghi</p>
                        <div className="flex flex-wrap gap-2">
                          {roomFacilities.map((facility, index) => (
                            <span
                              key={`${facility.code ?? index}-${facility.name ?? "facility"}`}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                            >
                              {facility.name || `Tiện nghi #${facility.code ?? index + 1}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {hasRoom && roomImages.length > 0 && (
                    <>
                      <Separator className="my-2 bg-white/10" />
                      <div>
                        <p className="mb-2 text-sm font-medium text-slate-200">Hình ảnh</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {roomImages.slice(0, 6).map((image, index) => (
                            <div key={`${image.url ?? index}`} className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/60">
                              <img
                                src={image.url ?? ""}
                                alt={`Hình ảnh phòng ${index + 1}`}
                                className="h-28 w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </section>
              ) : (
                <section className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
                  <h3 className="text-sm font-semibold text-slate-200">Thông tin phòng</h3>
                  <p className="mt-3 text-sm text-slate-400">Giao dịch này không liên kết với phòng cụ thể.</p>
                </section>
              )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Không có dữ liệu giao dịch để hiển thị.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}