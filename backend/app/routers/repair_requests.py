from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin_or_manager
from app.models.user import User, UserRole
from app.schemas.repair_request import RepairRequestCreate, RepairRequestResponse, RepairRequestUpdate
from app.services.equipment import get_equipment
from app.services.repair_requests import create_request, delete_request, get_request, get_requests, update_request

router = APIRouter(prefix="/api/requests", tags=["repair_requests"])


@router.get("/", response_model=list[RepairRequestResponse])
def list_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_requests(db, current_user, skip, limit)


@router.post("/", response_model=RepairRequestResponse, status_code=201)
def create_new_request(data: RepairRequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not get_equipment(db, data.equipment_id):
        raise HTTPException(status_code=404, detail="Equipment not found")
    return create_request(db, data, current_user.id)


@router.get("/{request_id}", response_model=RepairRequestResponse)
def get_request_by_id(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = get_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if current_user.role == UserRole.client and req.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return req


@router.patch("/{request_id}", response_model=RepairRequestResponse)
def update_request_by_id(
    request_id: int,
    data: RepairRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = get_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if current_user.role == UserRole.client:
        if req.created_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        allowed_fields = {"description", "title"}
        if any(k not in allowed_fields for k in data.model_dump(exclude_none=True)):
            raise HTTPException(status_code=403, detail="Clients can only edit title/description")

    if current_user.role == UserRole.technician:
        if req.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not assigned to you")
        allowed_fields = {"status", "notes"}
        if any(k not in allowed_fields for k in data.model_dump(exclude_none=True)):
            raise HTTPException(status_code=403, detail="Technicians can only update status/notes")

    return update_request(db, req, data, current_user)


@router.delete("/{request_id}", status_code=204)
def delete_request_by_id(request_id: int, db: Session = Depends(get_db), _=Depends(require_admin_or_manager)):
    req = get_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    delete_request(db, req)
