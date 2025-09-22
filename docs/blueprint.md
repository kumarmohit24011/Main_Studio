# **App Name**: Redbow

## Core Features:

- Home Page Showcase: Hero section with lifestyle banner (large high-quality jewelry image), Featured products section (admin-curated), Trending items (based on sales/views), Promotional banners (offers, seasonal sales, festive discounts), Lazy-loading images for fast page speed.
- Advanced Catalog Filtering: Filter by: Category, Metal (Gold, Silver, Diamond), Gemstone, Price range, Size. Sort by: New arrivals, Price (low → high / high → low), Popularity. Search with autocomplete (Firestore full-text search or Algolia later).
- Detailed Product Views: Product title, description, SKU. Image gallery with zoom + swipe support (mobile friendly). Variants (size, metal type). Dynamic pricing (show MRP vs Discounted Price with gold accent). Stock status (In stock / Low stock / Sold out). Customer reviews & ratings. Suggested related items (“You may also like”).
- User Authentication: Firebase Authentication (Email/Password + Google Sign-In). Secure JWT sessions. Profile section: Name, Phone, Saved addresses, Wishlist, Order history.
- Admin Dashboard: Products: Add/Edit/Delete with images & stock. Categories: Manage jewelry categories. Offers & Coupons: Percentage/Flat discounts with start & end dates. Orders: View, update status (Processing, Shipped, Delivered, Cancelled). Inventory Management: Bulk update stock & low-stock alerts. User Management: Ban/unban, set admin role. Audit Log: Track admin actions for security.
- Payment Gateway Integration: Checkout with Razorpay (UPI, Cards, Netbanking, Wallets). Firebase Cloud Function verifies payment signature. Payment + order confirmation email (via Firebase Extensions or SendGrid). Refund support from admin dashboard (Razorpay refund API).

## Style Guidelines:

- Primary Color: Deep Red #A30D2D → Logo, Buttons, Highlights.
- Background Color: Light Off-White #FAF9F6 → Clean & Luxurious.
- Accent Color: Soft Gold #D4AF37 → CTAs, Price highlights, Hover effects.
- Headlines → Playfair Display (serif, luxury feel).
- Body Text → PT Sans (sans-serif, modern + warm).
- Minimalist, fine-line icons (Lucide/Feather icons).
- Grid-based layout, mobile-first responsive design.
- Hover animations with subtle shadows.