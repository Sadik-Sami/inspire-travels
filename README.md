# Inspire Travels

## Project Overview

Inspire Travels (also referred to as SureTrip Travels in the code) is a full-stack travel management application. It allows users to browse destinations, book trips, apply for visas, read blogs, manage bookings, and handle administrative tasks like creating invoices and analytics.

- **Backend**: Built with Node.js, Express.js, MongoDB (using Mongoose), and integrates with Cloudinary for image uploads, Firebase for authentication, and JWT for session management.
- **Frontend**: Built with React.js, using Vite for bundling, Tailwind CSS for styling, and various UI libraries like ShadCN/UI. It includes user authentication, protected routes, and dynamic pages for bookings, visas, blogs, etc.

The application supports roles: customer, admin, moderator, employee. Admins have full access, while customers can book and view content.

Key features:
- User authentication (Firebase + JWT).
- Destination and visa management.
- Booking system for trips and visas.
- Blogging platform.
- Invoice generation and analytics.
- Contact info management.

This README provides detailed setup instructions, architecture overviews, and API/model details for the backend, as well as component/page structures for the frontend.

---

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Firebase account (for authentication)
- Cloudinary account (for image storage)
- Environment variables (see `.env` examples below)

---

## Installation

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd inspire-travels
   ```

2. **Backend Setup**:
   - Navigate to `Backend` folder.
   - Install dependencies:
     ```
     npm install
     ```
   - Create `.env` file in `Backend` with the following:
     ```
     MONGO_URI=mongodb://localhost:27017/inspiretravels  # or MongoDB Atlas URI
     JWT_SECRET=your_jwt_secret_key
     CLOUDINARY_CLOUD_NAME=your_cloudinary_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     FIREBASE_PROJECT_ID=your_firebase_project_id
     FIREBASE_CLIENT_EMAIL=your_firebase_client_email
     FIREBASE_PRIVATE_KEY="your_private_key_with_newlines"
     PORT=5000  # Optional, default 5000
     ```
   - Run the server:
     ```
     npm run dev  # Development with Nodemon
     npm start    # Production
     ```

3. **Frontend Setup**:
   - Navigate to `Frontend` folder.
   - Install dependencies:
     ```
     npm install
     ```
   - Create `.env` file in `Frontend` (if needed for API base URL, but defaults to localhost:5000).
   - Run the app:
     ```
     npm run dev  # Development server
     ```

4. **Database Setup**:
   - Ensure MongoDB is running.
   - The backend will auto-connect on startup.
   - Seed data: No built-in seeder; create via API or admin panel.

5. **Deployment Notes**:
   - Backend: Deploy to Vercel (vercel.json provided). Use environment variables in Vercel dashboard.
   - Frontend: Deploy to Netlify/Vercel. Set build command to `npm run build`.
   - For Vercel backend: Ensure `vercel.json` handles rewrites correctly.

---

## Backend Documentation

The backend is an Express.js API server. It uses Mongoose for MongoDB interactions, Multer for file uploads (memory storage), Cloudinary for image processing, Firebase Admin for token verification, and JWT for auth tokens.

### Dependencies
- Express: Web framework
- Mongoose: ODM for MongoDB
- Cloudinary & Streamifier: Image upload/processing
- Firebase-Admin: Token verification
- JWT: Authentication
- Multer: File handling
- Dotenv: Environment variables
- Others: Bcryptjs (unused in code), Cors, Cookie-Parser, Json2csv (for exports), Nodemon (dev), PDFKit (invoices), Slugify

### Folder Structure
- `config/`: Database connection, Cloudinary setup, Firebase config.
- `middlewares/`: Auth (JWT/Firebase verification, role checks), Upload (Multer config).
- `models/`: Mongoose schemas (detailed below).
- `routes/`: API endpoints (detailed below).
- `utils/`: Auth utilities (e.g., JWT generation).
- `server.js`: Entry point.

### Authentication Flow
- Firebase handles user signup/login (frontend).
- Backend verifies Firebase ID token via `/auth/firebase` (middleware: `verifyFirebaseToken`).
- Generates JWT token stored in cookies.
- Protected routes use `verifyUser` middleware + `verifyRole` for role checks.
- Roles: customer (default), admin, moderator, employee.

### Models
Each model is a Mongoose schema with timestamps enabled. Details include fields, types, validations, defaults, virtuals, indexes, and pre-save hooks.

#### 1. Blog (models/Blog.js)
   - **Purpose**: Manages blog posts for travel tips, news, etc.
   - **Schema Fields**:
     - `title`: String, required, trimmed.
     - `slug`: String, unique, lowercase (auto-generated from title).
     - `summary`: String, required, trimmed, max 500 chars.
     - `content`: String, required.
     - `author`: ObjectId (ref: User), required.
     - `coverImage`: { url: String, public_id: String }.
     - `images`: Array of { url: String, public_id: String }.
     - `categories`: Array of String, default [].
     - `tags`: Array of String, default [].
     - `status`: Enum ['draft', 'published', 'archived'], default 'draft'.
     - `isFeatured`: Boolean, default false.
     - `viewCount`: Number, default 0.
     - `readTime`: Number, default 0 (auto-calculated from content word count).
   - **Virtuals/Methods**:
     - Pre-save: Generates slug from title (handles uniqueness with suffixes). Calculates readTime (words / 200).
   - **Indexes**:
     - Text index on title, summary, content, categories, tags (for search).
   - **Notes**: Only published blogs are visible to users.

#### 2. Booking (models/Booking.js)
   - **Purpose**: Handles trip bookings linked to destinations.
   - **Schema Fields**:
     - `destination`: ObjectId (ref: Destination), required.
     - `user`: ObjectId (ref: User), required.
     - `fullName`: String, required, trimmed.
     - `email`: String, required, trimmed, lowercase.
     - `phone`: String, required, trimmed.
     - `travelDate`: Date, required.
     - `numberOfTravelers`: { adults: Number (min 1, default 1), children: Number (min 0, default 0) }.
     - `specialRequests`: String, trimmed.
     - `dietaryRestrictions`: Array of String, default [].
     - `pricing`: { basePrice: Number (required), discountedPrice: Number (required), totalPrice: Number (required), currency: String (default 'USD'), paymentStatus: Enum ['pending', 'paid', 'refunded', 'cancelled'] (default 'pending') }.
     - `status`: Enum ['pending', 'confirmed', 'cancelled', 'completed'], default 'pending'.
     - `destinationDetails`: { title: String, location: String, duration: { days: Number, nights: Number }, image: String } (snapshot for reference).
   - **Indexes**:
     - { user: 1, createdAt: -1 } (user bookings history).
     - { destination: 1 } (per destination).
     - { status: 1 }.
     - { 'pricing.paymentStatus': 1 }.

#### 3. ContactInfo (models/ContactInfo.js)
   - **Purpose**: Single document for company contact details (assumed one instance).
   - **Schema Fields**:
     - `companyName`: String, trimmed, default 'SureTrip Travels'.
     - `address`: { street: String, city: String, state: String, zipCode: String, country: String } (all trimmed).
     - `phoneNumbers`: Array of { label: String (default 'Main'), number: String (required) }.
     - `emailAddresses`: Array of { label: String (default 'General'), email: String (required, lowercase) }.
     - `websiteUrl`: String, trimmed.
     - `socialMediaLinks`: { facebook: String, twitter: String, instagram: String, linkedin: String, youtube: String } (all trimmed).
     - `mapEmbedUrl`: String, trimmed (Google Maps embed).
     - `officeHours`: Array of { days: String (required), hours: String (required) }.
     - `termsAndConditions`: Array of { title: String (required), content: String (required) }.
     - `additionalInfo`: String, trimmed.
     - `lastUpdatedBy`: ObjectId (ref: User).
   - **Notes**: Application logic ensures only one document; no unique key enforced in schema.

#### 4. Destination (models/Destination.js)
   - **Purpose**: Manages travel packages/destinations.
   - **Schema Fields**:
     - `title`: String, required, trimmed.
     - `summary`: String, required, trimmed, max 150 chars.
     - `description`: String, required, trimmed.
     - `location`: { from: String (required), to: String (required), address: String, mapLink: String }.
     - `pricing`: { basePrice: Number (required, min 0), discountedPrice: Number (min 0), currency: Enum ['USD', 'EUR', ...] (default 'USD'), priceType: Enum ['perPerson', ...] (default 'perPerson') }.
     - `duration`: { days: Number (required, min 1), nights: Number (min 0, default 0), flexible: Boolean (default false) }.
     - `dates`: { startDate: Date, endDate: Date, availableDates: [Date], bookingDeadline: Date }.
     - `transportation`: { included: Boolean (default true), type: Enum ['flight', ...] (default 'flight'), details: String }.
     - `accommodation`: { type: Enum ['hotel', ...] (default 'hotel'), rating: Number (1-5, default 3), details: String }.
     - `meals`: { included: Boolean (default true), details: String }.
     - `groupSize`: { min: Number (default 1, min 1), max: Number (default 20, min 1), privateAvailable: Boolean (default false) }.
     - `activities`: [String].
     - `advantages`: [String], required (min 1).
     - `features`: [String], required (min 1).
     - `amenities`: Object with Booleans (wifi, pool, etc., default false).
     - `categories`: [String].
     - `images`: Array of { public_id: String, url: String }.
     - `isFeatured`: Boolean, default false.
     - `isPopular`: Boolean, default false.
     - `status`: Enum ['draft', 'active', 'inactive'], default 'draft'.
     - `createdBy`: ObjectId (ref: User), required.
   - **Virtuals**:
     - `discountPercentage`: Calculated as round((base - discounted)/base * 100).
   - **Indexes**:
     - Text on title, summary, description, location.from/to.

#### 5. Invoice (models/Invoice.js)
   - **Purpose**: Manages invoices for bookings/visas/custom.
   - **Schema Fields**:
     - `invoiceNumber`: String, required, unique (auto-generated: INV-YYMM-SEQUENCE).
     - `customer`: { name: String (required), email: String (required), phone: String (required), address: String }.
     - `items`: Array of { name: String (required), description: String, quantity: Number (min 1), unitPrice: Number (min 0), discount: Number (0-100), tax: Number (min 0), total: Number (required) }.
     - `subtotal`: Number, required.
     - `totalDiscount`: Number, default 0.
     - `additionalDiscount`: Number (0-100, default 0).
     - `totalTax`: Number, default 0.
     - `totalAmount`: Number, required.
     - `paidAmount`: Number, default 0.
     - `dueAmount`: Number, required.
     - `issueDate`: Date, required, default now.
     - `dueDate`: Date, required.
     - `status`: Enum ['draft', 'sent', 'paid', ...], default 'draft'.
     - `notes`: String.
     - `terms`: String, default standard text.
     - `currency`: Enum ['USD', ...], default 'USD'.
     - `relatedTo`: { type: Enum ['custom', 'booking', 'visa'] (default 'custom'), bookingId: ObjectId (ref: Booking), visaBookingId: ObjectId (ref: VisaBooking) }.
     - `invoicer`: { name: String (required), userId: ObjectId (ref: User, required) }.
     - `updateHistory`: Array of update logs (updater, notes, status changes, etc.).
   - **Statics**:
     - `generateInvoiceNumber()`: Async, generates unique number based on month/year.
   - **Pre-save**: Recalculates dueAmount, updates status based on paidAmount/dueDate.

#### 6. User (models/User.js)
   - **Purpose**: User accounts, linked to Firebase UID.
   - **Schema Fields**:
     - `name`: String, trimmed.
     - `email`: String, required, unique, lowercase, trimmed.
     - `phone`: String, trimmed.
     - `address`: String, trimmed.
     - `passportNumber`: String, trimmed.
     - `profileImage`: { url: String (default ''), publicId: String (default '') }.
     - `role`: Enum ['customer', 'admin', 'moderator', 'employee'], default 'customer'.
     - `firebaseUid`: String, required, unique.
   - **Indexes**:
     - On name, email, phone, passportNumber, firebaseUid, role, createdAt (-1).

#### 7. Visa (models/Visa.js)
   - **Purpose**: Visa package management.
   - **Schema Fields**:
     - `title`: String, required, trimmed, indexed.
     - `slug`: String, unique, lowercase, indexed (auto-generated).
     - `shortDescription`: String, required, trimmed, indexed.
     - `description`: String, required, trimmed.
     - `pricing`: { basePrice: Number (required, min 0), discountedPrice: Number (default base, min 0), currency: Enum ['USD', ...] (default 'USD') }.
     - `images`: Array of { url: String, publicId: String, alt: String }.
     - `coverImage`: { url: String, publicId: String, alt: String }.
     - `isActive`: Boolean, default true, indexed.
     - `requirements`: String, trimmed.
     - `processingTime`: String, trimmed.
     - `specialRequests`: String, trimmed.
     - `from`: String, required, trimmed, indexed.
     - `to`: String, required, trimmed, indexed.
     - `featured`: Boolean, default false, indexed.
   - **Virtuals**:
     - `formattedPrice`: `${symbol}${basePrice}`.
     - `formattedDiscountedPrice`: Similar for discounted.
     - `discountPercentage`: Calculated similarly to Destination.
   - **Indexes**:
     - Compound: { title:1, from:1, to:1, isActive:1 }, { featured:1, isActive:1 }.

#### 8. VisaBooking (models/VisaBooking.js)
   - **Purpose**: Handles visa applications/bookings.
   - **Schema Fields**:
     - `visa`: ObjectId (ref: Visa), required.
     - `user`: ObjectId (ref: User), required.
     - `firstName`: String, required, trimmed.
     - `lastName`: String, required, trimmed.
     - `email`: String, required, trimmed, lowercase.
     - `phone`: String, required, trimmed.
     - `nationality`: String, required, trimmed.
     - `passportNumber`: String, required, trimmed.
     - `travelDate`: Date, required.
     - `specialRequests`: String, trimmed.
     - `pricing`: Similar to Booking.pricing.
     - `status`: Enum ['pending', 'processing', 'approved', 'rejected', 'completed'], default 'pending'.
     - `visaDetails`: Snapshot { title, from, to, processingTime, image }.
   - **Indexes**:
     - Similar to Booking: user/createdAt, visa, status, paymentStatus.

### Routes & API Endpoints
All routes are under `/api`. Protected routes require JWT in cookies or Authorization header.

#### Analytics Routes (/routes/analyticsRoutes.js)
- **Base: /api/analytics**
- Protected: All (admin/moderator/employee).
- `GET /dashboard-summary`: Returns aggregated stats (users, bookings, visas, invoices, blogs).
  - Req: None.
  - Res: 200 { success: true, data: { users: {...}, bookings: {...}, ... } } or 500 error.
- `GET /monthly-revenue`: Monthly revenue trends by year (query: year=YYYY).
  - Req: Query { year? }.
  - Res: 200 { success: true, data: [monthly objects], year } or 500.

#### Blog Routes (/routes/blogRoutes.js)
- **Base: /api/blogs**
- `GET /`: List blogs (public, query: page, limit, search, category, tag, status, featured).
  - Req: Query params.
  - Res: 200 { blogs: [], pagination }.
- `GET /:slug`: Get single blog (public).
  - Req: Params { slug }.
  - Res: 200 { blog } (increments viewCount).
- `POST /`: Create blog (protected: admin/moderator, upload images).
  - Req: Body { title, summary, content, ... }, Files: coverImage, images[].
  - Res: 201 { message, blog }.
- `PUT /:id`: Update blog (protected: admin/moderator, owner check).
  - Req: Params { id }, Body { updates }, Files optional.
  - Res: 200 { message, updatedBlog }.
- `DELETE /:id`: Delete blog (protected: admin/moderator, owner).
  - Req: Params { id }.
  - Res: 200 { message } (deletes Cloudinary images).
- `GET /admin`: Admin list (protected, all blogs with filters).

#### Booking Routes (/routes/bookingRoutes.js)
- **Base: /api/bookings**
- `POST /`: Create booking (protected: customer).
  - Req: Body { destinationId, fullName, email, ... }.
  - Res: 201 { message, booking }.
- `GET /my-bookings`: User bookings (protected: customer).
  - Req: Query { page, limit, status, sort }.
  - Res: 200 { bookings, pagination }.
- `GET /:id`: Get single booking (protected: owner or admin).
  - Req: Params { id }.
  - Res: 200 { booking }.
- `PUT /:id`: Update booking (protected: admin/employee).
  - Req: Params { id }, Body { updates }.
  - Res: 200 { message, updatedBooking }.
- `DELETE /:id`: Cancel/delete (protected: owner/admin).
  - Req: Params { id }.
  - Res: 200 { message }.
- `GET /admin`: Admin list (protected: admin/employee).
  - Similar to /my-bookings but all.

#### ContactInfo Routes (/routes/contactInfoRoutes.js)
- **Base: /api/contact-info**
- `GET /`: Get contact info (public, assumes single doc).
  - Res: 200 { contactInfo }.
- `PUT /`: Update (protected: admin).
  - Req: Body { updates }.
  - Res: 200 { message, updatedContactInfo }.

#### Destination Routes (/routes/destinationRoutes.js)
- **Base: /api/destinations**
- `GET /`: List (public, query: page, limit, search, category, minPrice, maxPrice, from, to, sortBy).
  - Res: 200 { destinations, pagination }.
- `GET /:slug`: Single (public).
  - Res: 200 { destination }.
- `POST /`: Create (protected: admin/moderator, upload images[]).
  - Req: Body { title, ... }, Files: images[].
  - Res: 201 { message, destination }.
- `PUT /:id`: Update (protected: admin/moderator).
  - Req: Params { id }, Body, Files optional.
  - Res: 200 { message, updatedDestination }.
- `DELETE /:id`: Delete (protected: admin).
  - Req: Params { id }.
  - Res: 200 { message } (deletes images).
- `GET /admin`: Admin list (protected).

#### Invoice Routes (/routes/invoiceRoutes.js)
- **Base: /api/invoices**
- `POST /`: Create (protected: admin/employee).
  - Req: Body { customer, items, ... }.
  - Res: 201 { message, invoice } (auto-generates number).
- `GET /`: List (protected: admin/employee, query: page, limit, status, search).
  - Res: 200 { invoices, pagination }.
- `GET /:id`: Single (protected).
  - Res: 200 { invoice }.
- `PUT /:id`: Update (protected).
  - Req: Body { updates }, logs history.
  - Res: 200 { message, updatedInvoice }.
- `DELETE /:id`: Delete (protected: admin).
  - Res: 200 { message }.
- `GET /export/csv`: Export CSV (protected).
  - Res: CSV file download.
- `GET /export/pdf/:id`: PDF for single (protected).
  - Res: PDF download.

#### User Routes (/routes/userRoutes.js)
- **Base: /api/users**
- `POST /auth/firebase`: Verify Firebase token, create/login user, issue JWT.
  - Req: Headers { Authorization: Bearer <firebase_token> }.
  - Res: 200 { token, user } (sets cookie).
- `GET /profile`: Get profile (protected).
  - Res: 200 { user }.
- `PUT /profile`: Update profile (protected, upload profileImage).
  - Req: Body { name, phone, ... }, File: profileImage.
  - Res: 200 { message, updatedUser }.
- `GET /`: List users (protected: admin).
  - Query: page, limit, role, search.
  - Res: 200 { users, pagination }.
- `POST /`: Create user (protected: admin).
  - Req: Body { name, email, role, ... }.
  - Res: 201 { message, user }.
- `PUT /:id`: Update user (protected: admin).
  - Req: Params { id }, Body.
  - Res: 200 { message, updatedUser }.
- `DELETE /:id`: Delete (protected: admin).
  - Res: 200 { message }.

#### VisaBooking Routes (/routes/visaBookingRoutes.js)
- Similar to Booking routes, but for visas.
- `POST /`, `GET /my-visa-bookings`, `GET /:id`, etc.

#### Visa Routes (/routes/visaRoutes.js)
- Similar to Destination routes.
- `GET /`, `GET /:slug`, `POST /` (upload images/cover), `PUT /:id`, `DELETE /:id`.

### Error Handling
- Global error handler in server.js (not shown, but assume standard Express).
- Responses: { success: bool, message/data/error }.

### Security
- CORS enabled.
- JWT expiration (not specified, assume config).
- File uploads limited to 5MB, images only (jpeg/png/webp).
- Role-based access.

---

## Frontend Documentation

The frontend is a React app with Vite, using React Router for navigation, Firebase for auth, Axios for API calls (with public/secure hooks), and ShadCN/UI components. It supports themes, animations (Framer Motion), and responsive design.

### Dependencies
- React, React Router, React Hook Form (forms).
- UI: ShadCN (Accordion, Alert, Badge, Button, etc.), Lucide Icons.
- Hooks: Custom (useAxiosPublic, useRole, useDebounce, mutations/queries for each model).
- Others: Date-fns (formatting), Framer Motion (animations), Tailwind CSS.

### Folder Structure
- `src/assets/`: Images, SVGs.
- `src/components/`: Reusable UI (Admin, Animation, Blogs, Booking, Dashboard, Destination, Layout, Sections, Shared, Theme, UI, Visa).
- `src/config/`: Firebase config.
- `src/contexts/`: AuthContext.
- `src/hooks/`: Custom hooks (Axios, Role, Mutations/Queries for models, Debounce).
- `src/pages/`: Routes (About, Blogs, Contact, Destinations, Home, Login, Profile, VisaPackages, Admin pages like AddBlog, AdminBookings).
- `src/routes/`: ProtectedRoute, AdminRoute.
- `src/lib/`: Utils (cn for classnames).
- `main.jsx`: Entry with Router.

### Authentication Flow
- Firebase for signup/login (pages/Login.jsx, Signup.jsx).
- AuthContext provides user, token, login/logout.
- ProtectedRoute: Wraps private pages (e.g., Profile, MyBookings).
- AdminRoute: For admin dashboard/pages, checks role via useRole hook.

### Key Hooks
- `useAxiosPublic`: Axios instance without auth.
- `useAxiosSecure`: With JWT interceptor.
- `useRole`: Fetches user role from API.
- Model-specific: e.g., `useBlogQuery` (getBlogs, getBlogBySlug), `useBlogMutation` (create, update, delete).
- `useDebounce`: For search inputs.

### Pages & Components
- **Public Pages**:
  - Home: Hero, Featured Destinations, Testimonials, Newsletter.
  - Destinations: List with filters/pagination, Details page.
  - Blogs: List with filters, Details.
  - Visas: Packages list, Details, Booking form (multi-step with animation).
  - Contact, About.
- **User Pages**:
  - Login/Signup/ForgotPassword.
  - Profile: Edit details, upload image.
  - MyBookings: List bookings.
- **Admin Pages** (under /admin):
  - Dashboard: Sidebar, Analytics.
  - Add/Edit: Blogs, Destinations, Visas.
  - Lists: Blogs, Bookings, Destinations, Invoices, Users, Visas.
  - CreateInvoice: Form with items, calculations.
  - InvoiceAnalytics: Charts/trends.
- **Components**:
  - Layout: UserLayout (Navbar/Footer), AdminLayout (Sidebar).
  - Sections: Hero, Featured, Newsletter, etc.
  - UI: Custom wrappers for ShadCN (button, card, etc.).
  - Animation: FadeIn, AnimatedButton/Card.

### Routing
- Protected: /profile, /my-bookings, /admin/*.
- Admin: /admin/add-blog, /admin/bookings, etc.
- Dynamic: /destinations/:slug, /visas/details/:slug, /visas/book/:slug.

### Styling & Themes
- Tailwind CSS with custom fonts.css.
- ThemeProvider: Light/dark mode toggle.

### Running Tests
- No tests included; add Jest/Vitest if needed.

### Deployment Notes
- Build: `npm run build` (outputs to dist).
- Environment: Set VITE_API_URL for backend if not localhost.

---

## Contributing
- Fork, branch, PR.
- Follow code style (ESLint in Frontend).

## License
If you encounter issues, check console logs or open an issue. For questions, contact the maintainer.
