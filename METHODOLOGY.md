# PartyUp Methodology & Technical Stack

## Project Overview

PartyUp is a comprehensive ride-sharing platform with three distinct user roles (Users, Staff, Admin), each with dedicated interfaces and permissions. The system uses a web-based architecture for all interfaces rather than mobile-specific technologies.

---

## Technical Architecture

### Overview of Technologies

#### Frontend
- **React** - A JavaScript library for building user interfaces with component-based architecture. React is used for all three interface layers (User, Staff, Admin) to ensure consistency, code reusability, and maintainability across the platform.
- **Vite** - A modern frontend build tool that provides fast development experience and optimized production builds for the React application.
- **TypeScript** - A typed superset of JavaScript that adds static typing to enhance code maintainability, readability, and catch errors during development. Used consistently across the entire codebase to support collaborative development.
- **Tailwind CSS** - A utility-first CSS framework that enables rapid and consistent UI design. Combined with Radix UI components for accessible, customizable interfaces.
- **Radix UI** - A collection of unstyled, accessible React components that provide the foundation for building user interfaces with proper accessibility standards.
- **React Hook Form** - A lightweight form management library that efficiently handles form state, validation, and submission across all three interface layers.
- **Wouter** - A lightweight client-side router that manages navigation and URL routing within the React application.
- **Framer Motion** - An animation library used to create smooth, polished user interactions and transitions.

#### Backend
- **Node.js** - A runtime environment that allows JavaScript execution on the server side, enabling scalable and high-performance backend development.
- **Express.js** - A Node.js web framework that provides routing, middleware support, and request handling for the API layer.
- **tRPC** - A type-safe RPC framework that enables end-to-end type safety between frontend and backend, eliminating the need for traditional REST API documentation.
- **Socket.IO** - A library that enables real-time, bidirectional communication between client and server, used for live notifications, updates, and user interactions.

#### Database
- **MySQL** - A relational database management system for storing and managing structured data including user profiles, trip information, vehicle data, and system records.
- **Drizzle ORM** - A type-safe SQL query builder and ORM for Node.js that provides database abstraction while maintaining type safety with TypeScript.

#### Location & Mapping
- **Mapbox Maps SDK** - Advanced mapping and location-based services for displaying maps, tracking user locations, and enabling navigation features within the application.
- **React Map GL** - React wrapper for Mapbox GL that integrates map functionality as React components.

#### Development Tools
- **Visual Studio Code** - The primary IDE used by developers, offering debugging, version control, extensions, and comprehensive TypeScript support.
- **Drizzle Kit** - Database schema management and migration tools for version-controlled database changes.
- **Vitest** - A unit testing framework for TypeScript/JavaScript code.

---

## System Architecture

### Three-Tier Role-Based Access Control (RBAC)

PartyUp implements a hierarchical permission system with three distinct user tiers:

#### Tier 1: Users (Travelers)
- **Role**: End-users seeking ride-sharing services
- **Interface**: User portal with simplified, focused interface
- **Responsibilities**: Create trips, manage profile, view rides, provide ratings/feedback
- **Access**: Limited to own data and matched trips
- **Features**: 
  - Trip creation and matching
  - Real-time ride tracking
  - In-app messaging with drivers/passengers
  - Safety features (emergency contacts, trip sharing)
  - Rating and review system

#### Tier 2: Staff (Operations)
- **Role**: Operations team managing day-to-day platform activities
- **Interface**: Staff dashboard with operational tools
- **Responsibilities**: Monitor trips, handle disputes, manage issues
- **Access**: View all trips and user data for support purposes
- **Features**:
  - Trip monitoring dashboard
  - User support interface
  - Issue/dispute resolution tools
  - Platform analytics and reporting
  - Emergency response coordination

#### Tier 3: Admin (Strategy)
- **Role**: Platform administrators and system managers
- **Interface**: Admin dashboard with full system control
- **Responsibilities**: System configuration, user management, compliance oversight
- **Access**: Complete system access with audit trails
- **Features**:
  - User and vehicle management
  - Verification workflows
  - Safety policy configuration
  - Advanced analytics and business intelligence
  - System settings and configuration
  - Compliance and audit logging

### Application Structure

```
PartyUp/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── pages/            # Page components for each interface
│   │   ├── components/        # Reusable React components
│   │   ├── contexts/          # React context for state management
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and helpers
│   │   └── index.css          # Global styles
│   └── public/                # Static assets
├── server/                    # Express backend application
│   ├── routers/              # tRPC route definitions
│   ├── _core/                # Core backend modules
│   │   ├── llm.ts            # LLM integration
│   │   ├── map.ts            # Mapbox integration
│   │   ├── notification.ts   # Real-time notifications (Socket.IO)
│   │   ├── rekognition.ts    # AWS Rekognition (verification)
│   │   ├── trpc.ts           # tRPC configuration
│   │   └── ...
│   └── index.ts              # Server entry point
├── shared/                    # Shared types and utilities
│   ├── types.ts              # TypeScript interfaces
│   ├── const.ts              # Constants
│   └── verification.ts       # Verification utilities
└── drizzle/                  # Database schema & migrations
    ├── schema.ts             # Database table definitions
    └── migrations/           # Database migration files
```

---

## Data Flow

### Authentication & Authorization
1. User logs in with credentials
2. Server validates credentials and generates session token
3. Token stored in HTTP-only cookie for security
4. Role-based middleware validates permissions for each request
5. tRPC procedures enforce type-safe permissions

### Real-Time Communication
1. Client establishes WebSocket connection via Socket.IO
2. Server broadcasts events to appropriate clients based on role/permissions
3. Notifications sent for trip updates, messages, and system events
4. Real-time updates for maps and live tracking

### Trip Data Flow
1. User creates trip through UI form
2. Request sent via tRPC to backend with type validation
3. Backend validates, calculates matching criteria, stores in MySQL
4. Matching algorithm runs to find compatible trips
5. Matched trips broadcast to relevant users via Socket.IO
6. Map updates in real-time showing live trip progress
7. Completion triggers rating/feedback workflow

---

## Development Workflow

### Build Process
- **Development**: `npm run dev` - Vite serves frontend with hot reload
- **Backend**: Watches `server/` directory for changes
- **Production Build**: `npm run build` - Builds optimized frontend + bundles backend
- **Deployment**: Node.js runs Express server with React app served as static files

### Type Safety
- TypeScript configuration enforces strict type checking
- tRPC provides end-to-end type safety between frontend and backend
- Database schema defined in TypeScript with Drizzle ORM
- All API responses are type-checked automatically

### Database Migrations
- Schema changes managed through Drizzle migrations
- Migrations tracked in `drizzle/` directory
- Version-controlled and reversible
- Run automatically on deployment

---

## Security Considerations

- **Authentication**: Session-based with HTTP-only cookies
- **Authorization**: Role-based access control (RBAC) enforced server-side
- **Data Validation**: Zod schemas validate all inputs
- **Type Safety**: TypeScript prevents common vulnerabilities
- **HTTPS**: All production communications encrypted
- **Database**: Parameterized queries prevent SQL injection
- **CORS**: Configured to restrict cross-origin requests
- **Audit Logging**: Staff and Admin actions tracked for compliance

---

## Scalability & Performance

- **Frontend**: Vite optimized builds for fast load times
- **Backend**: Express with Node.js for handling concurrent requests
- **Real-Time**: Socket.IO connections for efficient live updates
- **Database**: MySQL with proper indexing and query optimization
- **Maps**: Mapbox CDN for efficient map tile delivery
- **Caching**: Strategic caching for frequently accessed data

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend UI** | React + TypeScript | User, Staff, Admin interfaces |
| **Styling** | Tailwind CSS + Radix UI | Responsive, accessible design |
| **Routing** | Wouter | Client-side navigation |
| **Backend Server** | Express.js | API and request handling |
| **API Layer** | tRPC | Type-safe client-server communication |
| **Real-Time** | Socket.IO | Live notifications and updates |
| **Database** | MySQL | Data persistence |
| **ORM** | Drizzle | Type-safe database queries |
| **Maps** | Mapbox GL + React Map GL | Location services and mapping |
| **Dev Tools** | Vite, TypeScript, VSCode | Development environment |

---

## Why This Stack?

1. **Unified Codebase**: React for all interfaces (User, Staff, Admin) enables code sharing and consistent UX
2. **Type Safety**: TypeScript + tRPC + Drizzle prevent entire classes of bugs
3. **Developer Experience**: Vite for fast builds, React ecosystem maturity
4. **Real-Time Features**: Socket.IO enables live updates without polling
5. **Maintainability**: Consistent tech stack across frontend/backend easier for teams
6. **Performance**: Optimized builds and efficient runtime
7. **Security**: Enforced type checking catches vulnerabilities early

---

## Alternative Considered: React Native

While the initial concept considered React Native + Expo for a mobile-first approach:
- **Decision Made**: Full web stack for all interfaces
- **Rationale**: 
  - Web platform sufficient for user base
  - Single codebase for all roles simplifies maintenance
  - Easier testing and QA across desktop/mobile browsers
  - Better for ride-sharing real-time map interactions
  - Reduced complexity for deployment and updates
