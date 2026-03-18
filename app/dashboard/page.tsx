"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, ShoppingBag, Bookmark, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

// Modular Views
import { ProfileView } from "@/components/dashboard/profile-view"
import { OrdersView } from "@/components/dashboard/orders-view"
import { SavedToolsView } from "@/components/dashboard/saved-tools-view"
import { SettingsView } from "@/components/dashboard/settings-view"

export default function Dashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("Profile")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!isAuthenticated) return
      try {
        setLoading(true)
        const dashboardData = await api.dashboard.get()
        setData(dashboardData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [isAuthenticated])

  // Auto-refresh market data every 10 seconds for Profile view
  useEffect(() => {
    if (!data || !isAuthenticated || activeTab !== "Profile") return
    const interval = setInterval(async () => {
      try {
        const freshData = await api.dashboard.get()
        setData((prev: any) => ({
          ...prev,
          market: freshData.market
        }))
      } catch (e) {
        console.error("Market update failed", e)
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [data, isAuthenticated, activeTab])

  const menu = [
    { id: "Profile", icon: User },
    { id: "Orders", icon: ShoppingBag },
    { id: "Saved Tools", icon: Bookmark },
    { id: "Settings", icon: Settings },
  ]

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium">Loading your creative space...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-red-500/5 border border-red-500/20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Dashboard Unavailable</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-white text-black font-bold rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Orders":
        return <OrdersView />
      case "Saved Tools":
        return <SavedToolsView />
      case "Settings":
        return <SettingsView user={user} />
      case "Profile":
      default:
        return <ProfileView stats={data.stats} orders={data.orders} market={data.market} />
    }
  }

  return (
    <div className="min-h-screen bg-black pt-36 pb-20 relative">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
          <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 mb-6">
             <div className="w-16 h-16 rounded-full bg-gradient-to-r from-zinc-700 to-zinc-900 mb-4 flex items-center justify-center border border-white/20 shadow-xl">
               <span className="text-2xl font-bold text-white">{user?.email.charAt(0).toUpperCase()}</span>
             </div>
             <h2 className="text-xl font-bold text-white truncate">{user?.email.split('@')[0]}</h2>
             <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Creator</p>
          </div>

          <div className="flex flex-col gap-2">
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? "bg-white/10 border border-white/20 text-white" 
                    : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.id}</span>
              </button>
            ))}
            
            <div className="mt-4 pt-4 border-t border-white/5">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400/70 hover:text-red-400 hover:bg-red-400/5 border border-transparent"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
        
      </div>
    </div>
  )
}
