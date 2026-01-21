# Todo Full-Stack Monorepo

This is a monorepo for the Todo Full-Stack Web Application, containing both the frontend and backend applications in a unified repository structure.

## 🏗️ Monorepo Structure

```
root/
├── apps/
│   ├── frontend/           # Next.js frontend application
│   └── backend/            # FastAPI backend application
├── packages/
│   ├── shared/             # Shared libraries and utilities
│   └── common/             # Common configurations and types
├── tools/                  # Development tools and scripts
├── docs/                   # Documentation
└── ...
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.9 (for backend)
- pip (for Python dependencies)

### Installation

1. Install dependencies for all packages:
```bash
pnpm install-all
```

Or install separately:
```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
cd apps/frontend && pnpm install && cd ../..

# Install backend dependencies
cd apps/backend && pip install -r requirements.txt && cd ../..
```

### Development

Start both frontend and backend in development mode:
```bash
pnpm dev
```

Start individual services:
```bash
# Start frontend only
cd apps/frontend && pnpm dev

# Start backend only
cd apps/backend && pnpm dev
```

### Building

Build all packages:
```bash
pnpm build
```

Build individual packages:
```bash
# Build frontend
cd apps/frontend && pnpm build

# Build backend (if needed)
cd apps/backend && pnpm build
```

## 📦 Packages

### Apps
- `@todo/frontend`: Next.js frontend application
- `@todo/backend`: FastAPI backend application

### Services

#### Frontend (`apps/frontend`)
- Built with Next.js 14+
- TypeScript support
- Tailwind CSS for styling
- Better Auth for authentication
- API integration with backend

#### Backend (`apps/backend`)
- Built with FastAPI
- SQLModel for database modeling
- JWT-based authentication
- PostgreSQL support (via psycopg2-binary)

## 🛠️ Scripts

- `pnpm dev` - Start all development servers in parallel
- `pnpm build` - Build all packages
- `pnpm start` - Start all production services
- `pnpm test` - Run tests for all packages
- `pnpm lint` - Lint all packages
- `pnpm clean` - Clean build artifacts
- `pnpm install-all` - Install dependencies for all packages

## 🗃️ Database Migrations

The project includes Alembic for database migration management:

- Run migrations: `cd apps/backend && alembic upgrade head`
- Generate new migration: `cd apps/backend && alembic revision --autogenerate -m "Description"`
- Check migration status: `cd apps/backend && alembic current`

## 🤝 Contributing

1. Clone the repository
2. Install dependencies with `pnpm install-all`
3. Make your changes
4. Test with `pnpm test`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.