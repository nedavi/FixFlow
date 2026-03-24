from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models.repair_request import RepairRequest, RequestStatus
from app.models.user import User, UserRole
from app.schemas.repair_request import RepairRequestCreate, RepairRequestUpdate


def get_request(db: Session, request_id: int) -> RepairRequest | None:
    return (
        db.query(RepairRequest)
        .options(
            joinedload(RepairRequest.equipment),
            joinedload(RepairRequest.created_by),
            joinedload(RepairRequest.assigned_to),
        )
        .filter(RepairRequest.id == request_id)
        .first()
    )


def get_requests(db: Session, current_user: User, skip: int = 0, limit: int = 100) -> list[RepairRequest]:
    q = db.query(RepairRequest).options(
        joinedload(RepairRequest.equipment),
        joinedload(RepairRequest.created_by),
        joinedload(RepairRequest.assigned_to),
    )
    if current_user.role == UserRole.client:
        q = q.filter(RepairRequest.created_by_id == current_user.id)
    # admin, manager, technician — see all requests
    return q.order_by(RepairRequest.created_at.desc()).offset(skip).limit(limit).all()


def create_request(db: Session, data: RepairRequestCreate, created_by_id: int) -> RepairRequest:
    repair_request = RepairRequest(
        **data.model_dump(),
        created_by_id=created_by_id,
    )
    db.add(repair_request)
    db.commit()
    db.refresh(repair_request)
    return get_request(db, repair_request.id)


def update_request(db: Session, request: RepairRequest, data: RepairRequestUpdate, current_user: User) -> RepairRequest:
    update_data = data.model_dump(exclude_none=True)

    if "status" in update_data and update_data["status"] == RequestStatus.completed:
        request.completed_at = datetime.utcnow()

    for field, value in update_data.items():
        setattr(request, field, value)

    db.commit()
    db.refresh(request)
    return get_request(db, request.id)


def delete_request(db: Session, request: RepairRequest) -> None:
    db.delete(request)
    db.commit()
