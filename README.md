# BiteBliss 🍽️✨

> **Delicious Food Delivered | Full-Stack Food Ordering & Experience Platform**

BiteBliss is a modern, feature-rich full-stack web application designed for seamless food ordering, interactive group dining, and automated billing.

---

## 🌟 Key Features

- **Intuitive UI & Rich Aesthetics**: Responsive modern design with dynamic category filtering (Biryani, Pizzas, Desserts, South Indian, Beverages, Starters), instant search, and real-time cart state.
- **Real-Time Interactive Coupon Engine**: Live discount calculations across Cart and Checkout views with feedback, badges, and automated price updates.
- **Interactive Group Bill Splitter (Unique Feature)**:
  - Add and manage dining friends on the fly.
  - Interactive checkboxes to selectively split bills among attendees.
  - Live per-person calculation with breakdown chips and one-click share/copy message.
- **Cart Management**: Add, increment, decrement, and remove items dynamically.
- **Secure Authentication & Roles**: JWT-based authentication supporting both Customer and Admin roles.
- **Admin Dashboard**: Real-time stats (revenue, active orders, customer count), menu item management, and order status tracking.
- **Polyglot Database Architecture**: 
  - **Relational (JPA/MySQL/H2)**: ACID-compliant transactions for Users, Authentication, Addresses, and Coupons.
  - **NoSQL Document Store (MongoDB)**: High-throughput document store for Order Snapshots (`orders`), Customer Reviews (`reviews`), and Real-Time Event Audit Logs (`activity_logs`).
- **Hybrid Microservices Architecture**: Spring Boot RESTful services integrated with a SOAP-based Billing & Invoice Generation service.

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3 (Modern Glassmorphism & Micro-animations), JavaScript (ES6+)
- **Backend**: Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, Spring Data MongoDB, Spring-WS (SOAP)
- **Database**: 
  - **MongoDB 8.x** (`mongodb://localhost:27017/bitebliss`)
  - **MySQL 8.x / H2**
- **Build Tool**: Apache Maven

---

## 🚀 Getting Started

### 1. Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.x (or configured H2)

### 2. Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080` (or `8081` if configured).*

### 3. Frontend Setup
Open `frontend/index.html` in your favorite web browser or serve via any static HTTP server (Live Server, Python HTTP server, or Nginx).

---

## 👥 Demo Credentials
- **Customer Account**: `demo@food.com` / `password123`
- **Admin Account**: `admin@food.com` / `admin123`

---

## 🍃 MongoDB NoSQL Endpoints
- **Status & Health**: `GET /api/mongo/status` - Live connection status, active collections (`orders`, `reviews`, `activity_logs`), and document counts.
- **Order Snapshots**: `GET /api/mongo/orders` - Comprehensive NoSQL order documents with item snapshots and group-split details.
- **User Orders**: `GET /api/mongo/orders/user/{userId}`
- **Customer Reviews**: `GET /api/mongo/reviews`
- **Audit Activity Logs**: `GET /api/mongo/activity` / `POST /api/mongo/activity`
