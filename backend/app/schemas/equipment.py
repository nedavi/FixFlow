from datetime import datetime
from pydantic import BaseModel
from app.models.equipment import EquipmentStatus


class EquipmentCreate(BaseModel):
    name: str
    serial_number: str
    equipment_type: str
    location: str
    status: EquipmentStatus = EquipmentStatus.working
    description: str | None = None


class EquipmentUpdate(BaseModel):
    name: str | None = None
    equipment_type: str | None = None
    location: str | None = None
    status: EquipmentStatus | None = None
    description: str | None = None


class EquipmentResponse(BaseModel):
    id: int
    name: str
    serial_number: str
    equipment_type: str
    location: str
    status: EquipmentStatus
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
