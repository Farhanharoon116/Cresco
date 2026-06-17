'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { TrendingUp, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/actions/auth'
import { toast } from 'sonner'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const calculateStrength = (pw: string) => {
    let score = 0
    if (!pw) return 0
    if (pw.length >= 8) score += 25
    if (pw.match(/[A-Z]/)) score += 25
    if (pw.match(/[0-9]/)) score += 25
    if (pw.match(/[^A-Za-z0-9]/)) score += 25
    return score
  }
  const strength = calculateStrength(password)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const result = await signUp(new FormData(e.currentTarget))
    if (result && !result.success) {
      setError(result.error)
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 border border-border"
    >
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
          <TrendingUp className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">Cresco</span>
      </div>

      <h1 className="text-2xl font-bold mb-1">Start growing today</h1>
      <p className="text-muted-foreground mb-8">Create your free AI finance account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Your name</Label>
          <Input id="full_name" name="full_name" type="text" placeholder="Ahmed Khan" required autoComplete="name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@university.edu" required autoComplete="email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password" name="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 characters" required autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {password && (
            <div className="space-y-1.5 mt-2">
              <div className="flex gap-1 h-1">
                {[25, 50, 75, 100].map((step) => (
                  <div 
                    key={step} 
                    className={`flex-1 rounded-full ${
                      strength >= step 
                        ? strength <= 25 ? 'bg-red-500' 
                          : strength <= 50 ? 'bg-amber-500' 
                          : strength <= 75 ? 'bg-emerald-400' 
                          : 'bg-emerald-600'
                        : 'bg-muted'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-right font-medium">
                {strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm_password" name="confirm_password"
              type={showPw ? 'text' : 'password'}
              placeholder="Confirm your password" required autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create free account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
