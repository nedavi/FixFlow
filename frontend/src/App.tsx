import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { useAuthStore } from './store/auth'
import { getMe } from './services/auth'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RequestsPage from './pages/RequestsPage'
import RequestDetailPage from './pages/RequestDetailPage'
import EquipmentPage from './pages/EquipmentPage'
import UsersPage from './pages/UsersPage'

const theme = createTheme({
  palette: { primary: { main: '#1565c0' }, secondary: { main: '#e91e63' } },
  shape: { borderRadius: 8 },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
})

export default function App() {
  const { token, setAuth, logout } = useAuthStore()

  useEffect(() => {
    if (token) {
      getMe().then((user) => setAuth(user, token)).catch(() => logout())
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="requests/:id" element={<RequestDetailPage />} />
            <Route path="equipment" element={<EquipmentPage />} />
            <Route path="users" element={<PrivateRoute roles={['admin']}><UsersPage /></PrivateRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
