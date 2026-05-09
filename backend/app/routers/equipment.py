from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin_or_manager
from app.models.repair_request import RepairRequest
from app.schemas.equipment import EquipmentCreate, EquipmentResponse, EquipmentUpdate
from app.services.equipment import (
    create_equipment,
    delete_equipment,
    get_all_equipment,
    get_equipment,
    get_equipment_by_serial,
    update_equipment,
)

router = APIRouter(prefix="/api/equipment", tags=["equipment"])


@router.get("/", response_model=list[EquipmentResponse])
def list_equipment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_all_equipment(db, skip, limit)


@router.post("/", response_model=EquipmentResponse, status_code=201)
def create_new_equipment(
    data: EquipmentCreate = Body(openapi_examples={
        "printer": {
            "summary": "Принтер",
            "value": {
                "name": "Принтер HP LaserJet Pro",
                "serial_number": "HP-2024-001",
                "equipment_type": "Принтер",
                "location": "Офис 101",
                "status": "working",
                "description": "Лазерный принтер A4",
            },
        },
        "server": {
            "summary": "Сервер",
            "value": {
                "name": "Сервер Dell PowerEdge R740",
                "serial_number": "SRV-2024-001",
                "equipment_type": "Сервер",
                "location": "Серверная комната",
                "status": "working",
                "description": "Rack-сервер 2U",
            },
        },
        "ac": {
            "summary": "Кондиционер",
            "value": {
                "name": "Кондиционер Daikin FTXB35C",
                "serial_number": "AC-2024-001",
                "equipment_type": "Климатическое",
                "location": "Зал переговоров",
                "status": "broken",
            },
        },
    }),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_manager),
):
    if get_equipment_by_serial(db, data.serial_number):
        raise HTTPException(status_code=400, detail="Serial number already exists")
    return create_equipment(db, data)


@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment_by_id(equipment_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    equipment = get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment


@router.patch("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment_by_id(
    equipment_id: int,
    data: EquipmentUpdate = Body(openapi_examples={
        "mark_broken": {
            "summary": "Отметить как сломанное",
            "value": {"status": "broken"},
        },
        "move": {
            "summary": "Переместить в другой офис",
            "value": {"location": "Офис 305"},
        },
    }),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_manager),
):
    equipment = get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return update_equipment(db, equipment, data)


@router.delete("/{equipment_id}", status_code=204)
def delete_equipment_by_id(equipment_id: int, db: Session = Depends(get_db), _=Depends(require_admin_or_manager)):
    equipment = get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    if db.query(RepairRequest).filter(RepairRequest.equipment_id == equipment_id).first():
        raise HTTPException(status_code=400, detail="Cannot delete equipment with existing repair requests")
    delete_equipment(db, equipment)
