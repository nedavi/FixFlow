import pytest


@pytest.fixture
def equipment_payload():
    return {
        "name": "Server Dell R740",
        "serial_number": "SN-TEST-001",
        "equipment_type": "Server",
        "location": "Room 101",
        "status": "working",
        "description": "Main production server",
    }


def test_create_equipment(client, admin_headers, equipment_payload):
    r = client.post("/api/equipment/", json=equipment_payload, headers=admin_headers)
    assert r.status_code == 201
    assert r.json()["serial_number"] == "SN-TEST-001"


def test_create_equipment_duplicate_serial(client, admin_headers, equipment_payload):
    client.post("/api/equipment/", json=equipment_payload, headers=admin_headers)
    r = client.post("/api/equipment/", json=equipment_payload, headers=admin_headers)
    assert r.status_code == 400


def test_list_equipment(client, admin_headers):
    r = client.get("/api/equipment/", headers=admin_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_get_equipment_not_found(client, admin_headers):
    r = client.get("/api/equipment/99999", headers=admin_headers)
    assert r.status_code == 404


def test_update_equipment(client, admin_headers, equipment_payload):
    equipment_payload["serial_number"] = "SN-TEST-002"
    create_r = client.post("/api/equipment/", json=equipment_payload, headers=admin_headers)
    eq_id = create_r.json()["id"]
    r = client.patch(f"/api/equipment/{eq_id}", json={"status": "broken"}, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "broken"


def test_delete_equipment(client, admin_headers, equipment_payload):
    equipment_payload["serial_number"] = "SN-TEST-003"
    create_r = client.post("/api/equipment/", json=equipment_payload, headers=admin_headers)
    eq_id = create_r.json()["id"]
    r = client.delete(f"/api/equipment/{eq_id}", headers=admin_headers)
    assert r.status_code == 204
