import { useState } from 'react'
import { LockKeyhole, LockKeyholeIcon, LockKeyholeOpenIcon, Mail, MailOpen } from 'lucide-react'

import api from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)

    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.access_token)

      const currentUser = await api.get('/auth/me')
      onLogin(currentUser.data)
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          'Unable to connect. Check that the backend is running.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <span className="eyebrow dark">WELCOME</span>
          <h2>Sign in to your account</h2>
          <p className="muted">
            Enter your details
          </p>

          <label htmlFor="email">Email address</label>
          <div className="input-icon">
            <MailOpen size={18} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@gmail.com"
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-icon">
            <LockKeyholeOpenIcon size={18} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button className="primary-button full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
            <span>→</span>
          </button>
        </form>

        
      </div>
    </div>
  )
}
