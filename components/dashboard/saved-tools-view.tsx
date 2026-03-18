"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Bookmark, Star, ArrowRight, X } from "lucide-react"
import Link from "next/link"

export function SavedToolsView() {
  const [savedTools, setSavedTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSaved = async () => {
    try {
      setLoading(true)
      const data = await api.dashboard.getSavedTools()
      setSavedTools(data.saved_products)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSaved()
  }, [])

  const handleUnsave = async (productId: number) => {
    try {
      await api.products.unsave(productId)
      setSavedTools(prev => prev.filter(p => p.id !== productId))
    } catch (err: any) {
      console.error("Failed to unsave product", err)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      <p className="text-zinc-500">Loading your saved tools...</p>
    </div>
  )

  if (error) return (
     <div className="p-8 rounded-2xl bg-red-400/5 border border-red-400/20 text-center">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Saved Tools</h2>
        <p className="text-zinc-500">A curated collection of your favorite digital assets.</p>
      </div>

      {savedTools.length === 0 ? (
         <div className="p-20 rounded-3xl bg-white/[0.02] border border-white/5 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Your collection is empty</h3>
            <p className="text-zinc-500 max-w-xs mx-auto">Click the heart icon on any product in the marketplace to save it for later.</p>
            <Link href="/products" className="mt-4 px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
              Explore Products <ArrowRight className="w-4 h-4" />
            </Link>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedTools.map((tool) => (
            <div key={tool.id} className="group relative rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all overflow-hidden p-6">
              <button 
                onClick={() => handleUnsave(tool.id)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{tool.category}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
              <p className="text-sm text-zinc-500 line-clamp-2 mb-6">{tool.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-yellow-500/80">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{tool.rating}</span>
                </div>
                <div className="text-lg font-bold text-white">{tool.price}</div>
              </div>
              
              <Link href={`/products/${tool.id}`} className="mt-6 w-full py-3 block text-center bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
