# Abrar Shop 🛒

A professional, feature-rich E-commerce platform built with modern web technologies, designed for high performance and premium user experience.

[![Live Demo](https://img.shields.io/badge/demo-live-orange?style=for-the-badge)](https://abrarshop.vercel.app/)
[![Status](https://img.shields.io/badge/Status-Develop-green?style=for-the-badge)](#)

## 🌟 Overview

Abrar Shop is a comprehensive e-commerce solution that balances a sophisticated front-end for customers with a robust back-end for administrators. It features a modern dark-themed footer, solid brand identity, and optimized shopping flows.

### [Live Demo 🚀](https://abrarshop.vercel.app/)

---

## ✨ Key Features

### 🛒 Customer Experience
- **Premium UI/UX**: Modern design with interactive elements and smooth transitions.
- **Advanced Filtering**: Filter products by Category, Brand, and Price range.
- **Dynamic Search**: High-performance search functionality to find products instantly.
- **Brand & Category Hubs**: Dedicated pages for browsing by brands and hierarchical categories.
- **Shopping Cart**: Fully functional cart system with state management.
- **Product Details**: Rich product pages with galleries and purchase cards.

### 🔐 Authentication & Security
- **Professional Auth Pages**: Unified and branded Login & Signup experiences.
- **Secure Data Handling**: Integrated Zod validation and safe database interactions.

### 🛠 Administrative Dashboard
- **Product Management**: Create, Read, Update, and Delete products with SKU tracking.
- **Category & Brand Management**: Organize the shop structure efficiently.
- **Real-time Updates**: Instant reflect of administrative changes on the storefront.

---

## 🛠 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 15 (App Router)** | Lead Framework |
| **Drizzle ORM** | Type-safe Database ORM |
| **Neon PostgreSQL** | Serverless SQL Database |
| **Tailwind CSS 4** | Utility-first Styling |
| **Shadcn UI** | High-quality UI Components |
| **Framer Motion** | Fluid Animations |
| **Cloudinary** | Media & Image Management |
| **React Hook Form** | Robust Form Handling |
| **Zod** | Schema Validation |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Neon DB Account (PostgreSQL)
- Cloudinary Account (for image hosting)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sofolitltd/abrarshop-web.git
   cd abrarshop-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_url
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Initialize Database:**
   ```bash
   npm run db:push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
src/
├── app/             # Next.js App Router (Main, Auth, Admin)
├── components/      # Reusable UI Components (Layout, Product, Home, etc.)
├── context/         # React Context Providers (Cart, etc.)
├── lib/             # Utilities, Data Fetching, Table Definitions
├── types/           # Global TypeScript Definitions
└── drizzle/         # Migration Files
```

---

## 🤝 Contact & Support

Developed with ❤️ by **Sofolit**.

- **Organization**: [Sofolit](https://sofolit.vercel.app/)
- **Email**: [sofolitltd@gmail.com](mailto:sofolitltd@gmail.com)
- **Developer Website**: [sofolit.vercel.app](https://sofolit.vercel.app/)

---

## 📄 License

Private Project. All rights reserved by **Abrar Shop**.
