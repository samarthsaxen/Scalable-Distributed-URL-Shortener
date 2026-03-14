# 🚀 Scalable Distributed URL Shortener

A production-style URL shortening service designed with scalable backend architecture.

Inspired by services like Bitly.

This project demonstrates backend engineering, distributed systems concepts, caching strategies, analytics tracking, and full-stack development.

---

# 🌐 Architecture

User → React Frontend → Node.js API → Redis Cache → MongoDB

Goal:
- Low latency redirects
- Scalable architecture
- Efficient caching
- Analytics tracking

---

# 🛠 Tech Stack

Frontend
- React.js
- Vite
- JavaScript
- CSS

Backend
- Node.js
- Express.js
- MongoDB
- Redis

DevOps
- Docker
- Docker Compose

API Documentation
- Swagger / OpenAPI

---

# ⚡ Features

## Core Features

✔ URL Shortening  
✔ Custom Short URLs  
✔ URL Expiration  
✔ Click Analytics  
✔ QR Code Generation  
✔ Alias Availability Check  

---

## Performance Features

✔ Redis caching for fast redirects  
✔ API rate limiting  
✔ Optimized MongoDB indexing  

---

## UX Features

✔ Modern React interface  
✔ Copy-to-clipboard  
✔ URL history persistence  
✔ Analytics charts  

---

# 📊 Analytics

Each short URL tracks:

- Total clicks
- Creation time
- Click analytics charts
- QR code generation

---

# 📘 API Documentation

Swagger API docs available at:
# 🚀 Scalable Distributed URL Shortener

A production-style URL shortening service designed with scalable backend architecture.

Inspired by services like Bitly.

This project demonstrates backend engineering, distributed systems concepts, caching strategies, analytics tracking, and full-stack development.

---

# 🌐 Architecture

User → React Frontend → Node.js API → Redis Cache → MongoDB

Goal:
- Low latency redirects
- Scalable architecture
- Efficient caching
- Analytics tracking

---

# 🛠 Tech Stack

Frontend
- React.js
- Vite
- JavaScript
- CSS

Backend
- Node.js
- Express.js
- MongoDB
- Redis

DevOps
- Docker
- Docker Compose

API Documentation
- Swagger / OpenAPI

---

# ⚡ Features

## Core Features

✔ URL Shortening  
✔ Custom Short URLs  
✔ URL Expiration  
✔ Click Analytics  
✔ QR Code Generation  
✔ Alias Availability Check  

---

## Performance Features

✔ Redis caching for fast redirects  
✔ API rate limiting  
✔ Optimized MongoDB indexing  

---

## UX Features

✔ Modern React interface  
✔ Copy-to-clipboard  
✔ URL history persistence  
✔ Analytics charts  

---

# 📊 Analytics

Each short URL tracks:

- Total clicks
- Creation time
- Click analytics charts
- QR code generation

---

# 📘 API Documentation

Swagger API docs available at:
http://localhost:5000/api/docs

---

# 📂 Project Structure
Scalable-Distributed-URL-Shortener
│
├── backend
│ ├── src
│ │ ├── config
│ │ │ ├── db.js
│ │ │ ├── redis.js
│ │ │ └── swagger.js
│ │ │
│ │ ├── controllers
│ │ ├── models
│ │ ├── routes
│ │ └── app.js
│ │
│ └── package.json
│
├── frontend
│ ├── src
│ └── package.json
│
└── docker-compose.yml

---

# 🐳 Docker Setup

Run the entire system with:
docker-compose up

This starts:

- Node API
- MongoDB
- Redis

---

# 🚀 Local Development Setup

Clone repository

This starts:

- Node API
- MongoDB
- Redis

---

# 🚀 Local Development Setup

Clone repository
git clone https://github.com/samarthsaxen/Scalable-Distributed-URL-Shortener.git

Backend setup
cd backend
npm install
npm run dev

Frontend setup
cd frontend
npm install
npm run dev

Frontend will run on
http://localhost:5173

---

# 🧠 System Design Highlights

### Redis Caching

Redirect requests first check Redis.

Flow:

User → API → Redis

Cache hit → instant redirect  
Cache miss → MongoDB lookup → cache update

---

### Rate Limiting

Implemented using:

---

# 🧠 System Design Highlights

### Redis Caching

Redirect requests first check Redis.

Flow:

User → API → Redis

Cache hit → instant redirect  
Cache miss → MongoDB lookup → cache update

---

### Rate Limiting

Implemented using:
express-rate-limit

Prevents abuse such as excessive requests.

---

### MongoDB Indexing

Indexes added on:
shortCode

Ensures fast redirect lookup.

---

# 🔮 Future Improvements

- Geo analytics
- User authentication dashboard
- Link management (edit / delete)
- CI/CD deployment pipeline

---

# 👨‍💻 Author

Samarth Saxena  
B.Tech Electronics Engineering — MAIT Delhi

Interested in backend engineering, scalable APIs, and distributed systems.

---

⭐ If you like this project, give it a star!
