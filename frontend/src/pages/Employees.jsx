import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Users, X } from 'lucide-react'

import api from '../services/api'

const initialForm = {
  name: '',
  email: '',
  department: 'Engineering',
  position: 'Employee',
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadEmployees() {
    try {
      const { data } = await api.get('/employees')
      setEmployees(data)
      setError('')
    } catch {
      setError('Could not load employees. Please check your backend connection.')
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  async function addEmployee(event) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      await api.post('/employees', form)
      setForm(initialForm)
      setShowForm(false)
      await loadEmployees()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not add employee.')
    } finally {
      setBusy(false)
    }
  }

  async function removeEmployee(id) {
    const confirmed = window.confirm(
      'Delete this employee and their assigned tasks?',
    )
    if (!confirmed) return

    try {
      await api.delete(`/employees/${id}`)
      await loadEmployees()
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail || 'Could not delete employee.',
      )
    }
  }

  const normalizedSearch = search.toLowerCase()
  const visibleEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.email} ${employee.department}`
      .toLowerCase()
      .includes(normalizedSearch),
  )

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Employees</h1>
          <p className="muted">
            Manage your team members and their details.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Add employee
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="panel employee-form" onSubmit={addEmployee}>
          <div className="form-heading">
            <h3>New employee</h3>
            <button
              type="button"
              className="icon-button"
              onClick={() => setShowForm(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="form-grid">
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="e.g. akhil"
              />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="akhil@gmail.com"
              />
            </label>
            <label>
              Department
              <input
                required
                value={form.department}
                onChange={(event) =>
                  setForm({ ...form, department: event.target.value })
                }
              />
            </label>
            <label>
              Position
              <input
                required
                value={form.position}
                onChange={(event) =>
                  setForm({ ...form, position: event.target.value })
                }
              />
            </label>
          </div>

          <button className="primary-button" disabled={busy}>
            {busy ? 'Saving…' : 'Save employee'}
          </button>
        </form>
      )}

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search employees..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <span className="result-count">
          {visibleEmployees.length} team members
        </span>
      </div>

      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT</th>
                <th>POSITION</th>
                <th>EMAIL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="person-cell">
                      <div className="avatar table-avatar">
                        {employee.name[0]?.toUpperCase()}
                      </div>
                      <strong>{employee.name}</strong>
                    </div>
                  </td>
                  <td>{employee.department}</td>
                  <td>
                    <span className="role-pill">{employee.position}</span>
                  </td>
                  <td className="email-cell">{employee.email}</td>
                  <td>
                    <button
                      className="icon-button danger-icon"
                      title="Delete employee"
                      onClick={() => removeEmployee(employee.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleEmployees.length === 0 && (
            <div className="empty-state">
              <Users size={28} />
              <strong>No employees found</strong>
              <span>Add an employee or change your search.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
