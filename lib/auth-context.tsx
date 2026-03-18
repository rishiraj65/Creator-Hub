"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "./supabase"
import { api } from "./api"

interface User {
  id: number
  email: string
  full_name?: string
  role?: string
}

interface AuthContextType {
  user: any | null
  session: any | null
  isLoading: boolean
  login: (email: string) => Promise<void>
  loginWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  verifyOtpAndLogin: (email: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.access_token) {
        sessionStorage.setItem("token", session.access_token)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.access_token) {
        sessionStorage.setItem("token", session.access_token)
      } else {
        sessionStorage.removeItem("token")
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string): Promise<void> => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithPassword = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
        sessionStorage.setItem("token", data.session.access_token)
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string): Promise<void> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })
      if (error) throw error
      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
        sessionStorage.setItem("token", data.session.access_token)
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Signup failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtpAndLogin = async (email: string, otp: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'magiclink'
      })
      if (error) throw error
      
      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
        sessionStorage.setItem("token", data.session.access_token)
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("OTP Verification failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem("token")
    setSession(null)
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      login, 
      loginWithPassword, 
      signUp, 
      verifyOtpAndLogin, 
      logout, 
      isAuthenticated: !!session,
      token: session?.access_token ?? null
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
