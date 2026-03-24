import uuid

import pytest


@pytest.fixture
def equipment_id(client, admin_headers):
    serial = f"SN-REQ-{uuid.uuid4().hex[:8].upper()}"
    r = client.post("/api/equipment/", json={
        "name": "Printer HP", "serial_number": serial,
        "equipment_type": "Printer", "location": "Office 2",
    }, headers=admin_headers)
    return r.json()["id"]


def test_create_request(client, admin_headers, equipment_id):
    r = client.post("/api/requests/", json={
        "title": "Printer is broken",
        "description": "Paper jam",
        "priority": "high",
        "equipment_id": equipment_id,
    }, headers=admin_headers)
    assert r.status_code == 201
    assert r.json()["status"] == "new"


def test_list_requests(client, admin_headers):
    r = client.get("/api/requests/", headers=admin_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_get_request_not_found(client, admin_headers):
    r = client.get("/api/requests/99999", headers=admin_headers)
    assert r.status_code == 404


def test_update_request_status(client, admin_headers, equipment_id):
    create_r = client.post("/api/requests/", json={
        "title": "Fix AC", "priority": "medium", "equipment_id": equipment_id,
    }, headers=admin_headers)
    req_id = create_r.json()["id"]
    r = client.patch(f"/api/requests/{req_id}", json={"status": "in_progress"}, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "in_progress"


def test_delete_request(client, admin_headers, equipment_id):
    create_r = client.post("/api/requests/", json={
        "title": "Replace UPS", "priority": "low", "equipment_id": equipment_id,
    }, headers=admin_headers)
    req_id = create_r.json()["id"]
    r = client.delete(f"/api/requests/{req_id}", headers=admin_headers)
    assert r.status_code == 204


def test_create_request_invalid_equipment(client, admin_headers):
    r = client.post("/api/requests/", json={
        "title": "Test", "priority": "low", "equipment_id": 99999,
    }, headers=admin_headers)
    assert r.status_code == 404
