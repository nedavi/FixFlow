from sqlalchemy.orm import Session

from app.models.equipment import Equipment, EquipmentStatus
from app.models.repair_request import RepairRequest, RequestPriority, RequestStatus
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserMeUpdate, UserUpdate
from app.services.auth import hash_password


def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def update_me(db: Session, user: User, data: UserMeUpdate) -> User:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()


def seed_admin(db: Session) -> None:
    if not get_user_by_username(db, "admin"):
        create_user(db, UserCreate(
            email="admin@fixflow.com",
            username="admin",
            password="admin123",
            full_name="System Administrator",
            role=UserRole.admin,
        ))


def seed_demo_data(db: Session) -> None:
    seed_admin(db)

    if get_user_by_username(db, "manager1"):
        return

    manager = create_user(db, UserCreate(
        email="manager@fixflow.com", username="manager1",
        password="manager123", full_name="Иван Петров", role=UserRole.manager,
    ))
    tech1 = create_user(db, UserCreate(
        email="tech1@fixflow.com", username="tech1",
        password="tech123", full_name="Алексей Смирнов", role=UserRole.technician,
    ))
    tech2 = create_user(db, UserCreate(
        email="tech2@fixflow.com", username="tech2",
        password="tech123", full_name="Дмитрий Козлов", role=UserRole.technician,
    ))
    create_user(db, UserCreate(
        email="client1@fixflow.com", username="client1",
        password="client123", full_name="ООО Ромашка", role=UserRole.client,
    ))
    create_user(db, UserCreate(
        email="client2@fixflow.com", username="client2",
        password="client123", full_name="ИП Сидоров", role=UserRole.client,
    ))

    equipment_data = [
        Equipment(name="Принтер HP LaserJet", serial_number="HP-001", equipment_type="Принтер",
                  location="Офис 101", status=EquipmentStatus.broken),
        Equipment(name="Сервер Dell PowerEdge", serial_number="SRV-001", equipment_type="Сервер",
                  location="Серверная", status=EquipmentStatus.working),
        Equipment(name="Ноутбук Lenovo ThinkPad", serial_number="NB-001", equipment_type="Ноутбук",
                  location="Офис 205", status=EquipmentStatus.maintenance),
        Equipment(name="Кондиционер Daikin", serial_number="AC-001", equipment_type="Климатическое",
                  location="Зал переговоров", status=EquipmentStatus.broken),
        Equipment(name="Копир Xerox WorkCentre", serial_number="XRX-001", equipment_type="Копир",
                  location="Офис 103", status=EquipmentStatus.working),
    ]
    for eq in equipment_data:
        db.add(eq)
    db.commit()
    for eq in equipment_data:
        db.refresh(eq)

    admin = get_user_by_username(db, "admin")
    requests_data = [
        RepairRequest(title="Принтер не печатает", description="Принтер HP в офисе 101 выдаёт ошибку замятия бумаги",
                      status=RequestStatus.new, priority=RequestPriority.high,
                      equipment_id=equipment_data[0].id, created_by_id=admin.id),
        RepairRequest(title="Шум в серверной стойке", description="Повышенный шум от вентиляторов сервера Dell",
                      status=RequestStatus.in_progress, priority=RequestPriority.medium,
                      equipment_id=equipment_data[1].id, created_by_id=manager.id, assigned_to_id=tech1.id),
        RepairRequest(title="Ноутбук не включается", description="После обновления Windows ноутбук перестал загружаться",
                      status=RequestStatus.in_progress, priority=RequestPriority.critical,
                      equipment_id=equipment_data[2].id, created_by_id=manager.id, assigned_to_id=tech2.id),
        RepairRequest(title="Кондиционер не охлаждает", description="Кондиционер работает, но не снижает температуру",
                      status=RequestStatus.new, priority=RequestPriority.medium,
                      equipment_id=equipment_data[3].id, created_by_id=admin.id),
        RepairRequest(title="Замена картриджа копира", description="Закончился тонер в копире Xerox",
                      status=RequestStatus.completed, priority=RequestPriority.low,
                      equipment_id=equipment_data[4].id, created_by_id=manager.id, assigned_to_id=tech1.id,
                      notes="Картридж заменён, копир работает штатно"),
    ]
    for req in requests_data:
        db.add(req)
    db.commit()
