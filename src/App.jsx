import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'

import LoginPage from './components/auth/LoginPage'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import ClientsPage      from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import PipelinePage  from './pages/PipelinePage'
import MapPage       from './pages/MapPage'
import ParametresPage from './pages/ParametresPage'

// HashRouter pour Hostinger (hébergement statique sans .htaccess)
const Router = HashRouter

function Protected ({ children }) {
  const { session, ready } = useAuth()
  if (!ready) return null
  if (!session) return <Navigate to="/login" replace />
  return children
}

function Routed () {
  const { session } = useAuth()
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={
          session ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }/>
        <Route element={<Protected><Layout /></Protected>}>
          <Route index             element={<Navigate to="/dashboard" replace />}/>
          <Route path="/dashboard"  element={<Page><DashboardPage /></Page>}/>
          <Route path="/clients"      element={<Page><ClientsPage /></Page>}/>
          <Route path="/clients/:id"  element={<Page><ClientDetailPage /></Page>}/>
          <Route path="/pipeline"     element={<Page><PipelinePage /></Page>}/>
          <Route path="/carte"      element={<Page><MapPage /></Page>}/>
          <Route path="/parametres" element={<Page><ParametresPage /></Page>}/>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />}/>
      </Routes>
    </AnimatePresence>
  )
}

function Page ({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, y: -6 }}
      transition={{ duration: .25, ease: [.21,1.02,.73,1] }}>
      {children}
    </motion.div>
  )
}

export default function App () {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routed />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
