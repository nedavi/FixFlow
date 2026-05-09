from datetime import datetime
from pydantic import BaseModel
from app.models.repair_request import RequestStatus, RequestPriority
from app.schemas.user import UserResponse
from app.schemas.equipment import EquipmentResponse


class RepairRequestCreate(BaseModel):
    title: str
    description: str | None = None
    priority: RequestPriority = RequestPriority.medium
    equipment_id: int


class RepairRequestUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: RequestPriority | None = None
    status: RequestStatus | None = None
    assigned_to_id: int | None = None
    notes: str | None = None


class RepairRequestResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: RequestStatus
    priority: RequestPriority
    notes: str | None
    equipment_id: int
    created_by_id: int
    assigned_to_id: int | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None
    equipment: EquipmentResponse
    created_by: UserResponse
    assigned_to: UserResponse | None

    model_config = {"from_attributes": True}


class RepairRequestListResponse(BaseModel):
    id: int
    title: str
    status: RequestStatus
    priority: RequestPriority
    equipment_id: int
    created_by_id: int
    assigned_to_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
