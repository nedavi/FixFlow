import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import BuildIcon from '@mui/icons-material/Build'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import FiberNewIcon from '@mui/icons-material/FiberNew'
import { getRequests } from '../services/requests'
import { getEquipment } from '../services/equipment'
import { RepairRequest, Equipment } from '../types'
import { useAuthStore } from '../store/auth'

interface StatCardProps { title: string; value: number; icon: React.ReactNode; color: string }
function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: color, color: '#fff', display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRequests(), getEquipment()])
      .then(([reqs, eq]) => { setRequests(reqs); setEquipment(eq) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>

  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === 'new').length,
    inProgress: requests.filter((r) => r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  }

  const recent = [...requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Добро пожаловать, {user?.full_name}!
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Всего заявок" value={stats.total} icon={<BuildIcon />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Новые" value={stats.new} icon={<FiberNewIcon />} color="#0288d1" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="В работе" value={stats.inProgress} icon={<HourglassEmptyIcon />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Завершено" value={stats.completed} icon={<CheckCircleIcon />} color="#2e7d32" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Последние заявки</Typography>
              {recent.length === 0 ? (
                <Typography color="text.secondary">Заявок нет</Typography>
              ) : (
                recent.map((r) => (
                  <Box key={r.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{r.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.equipment?.name}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(r.created_at).toLocaleDateString('ru-RU')}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Оборудование</Typography>
              <Typography variant="h3" fontWeight={700} color="primary">{equipment.length}</Typography>
              <Typography color="text.secondary">единиц в системе</Typography>
              <Box mt={2}>
                {['working', 'broken', 'maintenance'].map((s) => (
                  <Box key={s} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2">{s === 'working' ? 'Работает' : s === 'broken' ? 'Неисправно' : 'Обслуживание'}</Typography>
                    <Typography variant="body2" fontWeight={600}>{equipment.filter((e) => e.status === s).length}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
