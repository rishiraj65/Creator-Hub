"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { ShoppingBag, Search, Filter, ArrowRight } from "lucide-react"

export function OrdersView() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await api.dashboard.getOrders()
        setOrders(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      <p className="text-zinc-500">Retrieving your order history...</p>
    </div>
  )

  if (error) return (
    <div className="p-8 rounded-2xl bg-red-400/5 border border-red-400/20 text-center">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Your Orders</h2>
          <p className="text-zinc-500">Manage and track your digital asset purchases.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <input 
               type="text" 
               placeholder="Search orders..." 
               className="bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-full md:w-64"
             />
           </div>
           <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors">
             <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-20 rounded-3xl bg-white/[0.02] border border-white/5 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-white">No orders yet</h3>
          <p className="text-zinc-500 max-w-xs mx-auto">Looks like you haven't made any purchases yet. Explore our marketplace to find powerful tools for your next project.</p>
          <a href="/products" className="mt-4 px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
            Browse Products <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
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
                {orders.map((order, i) => (
                  <tr key={order.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i === orders.length - 1 ? 'border-none' : ''}`}>
                    <td className="p-4 font-mono text-sm">{order.id}</td>
                    <td className="p-4">{order.date}</td>
                    <td className="p-4 text-white font-medium">{order.product}</td>
                    <td className="p-4 font-bold">{order.amount.replace('$', '₹')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Completed' ? 'bg-white/10 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
