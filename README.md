# 🍽️ Integrated Food Delivery & Dine-Out Hospitality Platform

> **Infotact Technical Internship Program — Project 2**  
> A full-stack, real-time hospitality aggregator unifying food delivery, table reservations, and event discovery into a single cohesive ecosystem.

---

## 📌 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [WebSocket Events](#websocket-events)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Folder Structure](#folder-structure)
- [Development Roadmap](#development-roadmap)
- [Testing](#testing)
- [Deployment](#deployment)
- [GitHub & Version Control Standards](#github--version-control-standards)
- [Performance Benchmarks](#performance-benchmarks)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

The modern food-tech and hospitality industry suffers from significant digital fragmentation — consumers juggle multiple apps for delivery, reservations, and event ticketing, leading to application fatigue. Restaurant partners face exorbitant commission fees and disjointed dashboards.

This platform solves that by providing:

- A **unified consumer experience** — order food, reserve tables, discover events, all in one place.
- A **merchant-first command dashboard** — manage orders, menus, and table availability in real time.
- A **gamified review engine** — incentivises high-quality, detailed user feedback using a points and loyalty system.
- A **real-time order state machine** — powered by WebSockets for live delivery tracking across consumers, merchants, and couriers.

---

## Key Features

### For Consumers
- 📍 **Geospatial Restaurant Discovery** — find nearby restaurants filtered by cuisine, rating, and distance using MongoDB `$geoNear` aggregation.
- 🛒 **Unified Cart & Checkout** — seamlessly switch between delivery orders and table reservations in a single cart flow.
- 🔴 **Live Order Tracking** — real-time status updates pushed via Socket.io (Accepted → Preparing → In Transit → Delivered).
- ⭐ **Gamified Reviews** — earn loyalty points by writing detailed reviews; points are calculated based on word count, keyword density, and uploaded media.
- 🤖 **AI-Assisted Review Prompts** — intelligent keyword suggestions based on your specific order history to lower the friction of writing quality feedback.

### For Restaurant Partners
- 🗂️ **Merchant Dashboard** — toggle menu item availability, accept/reject orders in real time, and visualise daily revenue.
- 📊 **Sentiment Analytics** — monitor aggregated sentiment derived from customer review text.
- 📡 **WebSocket Order Dispatch** — receive and respond to incoming delivery orders instantly without page refresh.

### For Delivery Couriers
- 🗺️ **Algorithmic Routing** — optimised geospatial navigation between merchant and consumer.
- 💰 **Earnings Tracker** — transparent daily earnings visibility.
- 📲 **Instant Dispatch Alerts** — real-time push notifications via Socket.io.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Web Frontend** | React.js, Tailwind CSS | Component-based UI with fast iteration and responsive design |
| **Backend API** | Node.js, Express.js | Lightweight, asynchronous server ideal for I/O-heavy real-time operations |
| **Database** | MongoDB Atlas | NoSQL document model handles variable menu schemas; native `$geoNear` for geospatial queries |
| **Real-time Layer** | Socket.io (WebSockets) | Bidirectional event streaming for live order state updates and courier GPS tracking |
| **Cloud Storage** | AWS S3 | Durable object storage for restaurant images and user-uploaded media |
| **Compute** | AWS EC2 | Scalable cloud compute for the containerised backend |
| **Containerisation** | Docker | Environment parity from local development to production |
| **CI/CD** | GitHub Actions | Automated linting, testing, and deployment pipelines on every Pull Request |

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT LAYER                       │
│         React.js Web App  (Tailwind CSS)              │
└────────────────────────┬─────────────────────────────┘
                         │ REST / WebSocket
┌────────────────────────▼─────────────────────────────┐
│                   API GATEWAY                         │
│            Node.js + Express.js Server                │
│   ┌──────────────┐  ┌────────────┐  ┌─────────────┐  │
│   │  Auth Routes │  │  REST APIs │  │  Socket.io  │  │
│   │  (JWT/bcrypt)│  │  (CRUD)    │  │  (WS Layer) │  │
│   └──────────────┘  └────────────┘  └─────────────┘  │
└────────────────────────┬─────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────┐
│                  DATA LAYER                           │
│   ┌──────────────────────┐   ┌──────────────────┐    │
│   │  MongoDB Atlas        │   │   AWS S3          │    │
│   │  (2dsphere indexed)   │   │   (Media Storage) │    │
│   └──────────────────────┘   └──────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "passwordHash": "String",
  "role": "consumer | merchant | courier",
  "loyaltyPoints": "Number",
  "location": {
    "type": "Point",
    "coordinates": ["lng", "lat"]
  },
  "createdAt": "Date"
}
```

### Restaurants Collection
```json
{
  "_id": "ObjectId",
  "ownerId": "ObjectId (ref: Users)",
  "name": "String",
  "cuisineType": ["String"],
  "rating": "Number",
  "location": {
    "type": "Point",
    "coordinates": ["lng", "lat"]   // 2dsphere indexed
  },
  "address": "String",
  "imageUrl": "String (S3 URL)",
  "isOpen": "Boolean",
  "createdAt": "Date"
}
```

### Menu Items Collection
```json
{
  "_id": "ObjectId",
  "restaurantId": "ObjectId (ref: Restaurants)",
  "name": "String",
  "description": "String",
  "price": "Number",
  "category": "String",
  "isAvailable": "Boolean",
  "imageUrl": "String (S3 URL)"
}
```

### Orders Collection
```json
{
  "_id": "ObjectId",
  "consumerId": "ObjectId (ref: Users)",
  "restaurantId": "ObjectId (ref: Restaurants)",
  "courierId": "ObjectId (ref: Users)",
  "type": "delivery | reservation",
  "items": [{ "menuItemId": "ObjectId", "quantity": "Number", "price": "Number" }],
  "totalAmount": "Number",
  "status": "PENDING | ACCEPTED | PREPARING | COURIER_ASSIGNED | IN_TRANSIT | DELIVERED",
  "deliveryAddress": "String",
  "reservationTime": "Date",
  "paymentStatus": "pending | paid | failed",
  "createdAt": "Date"
}
```

### Reviews Collection
```json
{
  "_id": "ObjectId",
  "consumerId": "ObjectId (ref: Users)",
  "restaurantId": "ObjectId (ref: Restaurants)",
  "orderId": "ObjectId (ref: Orders)",
  "rating": "Number (1–5)",
  "text": "String",
  "mediaUrls": ["String"],
  "pointsAwarded": "Number",
  "createdAt": "Date"
}
```

> **Geospatial Index:** The `location` field on the `Restaurants` collection uses a `2dsphere` index to enable high-performance proximity-based queries via MongoDB's `$geoNear` aggregation pipeline.

---

## API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login and receive JWT | No |
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |

### Restaurant Routes — `/api/restaurants`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/nearby` | Get restaurants sorted by proximity + rating (`$geoNear`) | No |
| GET | `/:id` | Get restaurant details | No |
| POST | `/` | Create a new restaurant listing | Yes (Merchant) |
| PUT | `/:id` | Update restaurant details | Yes (Merchant) |

**Query Parameters for `/nearby`:**
```
?lat=19.0760&lng=72.8777&maxDistance=5000&cuisine=Italian&minRating=4
```

### Menu Routes — `/api/restaurants/:id/menu`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/` | Get all menu items for a restaurant | No |
| POST | `/` | Add a menu item | Yes (Merchant) |
| PUT | `/:itemId` | Update item (price, availability) | Yes (Merchant) |
| DELETE | `/:itemId` | Remove a menu item | Yes (Merchant) |

### Order Routes — `/api/orders`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/` | Place a new order (delivery or reservation) | Yes |
| GET | `/my` | Get all orders for the logged-in user | Yes |
| GET | `/:id` | Get order details | Yes |
| PUT | `/:id/status` | Update order status | Yes (Merchant/Courier) |

### Review Routes — `/api/reviews`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/` | Submit a gamified review and earn points | Yes |
| GET | `/restaurant/:id` | Get all reviews for a restaurant | No |

---

## WebSocket Events

The platform uses Socket.io for real-time order tracking. All events are namespaced under `/orders`.

### Client → Server (Emitted by client)

| Event | Payload | Description |
|---|---|---|
| `join_order_room` | `{ orderId }` | Consumer/courier joins a specific order room |
| `courier_location_update` | `{ orderId, lat, lng }` | Courier sends live GPS coordinates |
| `merchant_action` | `{ orderId, action: "ACCEPT" \| "REJECT" }` | Merchant accepts or rejects an order |

### Server → Client (Broadcast by server)

| Event | Payload | Description |
|---|---|---|
| `ORDER_ACCEPTED` | `{ orderId, estimatedTime }` | Broadcast when merchant accepts order |
| `ORDER_PREPARING` | `{ orderId }` | Kitchen has started preparation |
| `COURIER_ASSIGNED` | `{ orderId, courierName }` | A courier has been matched |
| `IN_TRANSIT` | `{ orderId, lat, lng }` | Live courier location stream |
| `DELIVERED` | `{ orderId }` | Order marked as delivered |

---

## Environment Setup

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Docker & Docker Compose
- MongoDB Atlas account
- AWS account (S3 + EC2)

### Clone the Repository

```bash
git clone https://github.com/your-org/hospitality-platform.git
cd hospitality-platform
```

### Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `/server` directory. **Never commit this file.**

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hospitality

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=hospitality-media
AWS_REGION=ap-south-1

# Payment Gateway (Mock)
PAYMENT_GATEWAY_KEY=mock_key_123
```

> All secrets must be stored as **GitHub Secrets** in CI/CD pipelines — never hardcoded in source code.

---

## Running the Project

### Option 1: Docker (Recommended)

```bash
# From the project root
docker-compose up --build
```

This spins up:
- Express.js API on `http://localhost:5000`
- React frontend on `http://localhost:3000`
- Local MongoDB instance (for development)

### Option 2: Manual

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

---

## Folder Structure

```
hospitality-platform/
├── client/                         # React.js Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route-level pages
│   │   │   ├── Home.jsx
│   │   │   ├── RestaurantDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── OrderTracking.jsx
│   │   │   └── MerchantDashboard.jsx
│   │   ├── store/                  # Redux Toolkit / Zustand state
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # Axios API service layer
│   │   ├── socket/                 # Socket.io client setup
│   │   └── App.jsx
│   └── package.json
│
├── server/                         # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                   # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── restaurantController.js
│   │   ├── orderController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   └── roleMiddleware.js       # Role-based access control
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── restaurants.js
│   │   ├── orders.js
│   │   └── reviews.js
│   ├── sockets/
│   │   └── orderSocket.js          # Socket.io event handlers
│   ├── utils/
│   │   └── reviewScorer.js         # Gamification points algorithm
│   ├── app.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI/CD pipeline
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Development Roadmap

### Week 1 — Geospatial Architecture & Application Scaffolding
- [x] GitHub repository setup with branch protection rules
- [x] MongoDB Atlas cluster configuration
- [x] NoSQL schema design (Users, Restaurants, MenuItems, Orders, Reviews)
- [x] `2dsphere` geospatial index on `Restaurant.location`
- [x] JWT authentication (register, login, profile endpoints)
- [x] Role-based access control middleware (Consumer, Merchant, Courier)

### Week 2 — Merchant Discovery, Cart Logic & WebSockets
- [x] `$geoNear` aggregation pipeline for proximity-based restaurant search
- [x] Paginated restaurant listings sorted by distance + rating
- [x] Frontend cart state management (Redux Toolkit / Zustand)
- [x] Cart validation — prevents mixing items from multiple restaurants
- [x] Socket.io server initialisation with event-driven order state machine

### Week 3 — Transactional Checkout, Review Gamification & AI Prompts
- [x] Mock payment gateway integration with order status update
- [x] Gamified Review Engine — points algorithm (word count + keyword density + media bonus)
- [x] AI-assisted review prompts using NLP keyword suggestions from order history
- [x] Loyalty points awarded and persisted to user profile on review submission

### Week 4 — Merchant Dashboard, Query Optimisation & Deployment
- [x] Merchant dashboard — toggle availability, accept/reject WebSocket orders, revenue view
- [x] MongoDB query optimisation using `explain()` — confirmed 2dsphere index usage
- [x] Integration tests for WebSocket reconnection handling
- [x] Docker containerisation
- [x] GitHub Actions CI/CD pipeline
- [x] Deployment to AWS EC2 (backend) + Vercel/S3 (frontend)

---

## Testing

### Unit Tests (Jest)

```bash
cd server
npm run test
```

Covers: review scoring algorithm, geospatial query logic, JWT middleware, role access control.

### Integration Tests

```bash
npm run test:integration
```

Covers: WebSocket reconnection scenarios, order state transitions, cart validation edge cases.

### Running Tests in CI

Tests run automatically on every Pull Request via GitHub Actions. A failing test blocks the merge.

---

## Deployment

### Backend (AWS EC2 via Docker)

```bash
docker build -t hospitality-api ./server
docker run -p 5000:5000 --env-file .env hospitality-api
```

### Frontend (Vercel)

Connect the `/client` directory to Vercel. Set environment variables in the Vercel dashboard.

### CI/CD Pipeline (GitHub Actions)

Located at `.github/workflows/ci.yml`. Triggers on every Pull Request to `main`:

1. Install dependencies
2. Run ESLint
3. Run unit test suite
4. Fail build if any step fails
5. On merge to `main` — auto-deploy to production

---

## GitHub & Version Control Standards

This project follows enterprise-grade Git practices as required by the Infotact internship evaluation criteria.

**Commit Convention** — [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add geospatial restaurant search endpoint
fix: resolve cart validation for multi-restaurant edge case
refactor: extract review scoring logic into utility module
docs: update API reference for /orders route
```

**Branching Strategy:**
- `main` — production-ready code only
- `develop` — integration branch
- `feature/<name>` — all new feature development
- `fix/<name>` — bug fixes

**Pull Request Rules:**
- Direct commits to `main` are forbidden
- Every PR requires a description: problem solved, approach taken, testing steps
- Self-review with inline comments on complex logic is mandatory before merging

**Security:**
- No API keys or secrets in source code — ever
- All secrets managed via GitHub Secrets
- `GITHUB_TOKEN` scoped to read-only unless deployment requires write access

> ⚠️ **Evaluation Note:** The project must reflect continuous daily commits across all 4 weeks. A bulk push in the final week results in automatic disqualification.

---

## Performance Benchmarks

| Metric | Target |
|---|---|
| Geospatial search latency | < 200ms |
| WebSocket order state update | < 500ms |
| Review Conversion Rate | Maximised via gamification |
| System Uptime | ≥ 99.9% |
| API Response Time (p95) | < 300ms |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit using Conventional Commits
4. Open a Pull Request with a detailed description
5. Ensure all CI checks pass before requesting a review

---

## License

This project is developed as part of the **Infotact Technical Internship Program** and is intended for educational and evaluation purposes only.

---

> Built with ❤️ at Infotact Solutions & Co., Bengaluru, Karnataka.
