# FixFlow — Система обработки заявок на ремонт оборудования

Клиент-серверное приложение на основе методологии **12-факторного приложения**.

## Стек

| Слой | Технологии |
|------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic |
| Database | PostgreSQL 16 (SQLite для local dev) |
| Frontend | TypeScript, React 18, Vite, MUI |
| Infra | Docker, Docker Compose, GitHub Actions |

## Архитектура (MVC)

```
backend/app/
├── models/       # M — SQLAlchemy-модели (User, Equipment, RepairRequest)
├── schemas/      # V — Pydantic-схемы (представление данных)
├── services/     # C — бизнес-логика
├── routers/      # HTTP-маршруты (View/Controller boundary)
├── config.py     # 12-factor: вся конфигурация из env vars
├── database.py   # Подключение к БД
├── logging_config.py  # Структурное JSON-логирование в stdout
├── middleware.py # Request-ID трассировка
└── main.py       # Точка входа, graceful shutdown
```

## Роли пользователей

| Роль | Права |
|------|-------|
| `admin` | Полный доступ, управление пользователями |
| `manager` | CRUD заявок и оборудования, назначение техников |
| `technician` | Просмотр назначенных заявок, обновление статуса/примечаний |
| `client` | Создание заявок, просмотр своих заявок |

## Быстрый старт (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- Демо-аккаунт: `admin` / `admin123`

## Локальная разработка (без Docker)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate  # или .venv\Scripts\activate на Windows
pip install -r requirements.txt
cp .env.example .env  # настройте DATABASE_URL на SQLite
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Переменные окружения

Все настройки передаются через env vars (12-factor, фактор III). Смотри [`.env.example`](.env.example).

Ключевые переменные:

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DATABASE_URL` | Строка подключения к БД | `sqlite:///./fixflow.db` |
| `SECRET_KEY` | JWT-секрет | `change-me...` |
| `PORT` | Порт backend | `8000` |
| `ENVIRONMENT` | `development` / `production` | `development` |
| `LOG_LEVEL` | Уровень логирования | `INFO` |

## Тесты

```bash
cd backend
pytest tests/ -v
```

Покрытие: auth, оборудование, заявки + **фаззинг-тестирование** (`tests/test_fuzz.py`).

## CI/CD (GitHub Actions)

При пуше в `main` или `staging`:
1. Запускаются тесты бэкенда
2. Собираются Docker-образы, тегируются commit hash
3. Образы пушатся в GitHub Container Registry (`ghcr.io/nedavi/`)

## Структура проекта

```
FixFlow/
├── backend/              # FastAPI-приложение
│   ├── app/
│   ├── migrations/       # Alembic-миграции
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # React+TypeScript SPA
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── .github/workflows/    # CI/CD
├── docker-compose.yml    # Dev-окружение
├── docker-compose.prod.yml  # Prod-окружение
└── .env.example
```
