
---

## 📄 Inspire Travels Backend – Detailed Documentation

### 📌 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [Authentication & Authorization](#authentication--authorization)
7. [Middlewares](#middlewares)
8. [Models](#models)

   * [User](#1-user-model)
   * [Destination](#2-destination-model)
   * [Booking](#3-booking-model)
   * [Visa](#4-visa-model)
   * [VisaBooking](#5-visabooking-model)
   * [Blog](#6-blog-model)
   * [Invoice](#7-invoice-model)
   * [ContactInfo](#8-contactinfo-model)
9. [Routes](#routes)

   * Auth & Users
   * Destinations
   * Bookings
   * Visas
   * Visa Bookings
   * Blogs
   * Invoices
   * Contact Info
   * Analytics
10. [Utilities](#utilities)
11. [Deployment Notes](#deployment-notes)

---

## Overview

The **Inspire Travels Backend** is a RESTful API built with **Node.js**, **Express**, and **MongoDB** (via Mongoose) for managing a complete travel platform.
It handles authentication, bookings, visas, blogs, invoicing, and analytics, with role-based access control and cloud storage integration via **Cloudinary**.

---

## Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB + Mongoose ODM
* **Authentication:** JWT + Firebase Auth
* **File Uploads:** Multer + Cloudinary
* **PDF Generation:** pdfkit
* **Data Export:** json2csv
* **Environment Management:** dotenv

---

## Folder Structure

```
Backend/
├── config/
│   ├── cloudinary.js       # Cloudinary config & image upload helpers
│   ├── db.js               # MongoDB connection
│   ├── firebase-admin.js   # Firebase Admin SDK config
│
├── middlewares/
│   ├── authMiddleware.js   # JWT/Firebase auth & role verification
│   ├── uploadMiddleware.js # Multer memory storage for file uploads
│
├── models/                 # All Mongoose schemas
│   ├── User.js
│   ├── Destination.js
│   ├── Booking.js
│   ├── Visa.js
│   ├── VisaBooking.js
│   ├── Blog.js
│   ├── Invoice.js
│   ├── ContactInfo.js
│
├── routes/                 # Express route definitions
│   ├── analyticsRoutes.js
│   ├── blogRoutes.js
│   ├── bookingRoutes.js
│   ├── contactInfoRoutes.js
│   ├── destinationRoutes.js
│   ├── invoiceRoutes.js
│   ├── userRoutes.js
│   ├── visaBookingRoutes.js
│   ├── visaRoutes.js
│
├── utils/
│   ├── authUtils.js        # JWT generation
│
├── server.js               # Main Express app entry
└── package.json
```

---

## Installation & Setup

```bash
# Install dependencies
npm install

# Create and fill .env file
cp .env.example .env

# Start development server
npm run dev

# Start production
npm start
```

---

## Environment Variables

| Variable                | Description                             |
| ----------------------- | --------------------------------------- |
| `MONGO_URI`             | MongoDB connection string               |
| `JWT_SECRET`            | Secret key for JWT                      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                   |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                   |
| `FIREBASE_PROJECT_ID`   | Firebase project ID                     |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email                   |
| `FIREBASE_PRIVATE_KEY`  | Firebase private key (escaped newlines) |

---

## Authentication & Authorization

The backend uses **two authentication strategies**:

1. **Firebase Auth** for verifying identity from the frontend's Firebase login.
2. **JWT** for securing API routes after user creation.

**Role-based access control**:

* `admin` – Full access to all resources
* `moderator` – Can manage blogs, moderate bookings
* `employee` – Can handle bookings, visas, invoices
* `customer` – Default role; can make bookings, read blogs, etc.

---

## Middlewares

### `authMiddleware.js`

* `verifyFirebaseToken` – Validates Firebase ID token from `Authorization` header.
* `verifyUser` – Validates JWT from cookies or header.
* `verifyRole(...roles)` – Grants access only if `req.user.role` matches allowed roles.

### `uploadMiddleware.js`

* Configures **Multer** for **in-memory** storage.
* Restricts file types to `jpeg|jpg|png|webp`.
* Max file size: **5MB**.

---

## Models

### 1. User Model

| Field                   | Type   | Required | Notes                                              |
| ----------------------- | ------ | -------- | -------------------------------------------------- |
| `name`                  | String | No       |                                                    |
| `email`                 | String | Yes      | Unique                                             |
| `phone`                 | String | No       |                                                    |
| `address`               | String | No       |                                                    |
| `passportNumber`        | String | No       |                                                    |
| `profileImage.url`      | String | No       | Cloudinary URL                                     |
| `profileImage.publicId` | String | No       | Cloudinary ID                                      |
| `role`                  | String | No       | Enum: `customer`, `admin`, `moderator`, `employee` |
| `firebaseUid`           | String | Yes      | Unique Firebase UID                                |

Indexes: `{ name, email, phone, passportNumber, firebaseUid, role, createdAt }`

---

### 2. Destination Model

Handles travel packages with details like pricing, amenities, and images.

**Key Fields**:

* `title` (String, required)
* `summary` (String, max 150 chars)
* `description` (String, required)
* `location.from` / `location.to`
* `pricing.basePrice`, `pricing.discountedPrice`
* `duration.days`, `duration.nights`
* `images` (Cloudinary objects)
* `status` (`draft`, `active`, `inactive`)

**Virtuals**:

* `discountPercentage` – Auto-calculated.

---

### 3. Booking Model

Stores trip bookings.

**Key Fields**:

* `destination` (ObjectId → Destination)
* `user` (ObjectId → User)
* `fullName`, `email`, `phone`
* `travelDate`
* `numberOfTravelers` { adults, children }
* `pricing` { basePrice, discountedPrice, totalPrice, paymentStatus }
* `status` (`pending`, `confirmed`, `cancelled`, `completed`)

Indexes: `{ user, destination, status, pricing.paymentStatus }`

---

### 4. Visa Model

Manages visa service packages.

Fields:

* `title`, `slug`
* `shortDescription`, `description`
* `pricing.basePrice`, `discountedPrice`, `currency`
* `from`, `to` (countries)
* `featured`, `isActive`
* `requirements`, `processingTime`

Virtuals:

* `formattedPrice`, `formattedDiscountedPrice`, `discountPercentage`

---

### 5. VisaBooking Model

Stores visa service bookings.

Fields:

* `visa` (ObjectId → Visa)
* `user` (ObjectId → User)
* `firstName`, `lastName`
* `nationality`, `passportNumber`
* `travelDate`
* `pricing` { basePrice, discountedPrice, totalPrice, paymentStatus }
* `status` (`pending`, `processing`, `approved`, `rejected`, `completed`)

---

### 6. Blog Model

Blog articles with author reference.

Fields:

* `title`, `slug`
* `summary`, `content`
* `author` (User)
* `coverImage`, `images`
* `categories`, `tags`
* `status` (`draft`, `published`, `archived`)
* `isFeatured`, `viewCount`, `readTime`

Hooks:

* Pre-save slug generation & uniqueness.
* Auto-read time calculation.

---

### 7. Invoice Model

Tracks billing for bookings and visas.

Fields:

* `invoiceNumber` (auto-generated: `INV-YYMM-####`)
* `customer` { name, email, phone, address }
* `items[]` { name, quantity, unitPrice, discount, tax, total }
* `totalAmount`, `paidAmount`, `dueAmount`
* `status` (`draft`, `sent`, `paid`, etc.)
* `relatedTo` (`custom`, `booking`, `visa`)

Hooks:

* Auto-calculates dueAmount & status before save.

---

### 8. ContactInfo Model

Stores company details.

Fields:

* `companyName`, `address`, `phoneNumbers[]`, `emailAddresses[]`
* `websiteUrl`, `socialMediaLinks`, `mapEmbedUrl`
* `officeHours[]`, `termsAndConditions[]`

---
## ## 📡 Routes

### **1. User & Auth Routes** (`/api/users/...`)

> Handles user creation, retrieval, role updates, and authentication.

---

#### **POST** `/api/users`

**Description:** Create a new user from Firebase login.
**Access:** Public (called immediately after Firebase signup)

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "firebaseUid": "firebase_uid_here",
  "role": "customer"
}
```

**Success Response:**

```json
{
  "success": true,
  "user": {
    "_id": "66aa0f123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

#### **GET** `/api/users/profile`

**Description:** Get logged-in user profile.
**Access:** Private (Any logged-in user)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response:**

```json
{
  "success": true,
  "user": {
    "_id": "66aa0f123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

#### **PATCH** `/api/users/:id/role`

**Description:** Update a user's role.
**Access:** Private (Admin only)

**Request Body:**

```json
{
  "role": "employee"
}
```

---

### **2. Destination Routes** (`/api/destinations/...`)

---

#### **GET** `/api/destinations`

**Description:** Get all destinations with filters and pagination.
**Access:** Public

**Query Params:**

```
?search=Paris&category=Europe&minPrice=1000&maxPrice=2000&page=1&limit=10
```

**Response Example:**

```json
{
  "destinations": [
    {
      "_id": "66aa1f123...",
      "title": "Paris Getaway",
      "pricing": { "basePrice": 1500, "discountedPrice": 1200 },
      "duration": { "days": 5, "nights": 4 }
    }
  ],
  "pagination": { "totalPages": 5, "currentPage": 1, "total": 50 }
}
```

---

#### **POST** `/api/destinations`

**Description:** Create a destination.
**Access:** Private (Admin, Moderator, Employee)

**Form Data Fields:**

```
title: "Paris Getaway"
summary: "Romantic trip"
description: "5 nights in Paris"
pricing.basePrice: 1500
pricing.discountedPrice: 1200
images[]: (file)
```

---

### **3. Booking Routes** (`/api/bookings/...`)

---

#### **POST** `/api/bookings`

**Description:** Create a new booking for a destination.
**Access:** Private (Customer)

**Request Body:**

```json
{
  "destination": "66aa1f123...",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "travelDate": "2025-09-01",
  "numberOfTravelers": { "adults": 2, "children": 1 },
  "pricing": {
    "basePrice": 1500,
    "discountedPrice": 1200,
    "totalPrice": 3600
  }
}
```

**Response:**

```json
{
  "success": true,
  "booking": { "_id": "66aa2f123...", "status": "pending" }
}
```

---

#### **GET** `/api/bookings/my`

**Description:** Get bookings of the logged-in user.
**Access:** Private (Customer)

---

### **4. Visa Routes** (`/api/visas/...`)

---

#### **GET** `/api/visas`

**Description:** List visa packages with filters.
**Access:** Public

**Query Params Example:**

```
?from=Bangladesh&to=Canada&featured=true
```

---

#### **POST** `/api/visas`

**Description:** Create a visa package.
**Access:** Private (Admin, Moderator, Employee)
**Form Data:** Similar to destinations.

---

### **5. Visa Booking Routes** (`/api/visa-bookings/...`)

---

#### **POST** `/api/visa-bookings`

**Description:** Create a new visa booking.
**Access:** Private (Customer)

---

#### **GET** `/api/visa-bookings/my`

**Description:** Get logged-in user's visa bookings.
**Access:** Private (Customer)

---

### **6. Blog Routes** (`/api/blogs/...`)

---

#### **GET** `/api/blogs`

**Description:** Get blogs with pagination, search, filter.
**Access:** Public

---

#### **POST** `/api/blogs`

**Description:** Create a blog post.
**Access:** Private (Admin, Moderator)
**Form Data:**

```
title: "Top 10 Destinations"
summary: "List of destinations..."
content: "<html>...</html>"
categories: ["Travel"]
tags: ["Europe", "Summer"]
coverImage: (file)
images[]: (file)
```

---

### **7. Invoice Routes** (`/api/invoices/...`)

---

#### **POST** `/api/invoices`

**Description:** Create an invoice.
**Access:** Private (Admin, Employee)

---

#### **GET** `/api/invoices/:id/pdf`

**Description:** Download invoice PDF.
**Access:** Private (Admin, Employee)

---

### **8. Contact Info Routes** (`/api/contact-info/...`)

---

#### **GET** `/api/contact-info`

**Description:** Fetch company contact info.
**Access:** Public

#### **PUT** `/api/contact-info`

**Description:** Update contact info.
**Access:** Private (Admin)

---

### **9. Analytics Routes** (`/api/analytics/...`)

---

#### **GET** `/api/analytics/dashboard-summary`

**Description:** Get counts and revenue stats for dashboard.
**Access:** Private (Admin, Moderator, Employee)

---

#### **GET** `/api/analytics/monthly-revenue`

**Description:** Get revenue trend for a year.
**Access:** Private (Admin, Moderator, Employee)
**Query:**

```
?year=2025
```

---

#### **GET** `/api/analytics/user-growth`

**Description:** Get monthly new user count & cumulative growth.
**Access:** Private (Admin, Moderator, Employee)

---

#### **GET** `/api/analytics/blog-performance`

**Description:** Get top blogs by views & views per category.
**Access:** Private (Admin, Moderator, Employee)

---

#### **GET** `/api/analytics/recent-activity`

**Description:** Get latest bookings, invoices, users, blogs.
**Access:** Private (Admin, Moderator, Employee)

---

## 🛠 Utilities

### **`utils/authUtils.js`**

* **Purpose:** JWT token generation and management.
* **Functions:**

  * `generateToken(userId)`

    * Signs a JWT with `userId` payload.
    * Expires based on `.env` config.
    * Used after Firebase authentication to issue a backend token.

---

## 🚀 Deployment Notes

### **Local Development**

1. Clone repository:

   ```bash
   git clone https://github.com/username/inspire-travels.git
   cd Backend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create `.env` file based on `.env.example`:

   ```ini
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/inspire-travels
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
4. Start the server in dev mode:

   ```bash
   npm run dev
   ```

---

### **Production Deployment**

* **Hosting Options:** Vercel, Render, Railway, or self-hosted Node server.
* **Database:** Use MongoDB Atlas for managed MongoDB hosting.
* **Image Hosting:** Ensure Cloudinary credentials are in production env variables.
* **Security:**

  * Always use `https` in production.
  * Store JWT secret securely.
  * Restrict Cloudinary API key usage.
* **Scaling:**

  * Use PM2 or a process manager for production.
  * Enable MongoDB indexes (already defined in models).

---

## 📊 API Response Standards

All API responses follow a **consistent structure**:

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error if available"
}
```

---

## 🔐 Role-Based Access Summary

| Role          | Destinations | Bookings | Visas     | Visa Bookings | Blogs | Invoices | Contact Info | Analytics |
| ------------- | ------------ | -------- | --------- | ------------- | ----- | -------- | ------------ | --------- |
| **Admin**     | Full CRUD    | Full     | Full      | Full          | Full  | Full     | Full         | Full      |
| **Moderator** | Read/Edit    | Limited  | Read/Edit | Read/Edit     | Full  | None     | None         | Full      |
| **Employee**  | Read/Edit    | Full     | Full      | Full          | None  | Full     | None         | Full      |
| **Customer**  | Read Only    | Own Only | Read      | Own Only      | Read  | None     | None         | None      |

---

## ✅ Backend Summary

The **Inspire Travels backend** is:

* Fully RESTful with clean, modular routing.
* Secured with **Firebase authentication + JWT**.
* Optimized for **role-based access control**.
* Integrated with **Cloudinary** for image management.
* Supports **advanced analytics** for admins.
* Uses **Mongoose virtuals & indexes** for performance.

---

# 🎨 Inspire Travels – Frontend Documentation

## 📌 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [Routing Structure](#routing-structure)
7. [Authentication Flow](#authentication-flow)
8. [State Management](#state-management)
9. [Components](#components)
10. [Pages](#pages)
11. [API Integration](#api-integration)
12. [Styling](#styling)
13. [Deployment Notes](#deployment-notes)

---

## 📖 Overview

The **Inspire Travels Frontend** is a **React (Vite)** application that serves as the client-facing interface for the Inspire Travels travel management platform. It provides:

* A **customer-facing site** to explore destinations, book trips, apply for visas, read blogs, and contact the company.
* An **admin dashboard** for managing users, destinations, bookings, visas, blogs, invoices, and analytics.

It communicates with the **backend API** (documented separately) via secure HTTPS requests and implements **Firebase Authentication** for login.

---

## 🛠 Tech Stack

* **Framework:** React (Vite)
* **Routing:** React Router DOM
* **State Management:** Context API + React Query (TanStack Query)
* **Auth:** Firebase Authentication
* **HTTP Client:** Axios (with interceptors for token refresh)
* **UI Library:** Tailwind CSS + shadcn/ui components
* **Icons:** Lucide-react / Heroicons
* **Forms:** React Hook Form + Zod validation
* **Charts:** Recharts (used in dashboard analytics)

---

## 📂 Folder Structure

```
Frontend/
├── public/                   # Static assets
├── src/
│   ├── assets/               # Images, icons
│   ├── components/           # Reusable components (Navbar, Footer, Forms, Modals, etc.)
│   ├── context/               # AuthContext, UI context
│   ├── hooks/                 # Custom hooks (useAuth, useAxiosSecure, etc.)
│   ├── layouts/               # Layout components (MainLayout, DashboardLayout)
│   ├── pages/
│   │   ├── Home/              # Landing page
│   │   ├── Destinations/      # Destination listing & details
│   │   ├── Bookings/          # Booking form & confirmation
│   │   ├── Visas/             # Visa listing & details
│   │   ├── Blogs/             # Blog listing & details
│   │   ├── Dashboard/         # Admin dashboard
│   │   ├── Auth/              # Login, Register
│   │   └── Error/             # 404 & error pages
│   ├── routes/                # Route definitions & role-based guards
│   ├── services/              # API functions (users, bookings, visas, etc.)
│   ├── styles/                # Global styles
│   ├── utils/                 # Helpers & constants
│   ├── App.jsx                # App entry with routes
│   └── main.jsx               # ReactDOM entry
├── .env.example
├── package.json
└── vite.config.js
```

---

## ⚙ Installation & Setup

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start development
npm run dev

# Build for production
npm run build
```

---

## 🔑 Environment Variables

| Variable                            | Description             |
| ----------------------------------- | ----------------------- |
| `VITE_BACKEND_URL`                  | Backend API base URL    |
| `VITE_FIREBASE_API_KEY`             | Firebase API key        |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth domain    |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase Project ID     |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID      |
| `VITE_FIREBASE_APP_ID`              | Firebase App ID         |

---

## 🗺 Routing Structure

Example route hierarchy:

```
/                  → HomePage
/destinations      → DestinationList
/destinations/:id  → DestinationDetails
/bookings          → BookingForm (Protected)
/visas             → VisaList
/visas/:id         → VisaDetails
/visa-bookings     → VisaBookingForm (Protected)
/blogs             → BlogList
/blogs/:slug       → BlogDetails
/login             → LoginPage
/dashboard         → DashboardLayout (Protected + Role-based)
  /users
  /bookings
  /visas
  /blogs
  /invoices
  /analytics
```

---

## 🔐 Authentication Flow

1. **User logs in with Firebase Auth** (Google or Email/Password).
2. Firebase returns an **ID token**.
3. Frontend sends ID token to backend `/api/users` to register/get user.
4. Backend responds with a **JWT access token** (stored in HttpOnly cookie).
5. Axios interceptors attach JWT to protected requests.
6. On token expiry, Axios calls `/refresh-token` to get a new one.

---

## 📦 State Management

* **AuthContext**: Stores `user`, `loading`, and auth methods.
* **React Query**:

  * Caches API responses for destinations, blogs, visas, etc.
  * Automatic refetching on focus or invalidation.
* **AxiosSecure Hook**: Configures axios with JWT + refresh handling.

---

## 🧩 Components

**Key reusable components:**

* `Navbar` – Navigation bar with auth-aware links.
* `Footer` – Contact & social links.
* `HeroSection` – Home page hero banner.
* `Card` – Destination/visa/blog card layout.
* `Form` – Form components integrated with React Hook Form.
* `Modal` – Generic modal with children support.
* `DashboardSidebar` – Navigation for dashboard sections.
* `ProtectedRoute` – Wraps routes that require login/role.

---

## 📄 Pages

**Customer-facing pages:**

* Home – Featured destinations, blogs, and call-to-action.
* Destinations – Browse/filter destinations.
* DestinationDetails – Booking form & trip details.
* Visas – Browse visa packages.
* Blogs – Articles list and detail view.
* Contact – Contact info and form.

**Dashboard pages (role-based):**

* Users – Manage roles & profiles.
* Destinations – CRUD destinations.
* Bookings – View & manage bookings.
* Visas – CRUD visas.
* Visa Bookings – Manage visa requests.
* Blogs – Manage posts.
* Invoices – Create & download invoices.
* Analytics – Charts & recent activity.

---

## 🌐 API Integration

* **`services/`** directory contains grouped API calls:

  * `userService.js` – login, getProfile, updateRole
  * `destinationService.js` – getDestinations, createDestination
  * `bookingService.js` – createBooking, getMyBookings
  * `visaService.js` – getVisas, createVisa
  * `blogService.js` – getBlogs, createBlog
  * `invoiceService.js` – createInvoice, downloadPDF
* All API calls use `axiosSecure` for token handling.

---

## 🎨 Styling

* **Tailwind CSS** for utility classes.
* **shadcn/ui** for pre-styled, accessible components.
* **Custom theme** in `tailwind.config.js` for brand colors.
* Responsive design with mobile-first approach.

---

## 🚀 Deployment Notes

* **Hosting Options:** Vercel / Netlify / Firebase Hosting.
* **Build Command:** `npm run build`
* **Output Directory:** `dist/`
* Ensure `.env` variables are set in hosting provider dashboard.
* Backend API URL must be accessible via HTTPS in production.
* Use Firebase domain whitelist to allow auth.

---

✅ **Frontend Summary:**
The Inspire Travels frontend is a **responsive, role-based web app** built with modern React tooling, providing a seamless travel booking and management experience. It integrates tightly with the backend API, Firebase Auth, and Cloudinary-hosted media.

---