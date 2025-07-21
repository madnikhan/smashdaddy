# STACKD - Premium Food Delivery Platform

A comprehensive food delivery and restaurant management platform built with Next.js 15, featuring a modern black and gold theme. The platform serves multiple user types: customers, restaurant staff, drivers, and administrators.

## 🎯 Features

### Customer Experience
- **Landing Page**: Hero section, featured restaurants, how it works
- **Restaurant Browsing**: Search, filters, categories
- **Menu Management**: Item browsing, customizations, dietary filters
- **Shopping Cart**: Real-time cart management, promotions
- **Checkout**: Address input, payment methods, order confirmation
- **Order Tracking**: Real-time status updates, driver location
- **Reviews & Ratings**: Post-order feedback system
- **Loyalty Program**: Points earning, rewards, special offers

### Restaurant Management
- **Dashboard**: Analytics, recent orders, performance metrics
- **Menu Management**: Categories, items, customizations, pricing
- **Order Management**: Real-time order queue, status updates
- **Kitchen Display**: Order preparation workflow
- **Analytics**: Sales reports, popular items, customer insights
- **Promotions**: Discount codes, special offers
- **Reviews Management**: Customer feedback handling

### Driver Operations
- **Driver Dashboard**: Available orders, earnings, performance
- **Order Acceptance**: Accept/reject delivery requests
- **Navigation**: Route optimization, real-time tracking
- **Order Management**: Pickup, delivery workflow
- **Earnings Tracking**: Commission, tips, payment history

### Admin Panel
- **User Management**: Customer, restaurant, driver accounts
- **Restaurant Management**: Approval, settings, performance
- **Order Monitoring**: System-wide order tracking
- **Support System**: Ticket management, customer service
- **Analytics**: Platform-wide metrics, insights

### Till System (POS)
- **In-Store Orders**: Staff order creation for walk-in customers
- **Quick Menu**: Category-based item selection
- **Cart Management**: Real-time total calculation
- **Payment Processing**: Multiple payment methods

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom black/gold theme
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5 (beta)
- **Payments**: Stripe integration
- **Real-time**: Pusher for live updates
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stackd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/stackd"

   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
   STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
   STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"

   # Pusher (Real-time)
   PUSHER_APP_ID="your-pusher-app-id"
   PUSHER_KEY="your-pusher-key"
   PUSHER_SECRET="your-pusher-secret"
   PUSHER_CLUSTER="your-pusher-cluster"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
   NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
   NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
STACKD/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (customer)/        # Customer dashboard
│   │   ├── (restaurant)/      # Restaurant management
│   │   ├── (driver)/          # Driver dashboard
│   │   ├── (admin)/           # Admin panel
│   │   └── (till)/            # POS system
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Basic UI components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utility functions & configurations
│   ├── contexts/             # React contexts (Cart, Auth)
│   ├── types/                # TypeScript type definitions
│   └── generated/            # Generated types
├── prisma/                   # Database schema & migrations
├── public/                   # Static assets
└── docs/                     # Documentation
```

## 🎨 Design System

### Color Palette
- **Primary**: Black (#000000) - Main backgrounds
- **Secondary**: Gold (#FFD700) - Accents, buttons, highlights
- **Tertiary**: Dark Gray (#1a1a1a) - Secondary backgrounds
- **Text**: White (#FFFFFF) - Primary text
- **Text Secondary**: Light Gray (#E5E5E5) - Secondary text

### Typography
- **Headings**: Bold, gold accents
- **Body**: Clean, readable white text
- **Buttons**: Gold background with black text

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npx prisma studio` - Open Prisma Studio
- `npx prisma migrate dev` - Run database migrations
- `npx prisma generate` - Generate Prisma client

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Base user accounts with role-based relationships
- **Customers**: Customer-specific data and preferences
- **Restaurants**: Restaurant information and settings
- **Drivers**: Driver profiles and availability
- **Admins**: Administrative users
- **Orders**: Order management and tracking
- **Menu Items**: Restaurant menu and customizations
- **Payments**: Payment processing and tracking
- **Reviews**: Customer feedback and ratings

## 🔐 Authentication

STACKD uses NextAuth v5 with multiple authentication providers:

- **Credentials**: Email/password authentication
- **Google OAuth**: Social login integration
- **Role-based Access**: Different interfaces for different user types

## 💳 Payment Integration

Stripe integration for secure payment processing:

- **Multiple Payment Methods**: Card, digital wallets
- **Secure Processing**: PCI-compliant payment handling
- **Webhook Support**: Real-time payment status updates
- **Refund Management**: Automated refund processing

## 📱 Real-time Features

Pusher integration for live updates:

- **Order Status**: Real-time order tracking
- **Driver Location**: Live driver location updates
- **Kitchen Updates**: Real-time kitchen display
- **Notifications**: Instant status notifications

## 🚀 Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** with automatic builds

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- Database connection string
- NextAuth configuration
- Stripe keys
- Pusher credentials
- App URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email hello@stackd.com or create an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Advanced loyalty program
- [ ] Restaurant chain management
- [ ] Advanced delivery optimization
- [ ] Voice ordering integration

---

Built with ❤️ by the STACKD Team
