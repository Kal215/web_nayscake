# 🎂 Nay's Cake Website

Modern web application for Nay's Cake, a family-owned wet cake (kue basah) business.

## 📋 Features

- **Landing Page Premium** - Beautiful, animated homepage with Framer Motion
- **Product Catalog** - Online catalog with search and filtering
- **Admin Dashboard** - Complete management for products, suppliers, stock, and sales
- **Stock Management** - Daily stock entry tracking
- **Sales Management** - Transaction recording with automatic profit calculation
- **Reports** - Daily and monthly sales reports
- **WhatsApp Integration** - Direct order via WhatsApp
- **REST API** - API endpoints for WhatsApp Bot integration

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v5 (Auth.js)
- **UI Components:** Custom components with Framer Motion
- **Charts:** Recharts
- **Form Handling:** React Hook Form + Zod
- **Tables:** TanStack Table

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or Neon Cloud)

### Installation

1. **Clone/Download the project**

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**
```bash
cp .env.example .env
```

Edit `.env` file with your database URL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nays_cake?schema=public"
AUTH_SECRET="your-auth-secret-key"
```

4. **Setup Prisma:**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates database tables)
npx prisma migrate dev --name init
```

5. **Seed the database with sample data:**
```bash
npx prisma db seed
```

This will create:
- 1 admin user: `admin@nayscake.com` / `admin123`
- 29 suppliers
- 90+ products with prices

6. **Start the development server:**
```bash
npm run dev
```

7. **Open in browser:**
- Website: http://localhost:3000
- Admin Dashboard: http://localhost:3000/dashboard
- Login: http://localhost:3000/login

## 📁 Project Structure

```
nays-cake/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data script
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # NextAuth routes
│   │   │   └── products/  # Products API
│   │   ├── dashboard/     # Admin dashboard pages
│   │   ├── catalog/       # Public catalog page
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── landing/       # Landing page components
│   │   └── dashboard/     # Dashboard components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Utility functions
│   └── types/             # TypeScript type definitions
└── package.json
```

## 🗄️ Database Schema

### Tables

1. **User** - Admin users for authentication
2. **Supplier** - Supplier master data
3. **Product** - Product master data with prices
4. **StockEntry** - Daily stock in transactions
5. **Sale** - Sales transaction headers
6. **SaleItem** - Sales transaction details
7. **Settings** - Application settings

### ERD

```
┌─────────────┐       ┌─────────────┐       ┌──────────────────┐
│   SUPPLIER  │       │   PRODUCT   │       │   STOCK_ENTRY    │
├─────────────┤       ├─────────────┤       ├──────────────────┤
│ id          │──┐    │ id          │       │ id               │
│ name        │  │    │ supplierId  │◀──────│ productId        │
│ phone       │  └───▶│ name        │       │ date             │
│ address     │       │ slug        │       │ quantityIn       │
│ notes       │       │ costPrice   │       └──────────────────┘
└─────────────┘       │ sellingPrice│              
                      │ category    │       ┌──────────────────┐
                      │ isActive    │       │      SALE        │
                      └─────────────┘       ├──────────────────┤
                              │             │ id               │
                              │             │ saleDate         │
                              │             │ totalAmount      │
                              │             │ totalProfit      │
                              │             └────────┬─────────┘
                              │                      │
                              ▼                      ▼
                      ┌─────────────────────────────────┐
                      │           SALE_ITEM             │
                      ├─────────────────────────────────┤
                      │ id                              │
                      │ saleId                          │
                      │ productId                       │
                      │ supplierId                      │
                      │ quantity                        │
                      │ price                           │
                      │ cost                            │
                      │ profit                          │
                      └─────────────────────────────────┘
```

## 🌐 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Stocks
- `GET /api/stocks` - Get stock entries
- `POST /api/stocks` - Add stock entry

### Reports
- `GET /api/reports/daily` - Daily sales report
- `GET /api/reports/monthly` - Monthly sales report

### Dashboard
- `GET /api/dashboard` - Dashboard summary stats

## 🔐 Authentication

- **Roles:** SUPER_ADMIN, ADMIN
- **Login:** Email + Password
- **Session:** JWT based

Default admin credentials:
- Email: `admin@nayscake.com`
- Password: `admin123`

## 📱 WhatsApp Integration

Products display a "Pesan via WhatsApp" button that opens WhatsApp with a pre-filled message:
```
https://wa.me/6285126023250?text=Halo,%20saya%20mau%20pesan%20[Nama%20Produk]
```

## 🎨 Design System

### Colors
- Primary: Amber/Orange gradient
- Background: Warm cream tones
- Text: Dark gray

### Typography
- Headings: Bold, large sizes
- Body: Clean, readable

### Animations
- Framer Motion for smooth transitions
- Staggered reveals
- Hover effects
- Counter animations

## 📊 Features in Detail

### Stock Calculation
```
Current Stock = Total Stock In - Total Sold
```

### Profit Calculation
```
Profit = (Selling Price - Cost Price) × Quantity Sold
```

### Low Stock Alert
- Yellow badge: Stock ≤ 10
- Red badge: Stock = 0 (Out of Stock)

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables:
   - `DATABASE_URL` - Neon PostgreSQL connection string
   - `AUTH_SECRET` - Auth.js secret
4. Deploy!

### Neon PostgreSQL Setup

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Use as `DATABASE_URL`

## 📝 Notes

- This project is based on analysis of the original `Stok_Barang.xlsx` data
- 29 suppliers and 90+ products pre-loaded via seed
- Designed for easy use by non-tech users
- Mobile-responsive design

## 📄 License

MIT License - Feel free to use for your business!

---

Built with ❤️ for Nay's Cake