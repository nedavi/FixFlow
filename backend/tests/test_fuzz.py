"""
Fuzz testing: random/malformed/boundary inputs + schema-based fuzzing via Schemathesis.
Asserts the API never returns 5xx and never crashes on unexpected input.
"""
import random
import string

import schemathesis
from hypothesis import settings

from app.main import app

# ---------------------------------------------------------------------------
# Corpus-based fuzzing — ручной набор граничных и вредоносных строк
# ---------------------------------------------------------------------------

def _rand_str(length: int = 50) -> str:
    return "".join(random.choices(string.printable, k=length))


FUZZ_STRINGS = [
    "",
    " ",
    "a" * 10000,
    "<script>alert(1)</script>",
    "'; DROP TABLE users; --",
    "\x00\x01\x02",
    "../../etc/passwd",
    '{"key": "value"}',
    "null",
    "undefined",
    "1e999",
    "-1",
    "0",
    _rand_str(200),
]


def test_fuzz_login(client):
    for val in FUZZ_STRINGS:
        r = client.post("/api/auth/login", data={"username": val, "password": val})
        assert r.status_code in (200, 401, 422), f"Unexpected {r.status_code} for {val!r}"


def test_fuzz_register(client):
    for val in FUZZ_STRINGS:
        r = client.post("/api/auth/register", json={
            "email": val,
            "username": val,
            "password": val,
            "full_name": val,
        })
        assert r.status_code in (201, 400, 422), f"Unexpected {r.status_code} for {val!r}"


def test_fuzz_equipment_create(client, admin_headers):
    for val in FUZZ_STRINGS:
        r = client.post("/api/equipment/", json={
            "name": val,
            "serial_number": val,
            "equipment_type": val,
            "location": val,
        }, headers=admin_headers)
        assert r.status_code in (201, 400, 422), f"Unexpected {r.status_code} for {val!r}"


def test_fuzz_request_ids(client, admin_headers):
    for val in ["abc", "-1", "0", "99999999", "null", "1e5", " "]:
        r = client.get(f"/api/requests/{val}", headers=admin_headers)
        assert r.status_code in (200, 404, 422), f"Unexpected {r.status_code} for id={val!r}"


def test_fuzz_equipment_ids(client, admin_headers):
    for val in ["abc", "-1", "0", "99999999", "null"]:
        r = client.get(f"/api/equipment/{val}", headers=admin_headers)
        assert r.status_code in (200, 404, 422), f"Unexpected {r.status_code} for id={val!r}"


# ---------------------------------------------------------------------------
# Schema-based fuzzing — Schemathesis генерирует случайные данные по OpenAPI
# ---------------------------------------------------------------------------

schema = schemathesis.from_asgi("/openapi.json", app=app)


@schema.parametrize()
@settings(max_examples=15, deadline=3000)
def test_schema_fuzz_unauthenticated(case):
    """Случайные запросы без токена — не должно быть 5xx."""
    response = case.call_asgi()
    assert response.status_code < 500, (
        f"5xx на {case.method} {case.formatted_path}: {response.text[:200]}"
    )


@schema.parametrize()
@settings(max_examples=15, deadline=3000)
def test_schema_fuzz_authenticated(case, admin_token):
    """Случайные запросы с токеном админа — не должно быть 5xx."""
    response = case.call_asgi(headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code < 500, (
        f"5xx на {case.method} {case.formatted_path}: {response.text[:200]}"
    )
