# AcademIA — proyecto guía

API de una plataforma de cursos online, construida sesión a sesión en el bloque
**ORMs, APIs REST y Seguridad + Testing Backend** (EDEM).

## Requisitos

- Node.js ≥ 24
- Docker Desktop

## Arrancar

```bash
npm install
cp .env.example .env
docker compose up -d          # PostgreSQL 16 en localhost:5432
npx prisma migrate dev        # aplica migraciones
npx prisma generate           # Prisma 7: migrate ya NO genera el cliente
```

## Ramas

Cada sesión tiene una rama de partida: `s1-start`, `s2-start`, … `s6-start`.
Si te has quedado atrás, haz checkout de la rama de la sesión y sigue desde ahí.
