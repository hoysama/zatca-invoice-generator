"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://zatca-invoice-worker.hoysamax.workers.dev";

interface Client {
  id: string;
  name: string;
  vat_number: string | null;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    const match = document.cookie.match(/auth_token=([^;]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${WORKER_URL}/api/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .catch(console.error);
  }, [router]);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * 0.15;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedClient) {
      setError("يرجى اختيار العميل");
      setLoading(false);
      return;
    }

    if (items.some((item) => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      setError("يرجى ملء جميع الأصناف بشكل صحيح");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${WORKER_URL}/api/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: selectedClient,
          items: items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل إنشاء الفاتورة");
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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">فاتورة جديدة</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-bold text-slate-900 mb-4">بيانات العميل</h2>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">-- اختر عميل --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.vat_number ? `(ضريبي: ${client.vat_number})` : ""}
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="text-sm text-slate-500 mt-2">
                لا يوجد عملاء. <Link href="/dashboard/clients/new" className="text-emerald-600 hover:underline">أضف عميل جديد</Link>
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-bold text-slate-900 mb-4">الأصناف</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="وصف الصنف"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="الكمية"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                      min="1"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="السعر"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="w-24 text-left py-2">
                    <span className="text-slate-700 font-medium">{(item.quantity * item.unitPrice).toFixed(2)}</span>
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 py-2">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              + إضافة صنف
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-bold text-slate-900 mb-4">ملاحظات (اختياري)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="أضف ملاحظات على الفاتورة..."
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span>{taxAmount.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-900 border-t pt-2">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? "جاري الإنشاء..." : "إنشاء الفاتورة"}
            </button>
            <Link href="/dashboard" className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition">
              إلغاء
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
