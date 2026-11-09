import { useEffect, useState } from 'react'
import {
  BriefcaseBusiness,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react'
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'

import api from './services/api'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Login from './pages/Login'
import Tasks from './pages/Tasks'

function Shell({ children, user, onLogout }) {
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/tasks', label: 'Tasks', icon: ListTodo },
  ]

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuIsOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-icon">
            <BriefcaseBusiness size={21} />
          </span>
          <span>Team</span>
        </div>

        <div className="nav-caption">WORKSPACE</div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              end
              key={to}
              to={to}
              onClick={() => setMenuIsOpen(false)}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">{user?.name?.[0] || 'A'}</div>
            <div>
              <strong>{user?.name || 'Administrator'}</strong>
              <small>Administrator</small>
            </div>
          </div>
          <button className="logout-link" onClick={onLogout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {menuIsOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close menu"
          onClick={() => setMenuIsOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMenuIsOpen(!menuIsOpen)}
          >
            {menuIsOpen ? <X /> : <Menu />}
          </button>
          <div className="topbar-right">
            <div className="avatar small">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setChecking(false)
      return
    }

    api
      .get('/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setChecking(false))
  }, [])

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
  }

  if (checking) {
    return <div className="loading-screen">Loading TeamFlow…</div>
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Shell user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
