# التقنيات المستخدمة

## البنية التحتية (Cloudflare)

| المكوّن | التقنية | الاستخدام | التكلفة |
|---|---|---|---|
| **Frontend Hosting** | Cloudflare Pages | استضافة الواجهة الأمامية (Next.js) | 🆓 Free |
| **Backend** | Cloudflare Workers | APIs + Business Logic | 🆓 Free (100K req/day) |
| **Database** | Cloudflare D1 | قاعدة بيانات SQL | 🆓 Free (5GB) |
| **ORM** | Drizzle ORM | إدارة قاعدة البيانات | 🆓 Open Source |

## Frontend

| المكوّن | التقنية | الإصدار | الاستخدام |
|---|---|---|---|
| **Framework** | Next.js | 15+ | إطار العمل الرئيسي |
| **UI** | Tailwind CSS | 4+ | التنسيق |
| **UI Components** | shadcn/ui | Latest | مكونات جاهزة |
| **State Management** | React Context / Zustand | - | إدارة الحالة |
| **Forms** | React Hook Form + Zod | - | النماذج والتحقق |

## Backend

| المكوّن | التقنية | الاستخدام |
|---|---|---|
| **Runtime** | Cloudflare Workers | تشغيل APIs |
| **Auth** | better-auth | المصادقة (يعمل على Worker) |
| **Validation** | Zod | التحقق من البيانات |
| **PDF** | @react-pdf/renderer أو pdf-lib | توليد الفواتير PDF |
| **QR Code** | qrcode | توليد QR Code متوافق مع ZATCA |

## الدفع

| المكوّن | التقنية | الاستخدام |
|---|---|---|
| **Payment Gateway** | PayPal | بوابة الدفع الرئيسية |
| **Webhook** | PayPal Webhook | تأكيد الدفع |

## أدوات التطوير

| المكوّن | التقنية | الاستخدام |
|---|---|---|
| **Package Manager** | Bun | إدارة الحزم |
| **TypeScript** | TS 5+ | الأنواع |
| **Linting** | ESLint + Prettier | جودة الكود |
| **Database Migrations** | Drizzle Kit | إدارة تغييرات قاعدة البيانات |
| **Deployment** | Wrangler | النشر على Cloudflare |

## هيكل قاعدة البيانات (D1)

```sql
-- المستخدمون (better-auth يتولى هذا)
-- العملاء
clients (id, user_id, name, email, phone, vat_number, address, created_at)
-- الفواتير
invoices (id, user_id, client_id, invoice_number, items_json, subtotal, tax_amount, total, status, created_at)
-- الاشتراكات
subscriptions (id, user_id, plan, paypal_subscription_id, status, current_period_start, current_period_end)
```

## معمارية المشروع

```
┌─────────────────────────────────────────────────────┐
│                  Cloudflare Pages                    │
│              (Next.js Frontend)                      │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐ │
│  │  Landing │ │ Dashboard│ │ Invoices│ │ Clients │ │
│  └─────────┘ └──────────┘ └─────────┘ └─────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ API Calls
┌──────────────────────▼──────────────────────────────┐
│               Cloudflare Workers                     │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ │
│  │  Auth    │ │ Invoices │ │Clients │ │ PayPal  │ │
│  │(better-  │ │   API    │ │  API   │ │ Webhook │ │
│  │  auth)   │ │          │ │        │ │         │ │
│  └──────────┘ └──────────┘ └────────┘ └─────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                Cloudflare D1                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐│
│  │  users   │ │ clients  │ │      invoices        ││
│  │(better-  │ │          │ │                      ││
│  │  auth)   │ │          │ │                      ││
│  └──────────┘ └──────────┘ └──────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## الأمان

- ✅ better-auth للمصادقة (يعمل على Worker)
- ✅ Zod validation لكل API inputs
- ✅ CORS محدود للدومين الخاص بنا
- ✅ Rate limiting عبر Cloudflare
- ✅ لا نخزّن بيانات PayPal حساسة
