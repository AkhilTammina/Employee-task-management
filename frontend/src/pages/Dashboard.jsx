import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  Users,
} from 'lucide-react'

import api from '../services/api'

const initialStats = {
  employees: 0,
  tasks: 0,
  completed: 0,
  pending: 0,
}

export default function Dashboard() {
  const [stats, setStats] = useState(initialStats)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/dashboard')
      .then((response) => setStats(response.data))
      .catch(() => setError('Could not load dashboard data.'))
  }, [])

  const cards = [
    {
      label: 'Total employees',
      value: stats.employees,
      icon: Users,
      tone: 'blue',
      note: 'People in your workspace',
    },
    {
      label: 'Total tasks',
      value: stats.tasks,
      icon: ListTodo,
      tone: 'purple',
      note: 'Tasks created so far',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      tone: 'green',
      note: 'Successfully finished',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock3,
      tone: 'orange',
      note: 'Still need attention',
    },
  ]

  const completionPercent = stats.tasks
    ? Math.round((stats.completed / stats.tasks) * 100)
    : 0

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">
            Here's what's happening with your team today.
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        {cards.map(({ label, value, icon: Icon, tone, note }) => (
          <div className="stat-card" key={label}>
            <div className="stat-card-top">
              <span>{label}</span>
              <div className={`stat-icon ${tone}`}>
                <Icon size={20} />
              </div>
            </div>
            <strong className="stat-value">{value}</strong>
            <div className="stat-note">{note}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <h3>Task progress</h3>
              <p className="muted">Completion across all tasks</p>
            </div>
          </div>
          <div className="progress-number">
            {completionPercent}
            <small>%</small>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="progress-legend">
            <span>
              <i className="legend-dot green-dot" />
              Completed ({stats.completed})
            </span>
            <span>
              <i className="legend-dot gray-dot" />
              Remaining ({stats.pending})
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
