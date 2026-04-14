import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getRequestById, updateRequest } from '../services/requests'
import { getUsers } from '../services/users'
import { RepairRequest, User } from '../types'
import { StatusChip, PriorityChip } from '../components/StatusChip'
import { useAuthStore } from '../store/auth'

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [req, setReq] = useState<RepairRequest | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ status: '', assigned_to_id: '', notes: '' })

  const canManage = user?.role === 'admin' || user?.role === 'manager'
  const isTech = user?.role === 'technician'

  useEffect(() => {
    const usersPromise = canManage ? getUsers() : Promise.resolve([] as User[])
    Promise.all([getRequestById(Number(id)), usersPromise])
      .then(([r, u]) => {
        setReq(r)
        setUsers(u)
        setForm({ status: r.status, assigned_to_id: String(r.assigned_to_id ?? ''), notes: r.notes ?? '' })
      })
      .finally(() => setLoading(false))
  }, [id, canManage])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateRequest(Number(id), {
        status: form.status as any,
        assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
        notes: form.notes,
      })
      setReq(updated)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
  if (!req) return <Typography>Заявка не найдена</Typography>

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/requests')} sx={{ mb: 2 }}>Назад</Button>

      <Typography variant="h5" fontWeight={700} mb={3}>Заявка #{req.id}</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={1}>{req.title}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <StatusChip status={req.status} />
              <PriorityChip priority={req.priority} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" mb={1}>Описание</Typography>
            <Typography variant="body1" mb={2}>{req.description ?? '—'}</Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>Оборудование</Typography>
            <Typography variant="body1" mb={2}>{req.equipment?.name} ({req.equipment?.serial_number})</Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>Местоположение</Typography>
            <Typography variant="body1">{req.equipment?.location}</Typography>
            {req.notes && <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" mb={1}>Примечания</Typography>
              <Typography variant="body1">{req.notes}</Typography>
            </>}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Информация</Typography>
              <Typography variant="body2" color="text.secondary">Создал</Typography>
              <Typography variant="body2" mb={1}>{req.created_by?.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">Исполнитель</Typography>
              <Typography variant="body2" mb={1}>{req.assigned_to?.full_name ?? '—'}</Typography>
              <Typography variant="body2" color="text.secondary">Создана</Typography>
              <Typography variant="body2" mb={1}>{new Date(req.created_at).toLocaleString('ru-RU')}</Typography>
              {req.completed_at && <>
                <Typography variant="body2" color="text.secondary">Завершена</Typography>
                <Typography variant="body2">{new Date(req.completed_at).toLocaleString('ru-RU')}</Typography>
              </>}
            </CardContent>
          </Card>

          {(canManage || isTech) && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Управление</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Статус</InputLabel>
                    <Select value={form.status} label="Статус" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <MenuItem value="new">Новая</MenuItem>
                      <MenuItem value="in_progress">В работе</MenuItem>
                      <MenuItem value="completed">Завершена</MenuItem>
                      <MenuItem value="cancelled">Отменена</MenuItem>
                    </Select>
                  </FormControl>
                  {canManage && (
                    <FormControl fullWidth size="small">
                      <InputLabel>Исполнитель</InputLabel>
                      <Select value={form.assigned_to_id} label="Исполнитель" onChange={(e) => setForm({ ...form, assigned_to_id: e.target.value as string })}>
                        <MenuItem value="">—</MenuItem>
                        {users.filter((u) => u.role === 'technician').map((u) => (
                          <MenuItem key={u.id} value={u.id}>{u.full_name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <TextField label="Примечания" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} multiline rows={3} size="small" fullWidth />
                  <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  )
}
