# PartyUp - Software Versions & Stack

**Last Updated:** May 19, 2026

---

## 🖥️ Development Environment

| Component | Version |
|-----------|---------|
| **Windows** | 11 24H2 (OS Build 26100.3775) |
| **Visual Studio Code** | 1.112 |
| **Node.js** | 24.14.0 |
| **TypeScript** | 5.6.3 |

---

## 📱 Mobile Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **React Native** | 0.83.0 | Cross-platform mobile framework |
| **Expo** | 55.0.5 | React Native development platform |
| **NativeWind** | 4.2.2 | Tailwind CSS for React Native |
| **Lucide React Native Icons** | 0.542.0 | Icon library for mobile UI |
| **Mapbox Maps SDK (Android)** | 11.20.0 | Location mapping & geofencing |

---

## 💻 Web Frontend

| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.1 | UI framework |
| **React DOM** | 19.2.1 | React rendering engine |
| **TypeScript** | 5.6.3 | Type-safe JavaScript |
| **Tailwind CSS** | 4.1.14 | Utility-first CSS framework |
| **Vite** | 7.1.7 | Build tool & dev server |
| **Wouter** | 3.3.5 | Lightweight routing library |
| **Lucide React** | 0.453.0 | Icon library for web UI |
| **Framer Motion** | 12.23.22 | Animation library |
| **React Hook Form** | 7.64.0 | Form state management |
| **Zod** | 4.1.12 | TypeScript-first schema validation |
| **Radix UI** | Latest | Unstyled accessible components |
| **Mapbox GL** | 3.5.0 | Interactive web maps |
| **Axios** | 1.12.0 | HTTP client |
| **Sonner** | 2.0.7 | Toast notifications |
| **Recharts** | 2.15.2 | Data visualization |
| **Next Themes** | 0.4.6 | Theme management (dark/light mode) |
| **React Map GL** | 7.1.7 | React wrapper for Mapbox |
| **Embla Carousel React** | 8.6.0 | Carousel/slider component |

---

## 🔙 Backend Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Express.js** | 5.2.1 | Web server framework |
| **Node.js** | 24.14.0 | JavaScript runtime |
| **TypeScript** | 5.6.3 | Type-safe backend code |
| **tRPC** | Latest | Type-safe RPC framework |
| **Drizzle ORM** | Latest | SQL ORM with TypeScript support |
| **Socket.IO** | 4.8.3 | Real-time bidirectional communication |
| **ESBuild** | 0.25.0 | TypeScript/JavaScript bundler |

---

## 🗄️ Database

| Component | Version | Purpose |
|-----------|---------|---------|
| **MySQL** | 9.6.0 | Relational database |
| **Drizzle ORM** | Latest | TypeScript-first ORM layer |

---

## 💳 Payment Integration

| Component | Version | Status | Purpose |
|-----------|---------|--------|---------|
| **PayMongo** | (TBD) | **TO BE ADDED** | Philippine payment processing |

---

## 🛠️ Development Tools

| Component | Version | Purpose |
|-----------|---------|---------|
| **pnpm** | 10.15.1 | Fast package manager |
| **Prettier** | 3.6.2 | Code formatter |
| **Vitest** | 2.1.4 | Unit testing framework |
| **PostCSS** | 8.4.47 | CSS processing |
| **Autoprefixer** | 10.4.20 | CSS vendor prefixing |

---

## 📊 State Management & Context

| Component | Version | Purpose |
|-----------|---------|---------|
| **React Context API** | Built-in | Global state (Auth, Theme, Safety) |
| **React Hook Form** | 7.64.0 | Form state & validation |

---

## 🔐 Security & Verification

| Component | Version | Purpose |
|-----------|---------|---------|
| **AWS Rekognition** | Latest | AI-powered facial recognition for ID verification |
| **AWS S3** | Latest | Image storage for verification documents |

---

## 📍 Location & Mapping

| Component | Version | Purpose |
|-----------|---------|---------|
| **Mapbox Maps SDK** | 11.20.0 (Android) | Native Android mapping |
| **Mapbox GL** | 3.5.0 | Web-based mapping |
| **React Map GL** | 7.1.7 | React integration for Mapbox |

---

## 🔄 Real-Time Communication

| Component | Version | Purpose |
|-----------|---------|---------|
| **Socket.IO** | 4.8.3 | Real-time chat & notifications |

---

## 📦 Build & Deployment

| Component | Version | Purpose |
|-----------|---------|---------|
| **Vite** | 7.1.7 | Frontend build & dev server |
| **ESBuild** | 0.25.0 | Backend bundling |
| **pnpm** | 10.15.1 | Monorepo package management |

---

## 🚀 Next Steps for Production

- [ ] Add PayMongo integration (v3.x recommended)
- [ ] Configure AWS Rekognition credentials
- [ ] Set up Mapbox API keys
- [ ] Configure Socket.IO for production scaling
- [ ] Add Redis for session management (optional)
- [ ] Set up monitoring & analytics (Sentry, New Relic)
- [ ] Configure CDN for static assets
- [ ] Set up database backups & replication
- [ ] Implement rate limiting & DDoS protection
- [ ] Add CI/CD pipeline (GitHub Actions, GitLab CI)

---

## 📋 Dependency Tree Summary

```
PartyUp Stack
├── Frontend (Web)
│   ├── React 19.2.1 + TypeScript 5.6.3
│   ├── Tailwind CSS 4.1.14
│   ├── Vite 7.1.7
│   ├── UI Components (Radix, Lucide)
│   └── Routing (Wouter)
├── Backend (Node.js)
│   ├── Express.js 5.2.1
│   ├── TypeScript 5.6.3
│   ├── tRPC (Type-safe RPC)
│   ├── Drizzle ORM
│   └── Socket.IO 4.8.3
├── Database
│   └── MySQL 9.6.0
├── Mobile
│   ├── React Native 0.83.0
│   ├── Expo 55.0.5
│   └── NativeWind 4.2.2
├── Infrastructure
│   ├── AWS (Rekognition, S3)
│   ├── Mapbox (Maps)
│   └── Socket.IO (Real-time)
└── Payment (Pending)
    └── PayMongo (To be integrated)
```

---

## 📝 Notes

- **React 19**: Latest React version with improved performance and features
- **TypeScript 5.6.3**: Ensures type safety across the entire stack
- **Tailwind CSS 4.1.14**: Latest version with improved performance
- **Drizzle ORM**: Type-safe SQL queries with TypeScript
- **tRPC**: End-to-end type safety from backend to frontend
- **Socket.IO 4.8.3**: Real-time communication for chat and notifications
- **Mapbox**: Industry-leading mapping solution
- **AWS Rekognition**: AI-powered facial verification for safety

---

## 🔗 Related Documentation

- [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) - System design
- [API_DATABASE_REFERENCE.md](API_DATABASE_REFERENCE.md) - API endpoints & database schema
- [FINAL_STATUS_REPORT.md](FINAL_STATUS_REPORT.md) - Implementation status

