import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text

from app.database import Base


class EquipmentStatus(str, enum.Enum):
    working = "working"
    broken = "broken"
    maintenance = "maintenance"
    decommissioned = "decommissioned"


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    serial_number = Column(String, unique=True, nullable=False, index=True)
    equipment_type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.working, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
