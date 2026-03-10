import Chip from '@mui/material/Chip'
import { RequestStatus, RequestPriority } from '../types'

const statusColors: Record<RequestStatus, 'default' | 'info' | 'success' | 'error'> = {
  new: 'info',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'error',
}

const statusLabels: Record<RequestStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  completed: 'Завершена',
  cancelled: 'Отменена',
}

const priorityColors: Record<RequestPriority, 'default' | 'info' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'error',
}

const priorityLabels: Record<RequestPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
}

export function StatusChip({ status }: { status: RequestStatus }) {
  return <Chip label={statusLabels[status]} color={statusColors[status]} size="small" />
}

export function PriorityChip({ priority }: { priority: RequestPriority }) {
  return <Chip label={priorityLabels[priority]} color={priorityColors[priority]} size="small" />
}
