# PSO Pump Management System

A complete petrol pump management solution for Pakistani PSO stations.

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis (optional, for real-time features)

### Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd PSO

# 2. Setup Backend
cd backend
cp .env.example .env  # Edit with your database credentials
npm install
npx prisma migrate dev
npm run start:dev

# 3. Setup Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## 🐳 Production Deployment (Docker)

### Prerequisites
- Docker & Docker Compose installed

### Deploy

```bash
# 1. Copy environment file and set secrets
cp .env.example .env
# Edit .env with secure passwords!

# 2. Build and start all services
docker-compose up -d --build

# This starts:
# - PostgreSQL database (port 5432)
# - Redis cache (port 6379)
# - Backend API (port 3001)
# - Frontend (port 3000)
```

### View logs
```bash
docker-compose logs -f
```

### Stop all services
```bash
docker-compose down
```

### Backup Database
```bash
docker exec pso-database pg_dump -U postgres pso_pump > backup.sql
```

### Restore Database
```bash
docker exec -i pso-database psql -U postgres pso_pump < backup.sql
```

---

## 📦 Client Handover Checklist

When handing over to a client:

1. **Copy entire project folder**
2. **Ensure client has Docker installed** (or PostgreSQL if running locally)
3. **Provide the `.env` file** with production secrets
4. **Run the deployment commands** above
5. **Create admin user** via the seeded defaults or API

---

## 🔐 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

⚠️ **Change these immediately after first login!**

---

## 📁 Project Structure

```
PSO/
├── backend/          # NestJS API
│   ├── src/          # Source code
│   ├── prisma/       # Database schema & migrations
│   └── Dockerfile    # Docker build file
├── frontend/         # Next.js App
│   ├── src/          # Source code
│   └── Dockerfile    # Docker build file
├── docker-compose.yml  # Production deployment
└── .env.example      # Environment template
```

---

## 🛠 Tech Stack

- **Frontend:** Next.js 15, React, TailwindCSS, Zustand
- **Backend:** NestJS, Prisma ORM, PostgreSQL
- **Real-time:** Socket.IO, Redis
- **Auth:** JWT with refresh tokens

---

## 📞 Support

For issues or questions, contact the development team.
