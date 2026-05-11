"""init

Revision ID: 67c1241e63e2
Revises:
Create Date: 2026-05-11 16:49:32.636728

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '67c1241e63e2'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    if bind.dialect.name == 'postgresql':
        from sqlalchemy.dialects.postgresql import ENUM as PgENUM
        PgENUM('working', 'broken', 'maintenance', 'decommissioned', name='equipmentstatus').create(bind, checkfirst=True)
        PgENUM('admin', 'manager', 'technician', 'client', name='userrole').create(bind, checkfirst=True)
        PgENUM('new', 'in_progress', 'completed', 'cancelled', name='requeststatus').create(bind, checkfirst=True)
        PgENUM('low', 'medium', 'high', 'critical', name='requestpriority').create(bind, checkfirst=True)

    existing = sa.inspect(bind).get_table_names()

    if 'equipment' not in existing:
        op.create_table('equipment',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('serial_number', sa.String(), nullable=False),
            sa.Column('equipment_type', sa.String(), nullable=False),
            sa.Column('location', sa.String(), nullable=False),
            sa.Column('status', sa.Enum('working', 'broken', 'maintenance', 'decommissioned', name='equipmentstatus', create_type=False), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_equipment_id'), 'equipment', ['id'], unique=False)
        op.create_index(op.f('ix_equipment_serial_number'), 'equipment', ['serial_number'], unique=True)

    if 'users' not in existing:
        op.create_table('users',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('email', sa.String(), nullable=False),
            sa.Column('username', sa.String(), nullable=False),
            sa.Column('hashed_password', sa.String(), nullable=False),
            sa.Column('full_name', sa.String(), nullable=False),
            sa.Column('role', sa.Enum('admin', 'manager', 'technician', 'client', name='userrole', create_type=False), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
        op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    if 'repair_requests' not in existing:
        op.create_table('repair_requests',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('status', sa.Enum('new', 'in_progress', 'completed', 'cancelled', name='requeststatus', create_type=False), nullable=False),
            sa.Column('priority', sa.Enum('low', 'medium', 'high', 'critical', name='requestpriority', create_type=False), nullable=False),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('equipment_id', sa.Integer(), nullable=False),
            sa.Column('created_by_id', sa.Integer(), nullable=False),
            sa.Column('assigned_to_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('completed_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['assigned_to_id'], ['users.id'], ),
            sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
            sa.ForeignKeyConstraint(['equipment_id'], ['equipment.id'], ),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_repair_requests_id'), 'repair_requests', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_repair_requests_id'), table_name='repair_requests')
    op.drop_table('repair_requests')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_equipment_serial_number'), table_name='equipment')
    op.drop_index(op.f('ix_equipment_id'), table_name='equipment')
    op.drop_table('equipment')

    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        from sqlalchemy.dialects.postgresql import ENUM as PgENUM
        PgENUM(name='requestpriority').drop(bind, checkfirst=True)
        PgENUM(name='requeststatus').drop(bind, checkfirst=True)
        PgENUM(name='userrole').drop(bind, checkfirst=True)
        PgENUM(name='equipmentstatus').drop(bind, checkfirst=True)
