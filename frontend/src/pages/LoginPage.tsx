import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { login, register, getMe } from '../services/auth'
import { useAuthStore } from '../store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [tab, setTab] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [regForm, setRegForm] = useState({ email: '', username: '', password: '', full_name: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = await login(loginForm.username, loginForm.password)
      localStorage.setItem('token', token.access_token)
      const user = await getMe()
      setAuth(user, token.access_token)
      navigate('/')
    } catch {
      setError('Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(regForm)
      const token = await login(regForm.username, regForm.password)
      localStorage.setItem('token', token.access_token)
      const user = await getMe()
      setAuth(user, token.access_token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
      <Card sx={{ width: 400, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={1}>FixFlow</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Система обработки заявок на ремонт оборудования
          </Typography>

          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError('') }} variant="fullWidth" sx={{ mb: 3 }}>
            <Tab label="Войти" />
            <Tab label="Регистрация" />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {tab === 0 ? (
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Логин" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} required fullWidth />
              <TextField label="Пароль" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required fullWidth />
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? 'Вход...' : 'Войти'}
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Демо: admin / admin123
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Имя" value={regForm.full_name} onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })} required fullWidth />
              <TextField label="Email" type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required fullWidth />
              <TextField label="Логин" value={regForm.username} onChange={(e) => setRegForm({ ...regForm, username: e.target.value })} required fullWidth />
              <TextField label="Пароль" type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required fullWidth />
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
