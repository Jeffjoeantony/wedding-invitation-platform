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

    // Redirect to dashboard — middleware will confirm the session
    router.push('/admin')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(160deg, #1a0010 0%, #3d0020 35%, #6d1040 65%, #3d0020 100%)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-0 w-[500px] h-[500px] pointer-events-none opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255,80,120,0.5), transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(190,18,60,0.8), rgba(120,0,40,0.9))',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            💍
          </div>
          <h1
            className="text-2xl font-serif italic"
            style={{
              background: 'linear-gradient(135deg, #fff 20%, #ffb3c6 60%, #fff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Admin Portal
          </h1>
          <p className="text-rose-300/60 text-sm mt-1 font-light">Wedding Management Dashboard</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl px-8 py-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.13)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-rose-200/80 uppercase tracking-widest">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wedding.com"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,100,130,0.5)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-rose-200/80 uppercase tracking-widest">
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
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,100,130,0.5)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                }}
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-red-200 flex items-center gap-2"
                style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)' }}
              >
                <span>⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-medium tracking-wide text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: 'linear-gradient(135deg, #be123c, #9f1239)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Subtle footer */}
        <p className="text-center text-white/15 text-xs mt-8 tracking-widest">
          Restricted access · Authorised personnel only
        </p>
      </div>
    </div>
  )
}
