import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-bold text-lg text-slate-800">ZATCA Invoice</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 transition"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              ابدأ مجاناً
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium mb-6">
            متوافق مع هيئة الزكاة والضريبة 🇸🇦
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            فواتير ضريبية
            <br />
            <span className="text-emerald-600">في ثوانٍ</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            ولّد فواتيرك الإلكترونية المتوافقة مع ZATCA بسهولة.
            <br />
            QR Code تلقائي، حساب الضريبة، وتصدير PDF.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
            >
              ابدأ مجاناً
            </Link>
            <Link
              href="#features"
              className="text-slate-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-slate-100 transition"
            >
              تعرف على المزيد
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            لماذا تختارنا؟
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">سريع وسهل</h3>
              <p className="text-slate-600">
                أنشئ فاتورتك في أقل من 30 ثانية. واجهة بسيطة باللغة العربية.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                متوافق مع ZATCA
              </h3>
              <p className="text-slate-600">
                فواتير متوافقة 100% مع متطلبات هيئة الزكاة والضريبة والفاتورة الإلكترونية.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">آمن وموثوق</h3>
              <p className="text-slate-600">
                بياناتك محفوظة بأمان. تصدير PDF و Excel في أي وقت.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            خطط الأسعار
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold text-slate-900 mb-2">مجاني</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">
                $0<span className="text-lg text-slate-500">/شهر</span>
              </div>
              <ul className="space-y-2 text-slate-600 mb-6">
                <li>✓ 5 فواتير/شهر</li>
                <li>✓ QR Code</li>
                <li>✓ تصدير PDF</li>
              </ul>
              <Link
                href="/register"
                className="block text-center border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
              >
                ابدأ مجاناً
              </Link>
            </div>

            {/* Basic */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm">
                الأكثر شعبية
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">أساسي</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">
                $9.99<span className="text-lg text-slate-500">/شهر</span>
              </div>
              <ul className="space-y-2 text-slate-600 mb-6">
                <li>✓ 100 فاتورة/شهر</li>
                <li>✓ QR Code</li>
                <li>✓ تصدير PDF و Excel</li>
                <li>✓ إدارة العملاء</li>
              </ul>
              <Link
                href="/register"
                className="block text-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                اشترك الآن
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold text-slate-900 mb-2">احترافي</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">
                $24.99<span className="text-lg text-slate-500">/شهر</span>
              </div>
              <ul className="space-y-2 text-slate-600 mb-6">
                <li>✓ فواتير غير محدودة</li>
                <li>✓ كل ميزات الأساسي</li>
                <li>✓ API خاص</li>
                <li>✓ تقارير متقدمة</li>
              </ul>
              <Link
                href="/register"
                className="block text-center border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
              >
                اشترك الآن
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>© 2025 ZATCA Invoice Generator. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
