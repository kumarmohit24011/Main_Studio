# Redbow - E-commerce Jewelry Website

## Overview
This is a Next.js 15 e-commerce application for jewelry sales, built with Firebase backend, Tailwind CSS, and Radix UI components. The project includes a complete admin panel and customer-facing storefront.

## Recent Changes
- **2025-09-10**: FIXED critical admin panel ERR_BLOCKED_BY_CLIENT error by renaming ad-triggering paths
- **2025-09-10**: RESOLVED Firebase PERMISSION_DENIED errors by removing server-side write-on-read
- **2025-09-10**: Added automatic cache revalidation (60s home/products, 30s admin) for live site
- **2025-09-10**: Created manual cache invalidation API at /api/cache for immediate updates
- **2024-09-08**: Fixed Next.js 15 compatibility issues with async searchParams
- **2024-09-08**: Resolved date validation errors in admin pages  
- **2024-09-08**: Configured dev server for Replit environment
- **2024-09-08**: Set up deployment configuration for production

## Project Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: React hooks + Firebase integration
- **Build Tool**: Turbopack for fast development

### Backend  
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **AI Integration**: Google AI via Genkit

### Key Features
- Product catalog with categories and filtering
- Shopping cart and wishlist functionality  
- User authentication and profiles
- Admin dashboard for managing products, orders, customers
- Payment integration with Razorpay
- Responsive design for mobile and desktop

### Development Setup
- Dev server runs on port 5000 (configured for Replit)
- Uses 0.0.0.0 binding to work with Replit's proxy
- Hot reload enabled with Turbopack

### Deployment
- Configured for autoscale deployment
- Build command: `npm run build`  
- Start command: `npm start`
- Ready for Firebase hosting deployment

## File Structure
- `src/app/` - Next.js app router pages
- `src/components/` - Reusable UI components
- `src/services/` - Firebase service layer
- `src/lib/` - Utilities and type definitions
- `src/hooks/` - Custom React hooks