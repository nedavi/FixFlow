from datetime import datetime

from pydantic import BaseModel, Field

from app.models.equipment import EquipmentStatus


class EquipmentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    serial_number: str = Field(min_length=2, max_length=50)
    equipment_type: str = Field(min_length=2, max_length=50)
    location: str = Field(min_length=2, max_length=100)
    status: EquipmentStatus = EquipmentStatus.working
    description: str | None = Field(default=None, max_length=500)

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Принтер HP LaserJet Pro",
                "serial_number": "HP-2024-001",
                "equipment_type": "Принтер",
                "location": "Офис 101",
                "status": "working",
                "description": "Лазерный принтер формата A4",
            }
        }
    }


class EquipmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    equipment_type: str | None = Field(default=None, min_length=2, max_length=50)
    location: str | None = Field(default=None, min_length=2, max_length=100)
    status: EquipmentStatus | None = None
    description: str | None = Field(default=None, max_length=500)


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
