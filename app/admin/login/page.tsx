'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'radial-gradient(ellipse 90% 50% at 50% -8%, rgba(232,213,176,0.55), transparent 62%), linear-gradient(180deg, #FAF8F3 0%, #F3EEE6 55%, #EDE6DA 100%)',
      }}
    >
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 overflow-hidden shadow-lg"
            style={{
              border: '1px solid #E6DDD0',
              background: '#FAF8F3',
              boxShadow: '0 12px 32px -16px rgba(158,131,72,0.45)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Goldleaf" width={64} height={64} />
          </div>
          <h1
            className="text-3xl font-serif font-light tracking-wide"
            style={{ color: '#1C1916' }}
          >
            Goldleaf
          </h1>
          <p className="text-sm mt-1.5 font-light" style={{ color: '#9E8348' }}>
            Admin Portal
          </p>
          <p className="text-sm mt-1 font-light" style={{ color: '#6E6862' }}>
            Digital invitation management
          </p>
        </div>

        <div
          className="rounded-2xl px-8 py-10"
          style={{
            background: 'rgba(255,252,248,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid #E6DDD0',
            boxShadow: '0 20px 50px -28px rgba(45,42,38,0.35)',
          }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase tracking-[0.2em]"
                style={{ color: '#9E8348' }}
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@goldleaf.app"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  color: '#1C1916',
                  background: '#FAF8F3',
                  border: '1.5px solid #E6DDD0',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1.5px solid #C4A46A'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(158,131,72,0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1.5px solid #E6DDD0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium uppercase tracking-[0.2em]"
                style={{ color: '#9E8348' }}
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  color: '#1C1916',
                  background: '#FAF8F3',
                  border: '1.5px solid #E6DDD0',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1.5px solid #C4A46A'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(158,131,72,0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1.5px solid #E6DDD0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                style={{
                  color: '#991B1B',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                }}
              >
                <span>⚠</span> {error}
              </div>
            )}

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: '#C4A46A',
                color: '#1C1916',
                border: '1px solid #9E8348',
                boxShadow: '0 8px 24px -10px rgba(158,131,72,0.55)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p
          className="text-center text-xs mt-8 tracking-[0.18em] uppercase"
          style={{ color: '#6E6862' }}
        >
          Restricted access · Authorised personnel only
        </p>
      </div>
    </div>
  )
}
