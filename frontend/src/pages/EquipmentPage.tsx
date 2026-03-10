import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
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
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '../services/equipment'
import { Equipment, EquipmentStatus } from '../types'
import { useAuthStore } from '../store/auth'

const statusLabels: Record<EquipmentStatus, string> = {
  working: 'Работает', broken: 'Неисправно', maintenance: 'Обслуживание', decommissioned: 'Списано',
}
const statusColors: Record<EquipmentStatus, 'success' | 'error' | 'warning' | 'default'> = {
  working: 'success', broken: 'error', maintenance: 'warning', decommissioned: 'default',
}

const emptyForm = { name: '', serial_number: '', equipment_type: '', location: '', status: 'working' as EquipmentStatus, description: '' }

export default function EquipmentPage() {
  const { user } = useAuthStore()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const load = () => getEquipment().then(setEquipment).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (eq: Equipment) => {
    setEditing(eq)
    setForm({ name: eq.name, serial_number: eq.serial_number, equipment_type: eq.equipment_type, location: eq.location, status: eq.status, description: eq.description ?? '' })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await updateEquipment(editing.id, form)
      else await createEquipment(form)
      setOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить оборудование?')) return
    await deleteEquipment(id)
    load()
  }

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Оборудование</Typography>
        {canEdit && <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Добавить</Button>}
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Серийный номер</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Местоположение</TableCell>
                <TableCell>Статус</TableCell>
                {canEdit && <TableCell align="right">Действия</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {equipment.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">Оборудование не найдено</TableCell></TableRow>
              ) : equipment.map((eq) => (
                <TableRow key={eq.id} hover>
                  <TableCell>{eq.name}</TableCell>
                  <TableCell>{eq.serial_number}</TableCell>
                  <TableCell>{eq.equipment_type}</TableCell>
                  <TableCell>{eq.location}</TableCell>
                  <TableCell><Chip label={statusLabels[eq.status]} color={statusColors[eq.status]} size="small" /></TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(eq)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(eq.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Редактировать оборудование' : 'Новое оборудование'}</DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required fullWidth />
            <TextField label="Серийный номер" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} required fullWidth disabled={!!editing} />
            <TextField label="Тип" value={form.equipment_type} onChange={(e) => setForm({ ...form, equipment_type: e.target.value })} required fullWidth />
            <TextField label="Местоположение" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required fullWidth />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select value={form.status} label="Статус" onChange={(e) => setForm({ ...form, status: e.target.value as EquipmentStatus })}>
                <MenuItem value="working">Работает</MenuItem>
                <MenuItem value="broken">Неисправно</MenuItem>
                <MenuItem value="maintenance">Обслуживание</MenuItem>
                <MenuItem value="decommissioned">Списано</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
