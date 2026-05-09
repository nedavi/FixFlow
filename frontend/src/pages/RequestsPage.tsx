import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import { getRequests, createRequest, deleteRequest } from '../services/requests'
import { getEquipment } from '../services/equipment'
import { RepairRequest, Equipment } from '../types'
import { StatusChip, PriorityChip } from '../components/StatusChip'
import { useAuthStore } from '../store/auth'

export default function RequestsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', equipment_id: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([getRequests(), getEquipment()])
      .then(([r, e]) => { setRequests(r); setEquipment(e) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createRequest({ ...form, equipment_id: Number(form.equipment_id) })
      setOpen(false)
      setForm({ title: '', description: '', priority: 'medium', equipment_id: '' })
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить заявку?')) return
    await deleteRequest(id)
    load()
  }

  const canDelete = user?.role === 'admin' || user?.role === 'manager'

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Заявки на ремонт</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Создать заявку</Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Заголовок</TableCell>
                <TableCell>Оборудование</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Приоритет</TableCell>
                <TableCell>Создана</TableCell>
                <TableCell>Исполнитель</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center">Заявок нет</TableCell></TableRow>
              ) : requests.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.equipment?.name}</TableCell>
                  <TableCell><StatusChip status={r.status} /></TableCell>
                  <TableCell><PriorityChip priority={r.priority} /></TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>{r.assigned_to?.full_name ?? '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/requests/${r.id}`)}><VisibilityIcon fontSize="small" /></IconButton>
                    {canDelete && <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}><DeleteIcon fontSize="small" /></IconButton>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новая заявка</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required fullWidth />
            <TextField label="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} fullWidth />
            <FormControl fullWidth required>
              <InputLabel>Оборудование</InputLabel>
              <Select value={form.equipment_id} label="Оборудование" onChange={(e) => setForm({ ...form, equipment_id: e.target.value as string })}>
                {equipment.map((eq) => <MenuItem key={eq.id} value={eq.id}>{eq.name} ({eq.serial_number})</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Приоритет</InputLabel>
              <Select value={form.priority} label="Приоритет" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <MenuItem value="low">Низкий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
                <MenuItem value="critical">Критический</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Сохранение...' : 'Создать'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
