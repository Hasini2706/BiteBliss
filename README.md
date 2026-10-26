\<div align="center">\
\
\# 🍽️ BiteBliss\
\
\*\*A full-stack food ordering platform with group bill splitting, a coupon engine and automated SOAP billing.\*\*\
\
![Java]\(https\://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white)\
![Spring Boot]\(https\://img.shields.io/badge/Spring%20Boot-3-6DB33F?logo=springboot&logoColor=white)\
![MongoDB]\(https\://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)\
![MySQL]\(https\://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)\
![Maven]\(https\://img.shields.io/badge/Build-Maven-C71A36?logo=apachemaven&logoColor=white)\
![Docker]\(https\://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)\
\
![BiteBliss home page]\(docs/screenshots/home.png)\
\
\</div>\
\
BiteBliss lets customers browse a menu, build a cart, apply coupons, place an order and track it, and then \*\*split the bill with friends\*\*. Behind the UI, Spring Boot REST services work together with a SOAP billing service and a polyglot database layer (relational for transactions, MongoDB for order snapshots, reviews and audit logs). It was built as the \*API & Microservices\* course project (Department of AI & ML, Aditya University).\
\
\## 📑 Table of Contents\
\
\- [Key Features]\(#-key-features)\
\- [Screenshots]\(#-screenshots)\
\- [Architecture]\(#-architecture)\
\- [Technology Stack]\(#️-technology-stack)\
\- [Getting Started]\(#-getting-started)\
\- [Demo Credentials]\(#-demo-credentials)\
\- [API Reference]\(#-api-reference)\
\- [Deployment]\(#️-deployment)\
\- [Troubleshooting]\(#-troubleshooting)\
\- [Roadmap]\(#-roadmap)\
\- [Team]\(#-team)\
\
\## 🌟 Key Features\
\
\| Area | What you get |\
\|---|---|\
\| \*\*Discovery & menu\*\* | Home page with popular cuisines and offers; category filters (Biryani, Pizzas, Desserts, South Indian, Beverages, Starters); instant search; vegetarian / non-vegetarian, rating and delivery-time filters; sorting; menu pagination |\
\| \*\*Cart\*\* | Add, increment, decrement and remove items; special cooking instructions; real-time cart state |\
\| \*\*Coupon engine\*\* | Live discount calculation across Cart and Checkout with feedback, badges and automatic price updates |\
\| \*\*Group bill splitter\*\* ⭐ | Add friends on the fly, choose who shares the bill, split equally or by item, see a live per-person breakdown (fees, taxes and discounts included), UPI QR codes, and one-click share/copy message |\
\| \*\*Order tracking\*\* | Order ID and confirmation, status stages (Order Placed → Accepted → Preparing → Ready → Out for Delivery → Delivered), status history with live updates, tax invoice with print option |\
\| \*\*Security\*\* | JWT authentication with \*\*Customer\*\* and \*\*Admin\*\* roles |\
\| \*\*Admin dashboard\*\* | Live stats (revenue, active orders, customer count), menu item management, order status tracking |\
\| \*\*Reliability\*\* | Transaction management, AOP request logging, input validation and centralised exception handling |\
\| \*\*Billing\*\* | SOAP-based Billing & Invoice Generation service integrated with order processing |\
\
\## 📸 Screenshots\
\
\| Menu | Cart & coupons |\
\|---|---|\
\| ![Menu]\(docs/screenshots/menu.png) | ![Cart]\(docs/screenshots/cart.png) |\
\
\| Order tracking | Group bill splitter |\
\|---|---|\
\| ![Order tracking]\(docs/screenshots/order-tracking.png) | ![Bill splitter]\(docs/screenshots/bill-split.png) |\
\
\## 🧭 Architecture\
\
\`\`\`mermaid\
flowchart LR\
&#x20;   UI["Frontend\<br/>HTML · CSS · JavaScript"] -->|REST + JWT| API["Spring Boot REST services"]\
&#x20;   API --> SEC["Spring Security\<br/>(JWT, roles)"]\
&#x20;   API --> JPA[("MySQL / H2\<br/>users, auth, addresses, coupons")]\
&#x20;   API --> MONGO[("MongoDB\<br/>orders, reviews, activity_logs")]\
&#x20;   API -->|SOAP| BILL["Billing & Invoice service\<br/>(Spring-WS)"]\
\`\`\`\
\
\*\*Order flow:\*\* login → browse menu → select items and quantity → create order (REST) → validate order details → transaction processing → SOAP billing → order confirmation shown to the user.\
\
\*\*Why two databases?\*\* Users, authentication, addresses and coupons need ACID transactions, so they live in a relational store (JPA with MySQL or H2). Order snapshots, reviews and audit logs are write-heavy documents, so they live in MongoDB.\
\
\## 🛠️ Technology Stack\
\
\| Layer | Technology |\
\|---|---|\
\| Frontend | Vanilla HTML5, CSS3 (glassmorphism and micro-animations), JavaScript (ES6+) |\
\| Backend | Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, Spring Data MongoDB, Spring-WS (SOAP) |\
\| Databases | MySQL 8.x or H2 (relational), MongoDB 8.x (\`mongodb://localhost:27017/bitebliss\`) |\
\| Build | Apache Maven |\
\| Deployment | Docker / Docker Compose, Render or Railway |\
\
\## 🚀 Getting Started\
\
\### Prerequisites\
\
\- Java 17+\
\- Maven 3.6+\
\- MySQL 8.x (or use the configured H2 database)\
\- MongoDB running locally, or a MongoDB Atlas URI\
\
\### 1. Clone the repository\
\
\`\`\`bash\
git clone https\://github.com/Hasini2706/BiteBliss.git\
cd BiteBliss\
\`\`\`\
\
\### 2. Start the backend\
\
\`\`\`bash\
cd backend\
mvn clean install\
mvn spring-boot:run\
\`\`\`\
\
The backend runs on \`http\://localhost:8080\` (or \`8081\` if configured).\
\
\### 3. Open the frontend\
\
Open \`frontend/index.html\` in your browser, or serve the folder with any static server:\
\
\`\`\`bash\
cd frontend\
python -m http.server 5500\
\`\`\`\
\
\### Run everything with Docker\
\
\`\`\`bash\
docker compose up -d --build\
\`\`\`\
\
Then open \`http\://localhost:8081/index.html\`.\
\
\## 🔑 Demo Credentials\
\
\| Role | Email | Password |\
\|---|---|---|\
\| Customer | \`demo@food.com\` | \`password123\` |\
\| Admin | \`admin@food.com\` | \`admin123\` |\
\
\> ⚠️ These accounts are for local demos only. Change them (and any secrets) before exposing the app publicly.\
\
\## 📡 API Reference\
\
Protected endpoints expect the header \`Authorization: Bearer \<JWT>\`.\
\
\### MongoDB endpoints\
\
\| Method | Endpoint | Description |\
\|---|---|---|\
\| \`GET\` | \`/api/mongo/status\` | Connection status, active collections (\`orders\`, \`reviews\`, \`activity_logs\`) and document counts |\
\| \`GET\` | \`/api/mongo/orders\` | Order documents with item snapshots and group-split details |\
\| \`GET\` | \`/api/mongo/orders/user/{userId}\` | Orders of one user |\
\| \`GET\` | \`/api/mongo/reviews\` | Customer reviews |\
\| \`GET\` | \`/api/mongo/activity\` | Audit activity logs |\
\| \`POST\` | \`/api/mongo/activity\` | Record an activity log entry |\
\
Quick check once the backend is running:\
\
\`\`\`bash\
curl http\://localhost:8080/api/mongo/status\
\`\`\`\
\
Order APIs support creating, retrieving, updating and cancelling orders, and the menu API supports pagination.\
\
\## ☁️ Deployment\
\
\### Option 1: Render / Railway (free cloud web service)\
\
1\. Push your repository to GitHub.\
2\. Sign up on [Render]\(https\://render.com) or [Railway]\(https\://railway.app).\
3\. Create a \*\*New Web Service\*\* and select \`Hasini2706/BiteBliss\`.\
4\. Choose the \*\*Docker\*\* environment (or the Maven runtime):\
&#x20;  \- \*\*Build command:\*\* \`cd backend && ./mvnw clean package -DskipTests\`\
&#x20;  \- \*\*Start command:\*\* \`java -jar backend/target/backend-0.0.1-SNAPSHOT.jar\`\
5\. Set environment variables:\
\
&#x20;  \| Variable | Value |\
&#x20;  \|---|---|\
&#x20;  \| \`SPRING_DATA_MONGODB_URI\` | Your MongoDB Atlas connection URI |\
&#x20;  \| \`PORT\` | \`8080\` (or \`8081\`) |\
\
6\. Deploy. Render builds the app and gives you a public \`https\://...onrender.com\` URL.\
\
\### Option 2: Docker / Docker Compose\
\
Run locally or on any cloud VPS (AWS EC2, DigitalOcean):\
\
\`\`\`bash\
docker compose up -d --build\
\`\`\`\
\
\## 🩺 Troubleshooting\
\
\| Problem | Fix |\
\|---|---|\
\| Backend cannot connect to MongoDB | Make sure MongoDB is running at \`mongodb://localhost:27017/bitebliss\`, or set \`SPRING_DATA_MONGODB_URI\` |\
\| Port already in use | Stop the other process, or change the port (\`8080\` / \`8081\`) |\
\| MySQL connection errors | Start MySQL 8.x, or switch to the configured H2 database |\
\| Frontend loads but shows no data | Check that the backend is running and the port matches the one the frontend calls |\
\
\## 🗺️ Roadmap\
\
\- [ ] Online payments (UPI, cards, wallets)\
\- [ ] Live GPS order tracking and delivery partner management\
\- [ ] Personalised recommendations\
\- [ ] Order, billing and delivery notifications\
\- [ ] Restaurant management interface (menus, prices, availability)\
\- [ ] Loyalty points, personalised coupons and rewards\
\- [ ] Android and iOS apps\
\
\## 👥 Team\
\
Built by the Department of Artificial Intelligence and Machine Learning, Aditya University (Batch 21, \*API & Microservices\*):\
\
\- K. Swarna\
\- K. Sasi Meghana\
\- M. Tejo Hasini\
\- O. Bheemeswari\
\
\---\
\
\<div align="center">Made with ❤️ for good food and fair bill splitting.\</div>\





give proffessional readme&#x20;
to contribute my part
