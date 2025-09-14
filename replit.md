# replit.md

## Overview

This is a full-stack web application for CLKtech, a technology company that designs and sells robot controller boards and electronic circuit modules. The application features a modern, responsive design with a React frontend and Express.js backend, supporting product catalog management, ordering system, and admin functionality. Recently updated to include external store integration, YouTube tutorials, math CAPTCHA security, and SEO-friendly product routing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Pattern**: REST API with JSON responses
- **File Uploads**: Multer for handling product images
- **Session Management**: Simple password-based admin authentication

### Database Strategy
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Current Storage**: JSON files for development (products.json, orders.json)
- **Migration Path**: Ready to migrate to PostgreSQL via Drizzle configuration
- **Schema**: Fully defined tables for products, orders, contacts, and admins

## Key Components

### Product Management
- Product catalog with detailed specifications
- Image upload and management
- Category-based organization
- Stock status tracking
- Admin CRUD operations

### Order System
- Bank transfer-only checkout process
- Customer information collection
- Order status management
- Admin order tracking

### Admin Panel
- Protected admin routes with authentication
- Product management interface
- Order management dashboard
- File upload capabilities for product images

### User Interface
- Responsive design for mobile/tablet/desktop
- Navigation with Home, Products, Coding App, About, Contact pages
- Product detail pages with technical specifications
- Contact form with validation
- Admin dashboard with statistics

## Data Flow

### Public User Flow
1. Browse products via catalog or individual product pages
2. View product details and specifications
3. Place orders through checkout form
4. Contact company via contact form

### Admin Flow
1. Login via admin panel
2. Manage products (add/edit/delete)
3. Upload product images
4. Monitor orders and contacts
5. View dashboard statistics

### API Endpoints
- `GET /api/products` - Product catalog
- `GET /api/products/:id` - Individual product details
- `POST /api/orders` - Create new order
- `POST /api/contacts` - Submit contact form
- `POST /api/admin/login` - Admin authentication
- Admin-only endpoints for product and order management

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database driver
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database ORM
- **zod**: Runtime type validation
- **react-hook-form**: Form state management
- **multer**: File upload handling

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Production bundling

## Deployment Strategy

### Development
- Vite dev server for frontend hot reloading
- TSX for running TypeScript server files
- JSON file storage for rapid development

### Production
- Frontend: Vite build output served as static files
- Backend: ESBuild bundled Express server
- Database: Ready for PostgreSQL deployment via Drizzle migrations
- File uploads: Local storage with configurable upload directory

### Environment Configuration
- `DATABASE_URL` environment variable for PostgreSQL connection
- Configurable upload directories
- Development/production mode detection

### Key Features Ready for Production
- Database migrations via Drizzle
- Proper error handling and logging
- File upload security with type restrictions
- Session-based admin authentication
- Responsive design for all devices
- SEO-friendly routing structure

## Recent Changes (January 2025)

### Enhanced Product Features
- Added product slug field for SEO-friendly URLs (/products/product-name)
- Implemented external store links (Etsy, N11, Trendyol) with JSON storage
- Products now support dual routing: by ID and by slug
- Enhanced product form to include slug and external links management

### Security Improvements
- Added math CAPTCHA to contact form for bot protection
- CAPTCHA includes randomized math questions (+, -, ×) with validation
- Auto-regenerates CAPTCHA after form submission or incorrect answers

### Video Integration
- Added YouTube video embedding to coding app download page
- Replaced placeholder video with actual YouTube iframe
- Improved tutorial presentation with proper aspect ratio

### Admin Panel Enhancements
- Updated product management to include slug and external links fields
- Enhanced product form with JSON editors for specs and external links
- Improved form validation and error handling

### Database Schema Updates
- Added slug field to products table (unique constraint)
- Added externalLinks field to products table (JSON storage)
- Added captchaAnswer field to contacts table for CAPTCHA validation
- Updated storage layer to handle new fields with proper defaults

### Visual Design Updates (July 2025)
- Changed color theme from orange/black to modern blue/purple scheme
- Updated hero section with dynamic slider showing 3 product categories
- Added Turkish language support throughout the interface
- Redesigned hero section with modern glassmorphism effects
- Updated feature cards with new color scheme and hover animations
- Added animated progress bars and interactive slider controls