import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard, { type EduPointsView } from './pages/Dashboard.tsx'
import Login from './pages/Login.tsx'

function ProtectedRoute({ view }: { view: EduPointsView }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Dashboard view={view} />
}

function App() {
  const token = localStorage.getItem('token')

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? '/inicio' : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute view="director" />} />
      <Route path="/inicio" element={<ProtectedRoute view="home" />} />
      <Route path="/chamada" element={<ProtectedRoute view="nfc" />} />
      <Route path="/presencas" element={<ProtectedRoute view="attendance" />} />
      <Route path="*" element={<Navigate to={token ? '/inicio' : '/login'} replace />} />
    </Routes>
  )
}

export default App
