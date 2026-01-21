# Database Migrations

This project uses Alembic for database migrations to provide formal database schema management alongside the existing `SQLModel.metadata.create_all()` approach for development.

## Setup

First, ensure Alembic is installed:

```bash
pip install alembic
```

Alembic is already included in the `requirements.txt` file.

## Migration Commands

### Generate a new migration
```bash
# Set your database URL (for PostgreSQL)
export DATABASE_URL=postgresql://username:password@localhost/dbname
# Or for SQLite
export DATABASE_URL=sqlite:///./todo.db

# Generate a new migration based on model changes
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations to the database
```bash
# Set your database URL (for PostgreSQL)
export DATABASE_URL=postgresql://username:password@localhost/dbname
# Or for SQLite
export DATABASE_URL=sqlite:///./todo.db

# Upgrade to the latest migration
alembic upgrade head
```

### Downgrade migrations
```bash
# Downgrade to the previous migration
alembic downgrade -1

# Downgrade to the beginning (remove all tables)
alembic downgrade base
```

### Check current migration status
```bash
alembic current
```

### Show migration history
```bash
alembic history --verbose
```

## Production Usage

For production deployments:

1. Generate migrations when you make model changes
2. Test migrations on a copy of production data
3. Apply migrations using `alembic upgrade head` in your deployment process

## Development Usage

During development, the application continues to use `SQLModel.metadata.create_all()` in the startup event for convenience, which creates tables if they don't exist. However, you should also run Alembic migrations to maintain proper schema versioning.

## Migration File Location

Migration files are stored in `alembic/versions/` directory.

## Configuration

The Alembic configuration is in `alembic.ini` and the environment is configured in `alembic/env.py` to work with SQLModel and your existing models.