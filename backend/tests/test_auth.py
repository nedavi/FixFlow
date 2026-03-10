def test_login_success(client):
    r = client.post("/api/auth/login", data={"username": "admin", "password": "admin123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password(client):
    r = client.post("/api/auth/login", data={"username": "admin", "password": "wrong"})
    assert r.status_code == 401


def test_register(client):
    r = client.post("/api/auth/register", json={
        "email": "testuser@test.com",
        "username": "testuser",
        "password": "pass123",
        "full_name": "Test User",
    })
    assert r.status_code == 201
    assert r.json()["role"] == "client"


def test_register_duplicate_email(client):
    data = {"email": "dup@test.com", "username": "dupuser1", "password": "pass123", "full_name": "Dup"}
    client.post("/api/auth/register", json=data)
    data["username"] = "dupuser2"
    r = client.post("/api/auth/register", json=data)
    assert r.status_code == 400


def test_me(client, admin_headers):
    r = client.get("/api/auth/me", headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["username"] == "admin"


def test_me_unauthorized(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401
