# 🐳 Docker Setup

Simple Docker configuration untuk AI Platform.

## Files
- `docker-compose.yml` - Konfigurasi utama
- `aiplatform-fe/Dockerfile` - Frontend container
- `aiplatform-be/Dockerfile` - Backend container

## Quick Start

1. **Build dan start services:**
```bash
docker-compose up --build
```

2. **Access aplikasi:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

## Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild dan restart
docker-compose up --build

# Run migrations (setelah services running)
docker-compose exec backend npm run migrate:up

# Seed database
docker-compose exec backend npm run seed:up
```

## Environment Files

Buat file `.env` di folder backend jika diperlukan:

```bash
cp aiplatform-be/.env.example aiplatform-be/.env
```

That's it! 🚀