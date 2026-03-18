"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { User, Mail, Shield, Bell, Check, Loader2 } from "lucide-react"

interface SettingsViewProps {
  user: any
}

export function SettingsView({ user }: SettingsViewProps) {
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      await api.dashboard.updateProfile({ full_name: fullName })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Account Settings</h2>
        <p className="text-zinc-500">Manage your profile, email preferences, and security.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-zinc-400" />
              Personal Information
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name" 
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  />
                </div>
                <div className="space-y-2 opacity-60">
                  <label className="text-sm font-medium text-zinc-400 ml-1">Email Address (Read-only)</label>
                  <div className="w-full bg-zinc-950 border border-white/5 rounded-xl py-3 px-4 text-zinc-500 flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex-1" />
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 min-w-[140px] justify-center"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : success ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl opacity-60 cursor-not-allowed">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-zinc-400" />
              Security & Password
            </h3>
            <p className="text-sm text-zinc-500 mb-6">Password management is temporarily disabled during maintenance.</p>
            <button disabled className="px-6 py-2 bg-white/5 border border-white/10 text-zinc-500 rounded-lg">Change Password</button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/10">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Subscription</h4>
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400">Current Plan</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white">PRO</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-zinc-400">Next Billing</span>
              <span className="text-white text-sm">Apr 15, 2026</span>
            </div>
            <button className="w-full py-2 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-all">Manage Billing</button>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Email Updates</span>
                <div className="w-10 h-5 bg-white/10 rounded-full relative">
                   <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">New Tools</span>
                <div className="w-10 h-5 bg-white/20 rounded-full relative">
                   <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
