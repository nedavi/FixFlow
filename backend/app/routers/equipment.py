from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin_or_manager
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
def create_new_equipment(data: EquipmentCreate, db: Session = Depends(get_db), _=Depends(require_admin_or_manager)):
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
def update_equipment_by_id(equipment_id: int, data: EquipmentUpdate, db: Session = Depends(get_db), _=Depends(require_admin_or_manager)):
    equipment = get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return update_equipment(db, equipment, data)


@router.delete("/{equipment_id}", status_code=204)
def delete_equipment_by_id(equipment_id: int, db: Session = Depends(get_db), _=Depends(require_admin_or_manager)):
    equipment = get_equipment(db, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    delete_equipment(db, equipment)
