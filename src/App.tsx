import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserLandingPage } from './pages/UserLandingPage'
import { DashboardLayout } from './layout/DashboardLayout'
import { ReportsProvider } from './context/ReportsContext'
import './styles/landing.css'
import './styles/dashboard.css'

const App = () => (
  <BrowserRouter>
    <ReportsProvider>
      <Routes>
        <Route path="/" element={<UserLandingPage />} />
        <Route path="/admin" element={<DashboardLayout />} />
      </Routes>
    </ReportsProvider>
  </BrowserRouter>
)

export default App
