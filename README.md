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
backend/
├── app/
│   ├── models/               # M — модели SQLAlchemy
│   │   ├── user.py
│   │   ├── equipment.py
│   │   └── repair_request.py
│   ├── schemas/              # V — представление данных (Pydantic)
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── equipment.py
│   │   └── repair_request.py
│   ├── services/             # C — бизнес-логика
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── equipment.py
│   │   └── repair_requests.py
│   ├── routers/              # C — маршруты (контроллеры)
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── equipment.py
│   │   └── repair_requests.py
│   ├── config.py             # конфигурация (env vars)
│   ├── database.py           # подключение к СУБД
│   ├── dependencies.py       # зависимости FastAPI (auth, roles)
│   ├── logging_config.py     # структурное JSON-логирование
│   ├── middleware.py         # Request-ID трассировка
│   └── main.py               # точка входа приложения
├── migrations/               # миграции Alembic
├── tests/                    # модульные и фаззинг-тесты
├── Dockerfile
└── requirements.txt
```

## Роли пользователей

| Роль | Права |
|------|-------|
| `admin` | Полный доступ, управление пользователями |
| `manager` | CRUD заявок и оборудования, назначение техников |
| `technician` | Просмотр всех заявок, обновление статуса/примечаний своих |
| `client` | Создание заявок, просмотр своих заявок |

## Тестовые данные (seed)

При первом запуске автоматически создаются:

| Логин | Пароль | Роль |
|-------|--------|------|
| `admin` | `admin123` | Администратор |
| `manager1` | `manager123` | Менеджер |
| `tech1` | `tech123` | Техник |
| `tech2` | `tech123` | Техник |
| `client1` | `client123` | Клиент |
| `client2` | `client123` | Клиент |

А также 5 единиц оборудования и 5 заявок с разными статусами.

## Быстрый старт (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

## Локальная разработка (без Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload

cd frontend
npm install
npm run dev
```

## Миграции

Схема БД управляется через Alembic:

```bash
alembic upgrade head          # применить миграции
alembic revision --autogenerate -m "name"  # создать новую миграцию
alembic downgrade -1          # откатить последнюю
```

При деплое Railway автоматически запускает `alembic upgrade head` перед стартом сервера.

## Переменные окружения

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

При пуше в `main`:
1. **Lint** — проверка кода (ruff)
2. **Test** — запуск pytest
3. **Build** — сборка Docker-образов → GHCR
4. Railway автодеплоит после зелёного CI (Wait for CI)

## Структура проекта

```
FixFlow/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── routers/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── logging_config.py
│   │   ├── middleware.py
│   │   └── main.py
│   ├── migrations/
│   │   └── versions/
│   │       └── 67c1241e63e2_init.py
│   ├── tests/
│   ├── alembic.ini
│   ├── pyproject.toml
│   ├── railway.toml
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── railway.toml
│   └── package.json
├── .github/workflows/
│   └── ci.yml
├── docker-compose.yml
└── .env.example
```
