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
import Switch from '@mui/material/Switch'
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
import { getUsers, createUser, updateUser, deleteUser } from '../services/users'
import { User, UserRole } from '../types'
import { useAuthStore } from '../store/auth'

const roleLabels: Record<UserRole, string> = {
  admin: 'Администратор', manager: 'Менеджер', technician: 'Техник', client: 'Клиент',
}

const emptyForm = { email: '', username: '', password: '', full_name: '', role: 'client' as UserRole }

export default function UsersPage() {
  const { user: me } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => getUsers().then(setUsers).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (u: User) => {
    setEditing(u)
    setForm({ ...emptyForm, email: u.email, username: u.username, full_name: u.full_name, role: u.role })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await updateUser(editing.id, { full_name: form.full_name, role: form.role })
      else await createUser(form)
      setOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (u: User) => {
    await updateUser(u.id, { is_active: !u.is_active })
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить пользователя?')) return
    await deleteUser(id)
    load()
  }

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Пользователи</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Добавить</Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Логин</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Активен</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Chip label={roleLabels[u.role]} size="small" /></TableCell>
                  <TableCell>
                    <Switch checked={u.is_active} onChange={() => handleToggleActive(u)} size="small" disabled={u.id === me?.id} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton>
                    {u.id !== me?.id && <IconButton size="small" color="error" onClick={() => handleDelete(u.id)}><DeleteIcon fontSize="small" /></IconButton>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Редактировать пользователя' : 'Новый пользователь'}</DialogTitle>
        <Box component="form" onSubmit={handleSave}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Имя" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required fullWidth />
            {!editing && <>
              <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required fullWidth />
              <TextField label="Логин" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required fullWidth />
              <TextField label="Пароль" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required fullWidth />
            </>}
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select value={form.role} label="Роль" onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                <MenuItem value="admin">Администратор</MenuItem>
                <MenuItem value="manager">Менеджер</MenuItem>
                <MenuItem value="technician">Техник</MenuItem>
                <MenuItem value="client">Клиент</MenuItem>
              </Select>
            </FormControl>
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
