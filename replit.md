# RotaSave - Rotating Savings Groups Platform

## Overview

RotaSave is a full-stack web application for managing rotating savings groups (also known as tandas or chit funds). The platform allows users to create, join, and manage savings circles where participants contribute a fixed amount regularly and take turns receiving the pooled funds. The application features a mobile-first design with comprehensive payment tracking, activity monitoring, and turn rotation management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built as a single-page application using React with TypeScript. The architecture follows a component-based approach with shadcn/ui providing the design system components. Key architectural decisions include:

- **Routing**: Uses wouter for lightweight client-side routing with dedicated pages for groups, payments, history, and profile management
- **State Management**: Leverages TanStack Query for server state management and data fetching, providing automatic caching and synchronization
- **UI Framework**: Built on top of Tailwind CSS with shadcn/ui components for consistent design patterns and accessibility
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation and card-based interfaces
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing

### Backend Architecture
The server follows a RESTful API design using Express.js with TypeScript. The architecture emphasizes modularity and maintainability:

- **API Layer**: Modular route structure organized by domain (auth, users, groups, payments, activities) for better code organization and maintainability
- **Data Layer**: Modular storage structure organized by domain (users, groups, members, payments, activities) with clean interface separation and dependency injection
- **Business Logic**: Embedded within storage methods and route handlers for group management, payment processing, and activity tracking
- **Type Safety**: Shared type definitions between client and server using Drizzle schemas
- **Route Organization**: Domain-specific route modules that are composed together for clean separation of concerns

### Database Design
The application uses a relational database schema with the following core entities:

- **Users**: Authentication and profile information with optional personal wallet references
- **Savings Groups**: Group configuration including contribution amounts, frequency, turn rotation, and wallet integration
- **Group Members**: Many-to-many relationship between users and groups with turn order management
- **Payments**: Contribution and payout tracking with status management
- **Activities**: Audit trail for user actions and system events

The schema is defined using Drizzle ORM with PostgreSQL as the target database dialect, though the current implementation uses in-memory storage for development.

**Wallet Integration Fields:**
- `savingsGroups.walletId`: References the group's wallet in App A
- `users.personalWalletId`: References the user's personal wallet in App A

### Authentication & Security
Currently implements a basic authentication system with username/password login. The demo environment includes a pre-seeded user account for testing purposes. Production deployment would require implementing secure session management and password hashing.

### Wallet Integration (App A Integration)
RotaSave integrates with App A's wallet management service to provide secure financial operations:

- **Automatic Wallet Creation**: When users create savings groups, a corresponding wallet is automatically created in App A
- **Group Wallet Management**: Each savings group has its own wallet with balance tracking and transaction history
- **API Integration**: Uses REST APIs with API key authentication to communicate with App A's wallet service
- **Real-time Balance Display**: Group wallet balances are displayed in the group details page
- **Payment Processing**: All contributions and payouts flow through App A's secure wallet system
- **Multi-currency Support**: Wallets support the same currencies as the savings groups (USD, EUR, GBP, JPY, CAD, AUD, MXN, BRL, INR, CNY)

### Development Environment
The project uses Vite for development with hot module replacement and optimized builds. The configuration supports both client and server development with automatic compilation and serving of static assets.

**Environment Variables for Wallet Integration:**
- `WALLET_API_KEY`: API key for authenticating with App A's wallet service
- `WALLET_SERVICE_URL`: Base URL for App A's wallet API (defaults to http://localhost:3001)

## External Dependencies

### Database
- **Drizzle ORM**: Type-safe database toolkit for schema definition and query building
- **PostgreSQL**: Production database (configured via DATABASE_URL environment variable)
- **Neon Database**: Cloud PostgreSQL provider integration

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Headless UI component primitives for accessibility and interaction patterns
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind
- **Lucide React**: Icon library for consistent iconography

### Client-Side Libraries
- **React**: User interface framework
- **TanStack Query**: Server state management and data fetching
- **wouter**: Lightweight routing library
- **React Hook Form**: Form state management and validation
- **date-fns**: Date manipulation and formatting utilities

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer