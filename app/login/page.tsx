'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || `Hunter_${Math.random().toString(36).slice(2, 8)}`,
              full_name: username || 'New Hunter',
            },
          },
        })

        if (error) throw error
        setMessage('Account created! You can now log in.')
        setIsSignUp(false)
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold">
              <span className="text-[#e94560]">Shadow</span>
              <span className="text-[#eaeaea]">Rank</span>
            </h1>
          </Link>
          <p className="text-[#9ca3af] mt-2">
            {isSignUp ? 'Begin your journey' : 'Welcome back, Hunter'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#16213e] border border-[#374151] rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username field (only for sign up) */}
            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[#9ca3af] mb-2">
                  Hunter Name
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose your hunter name"
                  className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#374151] rounded-lg
                           text-[#eaeaea] placeholder-[#6b7280]
                           focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]
                           transition-colors"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#9ca3af] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hunter@example.com"
                required
                className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#374151] rounded-lg
                         text-[#eaeaea] placeholder-[#6b7280]
                         focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]
                         transition-colors"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#9ca3af] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#374151] rounded-lg
                         text-[#eaeaea] placeholder-[#6b7280]
                         focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]
                         transition-colors"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {message && (
              <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                {message}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#e94560] text-white font-semibold rounded-lg
                       hover:bg-[#ff6b6b] transition-all duration-200
                       shadow-lg shadow-[#e94560]/30 hover:shadow-[#e94560]/50
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Enter the Gate'
              )}
            </button>
          </form>

          {/* Toggle sign up / sign in */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
              className="text-[#9ca3af] hover:text-[#e94560] transition-colors"
            >
              {isSignUp ? (
                <>Already a hunter? <span className="text-[#e94560]">Sign in</span></>
              ) : (
                <>New hunter? <span className="text-[#e94560]">Create account</span></>
              )}
            </button>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#6b7280] hover:text-[#9ca3af] transition-colors text-sm">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
