"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Hexagon, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [otpRequired, setOtpRequired] = useState(false)
  const [otpCode, setOtpCode] = useState("")

  const { loginWithPassword, verifyOtpAndLogin } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      await loginWithPassword(email, password)
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your email and password.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP code")
      return
    }

    try {
      setIsLoading(true)
      await verifyOtpAndLogin(email, otpCode)
    } catch (err: any) {
      setError(err.message || "Invalid OTP code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs - Monochromatic */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <Hexagon className="w-10 h-10 text-white group-hover:text-zinc-400 transition-colors" />
            <span className="text-2xl font-bold text-white tracking-tight">
              CreatorHub
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm text-center">Log in to your account to access your tools and dashboard.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </motion.div>
        )}

        {!otpRequired ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-white/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-400">Password</label>
                <a href="#" className="text-xs text-white hover:text-zinc-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-white/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-white text-black hover:bg-zinc-200 font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-2 text-center">
              <p className="text-sm text-gray-300">
                We've sent a 6-digit verification code to
                <br />
                <span className="font-semibold text-white">{email}</span>
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-400 mb-1.5 block">Verification Code</label>
              <div className="relative">
                <input 
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black/40 border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder:text-gray-600 outline-none transition-colors"
                  placeholder="000000"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="mt-4 w-full bg-white text-black hover:bg-zinc-200 font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>Verify & Login <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpRequired(false)
                setOtpCode("")
                setError("")
              }}
              className="w-full bg-transparent text-gray-400 hover:text-white font-medium py-2 rounded-xl transition-all"
            >
              Back to Login
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-white hover:text-zinc-300 font-medium transition-colors underline underline-offset-4 decoration-white/20">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
