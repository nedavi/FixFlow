export type UserRole = 'admin' | 'manager' | 'technician' | 'client'

export interface User {
  id: number
  email: string
  username: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export type EquipmentStatus = 'working' | 'broken' | 'maintenance' | 'decommissioned'

export interface Equipment {
  id: number
  name: string
  serial_number: string
  equipment_type: string
  location: string
  status: EquipmentStatus
  description: string | null
  created_at: string
  updated_at: string
}

export type RequestStatus = 'new' | 'in_progress' | 'completed' | 'cancelled'
export type RequestPriority = 'low' | 'medium' | 'high' | 'critical'

export interface RepairRequest {
  id: number
  title: string
  description: string | null
  status: RequestStatus
  priority: RequestPriority
  notes: string | null
  equipment_id: number
  created_by_id: number
  assigned_to_id: number | null
  created_at: string
  updated_at: string
  completed_at: string | null
  equipment: Equipment
  created_by: User
  assigned_to: User | null
}

export interface Token {
  access_token: string
  token_type: string
}
