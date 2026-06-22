"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  User,
  Loader2,
  Package,
  AlertCircle,
  CalendarClock
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TombolKembali } from "@/components/dashboard/TombolKembali";

type OrderStatus = "MENUNGGU" | "DIKONFIRMASI" | "SELESAI" | "DIBATALKAN";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerPhone: string | null;
  customerName: string | null;
  totalAmount: number;
  status: OrderStatus;
  source: string;
  notes: string | null;
  orderType?: string | null;
  pickupAt?: string | null;
  pickupRaw?: string | null;
  createdAt: string;
  items: OrderItem[];
}

function formatRupiah(num: number): string {
  return num.toLocaleString("id-ID");
}

function formatTanggal(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  MENUNGGU: { label: "Menunggu", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
  DIKONFIRMASI: { label: "Dikonfirmasi", color: "text-blue-600", bgColor: "bg-blue-100", icon: CheckCircle },
  SELESAI: { label: "Selesai", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
  DIBATALKAN: { label: "Dibatalkan", color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
};

const tabs: { status: OrderStatus | "SEMUA"; label: string }[] = [
  { status: "SEMUA", label: "Semua" },
  { status: "MENUNGGU", label: "Menunggu" },
  { status: "DIKONFIRMASI", label: "Dikonfirmasi" },
  { status: "SELESAI", label: "Selesai" },
  { status: "DIBATALKAN", label: "Dibatalkan" },
];

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "SEMUA">("SEMUA");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const url = activeTab === "SEMUA" 
        ? "/api/orders" 
        : `/api/orders?status=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengubah status");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingId(null);
    }
  };

  const getActions = (order: Order) => {
    switch (order.status) {
      case "MENUNGGU":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange(order.id, "DIKONFIRMASI")}
              disabled={updatingId === order.id}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {updatingId === order.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Konfirmasi
            </button>
            <button
              onClick={() => handleStatusChange(order.id, "DIBATALKAN")}
              disabled={updatingId === order.id}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Batal
            </button>
          </div>
        );
      case "DIKONFIRMASI":
        return (
          <button
            onClick={() => handleStatusChange(order.id, "SELESAI")}
            disabled={updatingId === order.id}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {updatingId === order.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Tandai Selesai
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto">
        <TombolKembali />
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">Pesanan Masuk</h1>
          <p className="text-sm text-gray-600 hidden lg:block">
            Kelola pesanan dari WhatsApp bot
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const count = tab.status === "SEMUA" 
              ? orders.length 
              : orders.filter(o => o.status === tab.status).length;
            
            return (
              <button
                key={tab.status}
                onClick={() => setActiveTab(tab.status)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.status
                    ? "bg-amber-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.status ? "bg-amber-600" : "bg-gray-200"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {orders.map((order, index) => {
                const config = statusConfig[order.status];
                const StatusIcon = config.icon;
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{formatTanggal(order.createdAt)}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      {order.customerName && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          {order.customerName}
                        </div>
                      )}
                      {order.customerPhone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {order.customerPhone}
                        </div>
                      )}
                      {order.orderType && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.orderType === "PESANAN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {order.orderType === "PESANAN" ? "Pre-Order" : "Beli Langsung"}
                        </span>
                      )}
                    </div>

                    {/* Jadwal Ambil */}
                    {(order.pickupAt || order.pickupRaw) && (
                      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-sm">
                        <CalendarClock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="text-purple-800 font-medium">
                          Ambil:{" "}
                          {order.pickupAt
                            ? new Date(order.pickupAt).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : order.pickupRaw}
                        </span>
                      </div>
                    )}

                    {/* Items */}
                    <div className="border-t border-b border-gray-100 py-3 mb-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{item.productName}</span>
                          </div>
                          <div className="text-gray-600">
                            {item.quantity} × Rp {formatRupiah(item.price)} = Rp {formatRupiah(item.subtotal)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Total</span>
                      <span className="text-xl font-bold text-amber-600">
                        Rp {formatRupiah(Number(order.totalAmount))}
                      </span>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="bg-yellow-50 rounded-xl p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <p className="text-sm text-yellow-800">{order.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end">
                      {getActions(order)}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
