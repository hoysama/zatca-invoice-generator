"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://zatca-invoice-worker.hoysamax.workers.dev";

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    const match = document.cookie.match(/auth_token=([^;]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${WORKER_URL}/api/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone, vatNumber, address }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل إضافة العميل");
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

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
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">← العودة</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">إضافة عميل جديد</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم العميل <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="اسم الشركة أو الشخص" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="example@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="05xxxxxxxx" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الرقم الضريبي</label>
            <input type="text" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="3xxxxxxxxxxx" />
            <p className="text-xs text-slate-500 mt-1">10 أرقام - مطلوب للفواتير الضريبية</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="عنوان العميل..." />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50">
              {loading ? "جاري الإضافة..." : "إضافة العميل"}
            </button>
            <Link href="/dashboard" className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">
              إلغاء
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
