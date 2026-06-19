"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://zatca-invoice-worker.hoysamax.workers.dev";

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  status: string;
  created_at: number;
  client_name?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    const match = document.cookie.match(/auth_token=([^;]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${WORKER_URL}/api/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-bold text-lg text-slate-800">ZATCA Invoice</span>
          </div>
          <button onClick={handleLogout} className="text-slate-600 hover:text-slate-900 text-sm">
            تسجيل الخروج
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-slate-500 text-sm mb-1">إجمالي الفواتير</div>
            <div className="text-3xl font-bold text-slate-900">{invoices.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-slate-500 text-sm mb-1">الإجمالي</div>
            <div className="text-3xl font-bold text-emerald-600">
              {invoices.reduce((sum, i) => sum + i.total, 0).toFixed(2)} ر.س
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-slate-500 text-sm mb-1">الخطة</div>
            <div className="text-3xl font-bold text-slate-900">مجاني</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">الفواتير</h2>
          <Link
            href="/dashboard/invoices/new"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            + فاتورة جديدة
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد فواتير بعد</h3>
            <p className="text-slate-600 mb-4">ابدأ بإنشاء أول فاتورة ضريبية</p>
            <Link
              href="/dashboard/invoices/new"
              className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              إنشاء فاتورة
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">رقم الفاتورة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">العميل</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">المبلغ</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">الحالة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-slate-600">{invoice.client_name || "-"}</td>
                    <td className="px-4 py-3 text-slate-900">{invoice.total.toFixed(2)} ر.س</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        مسودة
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {new Date(invoice.created_at).toLocaleDateString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
