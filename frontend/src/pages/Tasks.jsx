import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ListTodo,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'

import api from '../services/api'

const initialForm = {
  title: '',
  description: '',
  employee_id: '',
  deadline: '',
  priority: 'Medium',
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(initialForm)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadTasks() {
    try {
      const [taskResponse, employeeResponse] = await Promise.all([
        api.get('/tasks'),
        api.get('/employees'),
      ])

      setTasks(taskResponse.data)
      setEmployees(employeeResponse.data)
      setError('')
    } catch {
      setError('Could not load tasks. Add an employee first if your team is empty.')
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function addTask(event) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      await api.post('/tasks', {
        ...form,
        employee_id: Number(form.employee_id),
        deadline: form.deadline || null,
      })
      setForm(initialForm)
      setShowForm(false)
      await loadTasks()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not create task.')
    } finally {
      setBusy(false)
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/tasks/${id}`, { status })
      await loadTasks()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not update task.')
    }
  }

  async function removeTask(id) {
    if (!window.confirm('Delete this task?')) return

    try {
      await api.delete(`/tasks/${id}`)
      await loadTasks()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not delete task.')
    }
  }

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const searchableText =
          `${task.title} ${task.description} ${task.employee_name}`.toLowerCase()
        const matchesText = searchableText.includes(search.toLowerCase())
        const matchesStatus = filter === 'All' || task.status === filter

        return matchesText && matchesStatus
      }),
    [tasks, search, filter],
  )

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Tasks</h1>
          <p className="muted">
            Assign work, set deadlines and track progress.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
          disabled={!employees.length}
        >
          <Plus size={18} />
          Create task
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!employees.length && (
        <div className="info-message">
          Add at least one employee to creating a task.
        </div>
      )}

      {showForm && (
        <form className="panel employee-form" onSubmit={addTask}>
          <div className="form-heading">
            <h3>Create a task</h3>
          </div>

          <div className="form-grid">
            <label>
              Task title
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="e.g. Prepare project report"
              />
            </label>

            <label>
              Assign to
              <select
                required
                value={form.employee_id}
                onChange={(event) =>
                  setForm({ ...form, employee_id: event.target.value })
                }
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Deadline
              <input
                type="date"
                value={form.deadline}
                onChange={(event) =>
                  setForm({ ...form, deadline: event.target.value })
                }
              />
            </label>

            <label>
              Priority
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>

            <label className="wide-field">
              Description
              <textarea
                rows="3"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Add task details..."
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button className="primary-button" disabled={busy}>
              {busy ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      )}

      <div className="toolbar task-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search tasks or employees..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option>All</option>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <span className="result-count">{visibleTasks.length} tasks</span>
      </div>

      <div className="task-list">
        {visibleTasks.map((task) => (
          <article className="panel task-row" key={task.id}>
            <div className="task-main">
              <div className="task-icon">
                <ListTodo size={20} />
              </div>
              <div className="task-copy">
                <h3>{task.title}</h3>
                <p>{task.description || 'No description provided'}</p>
                <div className="task-meta">
                  <span>{task.employee_name}</span>
                  <span>
                    <CalendarDays size={14} />
                    {task.deadline || 'No deadline'}
                  </span>
                  <span className={`priority ${task.priority.toLowerCase()}`}>
                    {task.priority} priority
                  </span>
                </div>
              </div>
            </div>

            <div className="task-actions">
              <select
                aria-label="Task status"
                className={`status-select ${task.status
                  .toLowerCase()
                  .replace(' ', '-')}`}
                value={task.status}
                onChange={(event) =>
                  updateStatus(task.id, event.target.value)
                }
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <button
                className="icon-button danger-icon"
                title="Delete task"
                onClick={() => removeTask(task.id)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}

        {visibleTasks.length === 0 && (
          <div className="panel empty-state">
            <ListTodo size={28} />
            <strong>No tasks found</strong>
            <span>Create a task or adjust your search and filter.</span>
          </div>
        )}
      </div>
    </div>
  )
}
