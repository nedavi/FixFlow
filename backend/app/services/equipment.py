from sqlalchemy.orm import Session
from app.models.equipment import Equipment
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate


def get_equipment(db: Session, equipment_id: int) -> Equipment | None:
    return db.query(Equipment).filter(Equipment.id == equipment_id).first()


def get_equipment_by_serial(db: Session, serial_number: str) -> Equipment | None:
    return db.query(Equipment).filter(Equipment.serial_number == serial_number).first()


def get_all_equipment(db: Session, skip: int = 0, limit: int = 100) -> list[Equipment]:
    return db.query(Equipment).offset(skip).limit(limit).all()


def create_equipment(db: Session, data: EquipmentCreate) -> Equipment:
    equipment = Equipment(**data.model_dump())
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment


def update_equipment(db: Session, equipment: Equipment, data: EquipmentUpdate) -> Equipment:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(equipment, field, value)
    db.commit()
    db.refresh(equipment)
    return equipment


def delete_equipment(db: Session, equipment: Equipment) -> None:
    db.delete(equipment)
    db.commit()
