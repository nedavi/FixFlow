from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserMeUpdate
from app.services.users import get_user, get_users, create_user, update_user, delete_user, update_me, get_user_by_email, get_user_by_username

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=list[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _=Depends(require_admin)):
    return get_users(db, skip, limit)


@router.post("/", response_model=UserResponse, status_code=201)
def create_new_user(data: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if get_user_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    return create_user(db, data)


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_my_profile(data: UserMeUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return update_me(db, current_user, data)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user_by_id(user_id: int, data: UserUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return update_user(db, user, data)


@router.delete("/{user_id}", status_code=204)
def delete_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    delete_user(db, user)
