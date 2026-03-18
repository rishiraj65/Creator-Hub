"use client"

import { motion } from "framer-motion"
import { ShoppingBag, Bookmark, Activity, Bitcoin, TrendingUp, Cloud } from "lucide-react"

interface ProfileViewProps {
  stats: {
    total_orders: number
    saved_tools: number
    account_status: string
  }
  orders: any[]
  market: {
    btc_price: number
    eth_price: number
    weather_temp: number
    weather_condition: string
  }
}

export function ProfileView({ stats, orders, market }: ProfileViewProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Orders</p>
            <h3 className="text-3xl font-bold text-white">{stats.total_orders}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Saved Tools</p>
            <h3 className="text-3xl font-bold text-white">{stats.saved_tools}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Account Status</p>
            <h3 className="text-xl font-bold text-white">{stats.account_status}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Live Data Section */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Live Market Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            key={market.btc_price}
            initial={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            animate={{ backgroundColor: "transparent" }}
            className="p-5 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Bitcoin (BTC)</p>
              <p className="text-lg font-bold text-white">${market.btc_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          </motion.div>
          
          <motion.div 
            key={market.eth_price}
            initial={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            animate={{ backgroundColor: "transparent" }}
            className="p-5 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Ethereum (ETH)</p>
              <p className="text-lg font-bold text-white">${market.eth_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          </motion.div>

           <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Local Weather</p>
              <p className="text-lg font-bold text-white">{market.weather_temp}°F - {market.weather_condition}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mt-4">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    No recent activity found.
                  </td>
                </tr>
              ) : (
                orders.map((order: any, i: number) => (
                  <tr key={order.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i === orders.length - 1 ? 'border-none' : ''}`}>
                    <td className="p-4 font-mono text-sm">{order.id}</td>
                    <td className="p-4">{order.date}</td>
                    <td className="p-4 text-white font-medium">{order.product}</td>
                    <td className="p-4 font-bold">{order.amount}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Completed' ? 'bg-white/10 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
