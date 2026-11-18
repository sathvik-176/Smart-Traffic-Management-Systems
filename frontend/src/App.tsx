
import './App.css'

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'

import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import Junctions from './components/Junctions/Junctions'
import Analytics from './components/Analytics/Analytics'
import Monitoring from './components/Monitoring/Monitoring'
import Predictions from './components/Predictions/Predictions'

// Login is currently implemented in JavaScript without TypeScript declarations.

import Login from './pages/Login'
// ProtectedRoute is currently implemented in JavaScript without TypeScript declarations.

import ProtectedRoute from './components/ProtectedRoute'

import { AnalysisProvider } from './AnalysisContext'

// Your existing dashboard layout
function AppLayout() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Header />

        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnalysisProvider>
        <Routes>

          {/* Login page - accessible without authentication */}
          <Route path="/login" element={<Login />} />

          {/* All routes below require login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>

              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/junctions" element={<Junctions />} />

              <Route path="/analytics" element={<Analytics />} />

              <Route path="/monitoring" element={<Monitoring />} />

              <Route path="/predictions" element={<Predictions />} />

            </Route>
          </Route>

        </Routes>
      </AnalysisProvider>
    </BrowserRouter>
  )
}

export default App
