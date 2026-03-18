"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Filter, ChevronDown, Star, Search, Loader2, Heart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const categories = ["All", "AI Tools", "Marketing Tools", "Design Resources", "Developer Tools", "Business Automation", "Analytics Tools"]

export default function ProductsPage() {
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [priceRange, setPriceRange] = useState<number>(100)
  const [minRating, setMinRating] = useState<number>(0)
  const [sortOption, setSortOption] = useState("Popularity")

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true)
        const [productsData, savedData] = await Promise.all([
          api.products.list(),
          isAuthenticated ? api.dashboard.getSavedTools() : Promise.resolve({ saved_products: [] })
        ])
        setProducts(productsData)
        if (isAuthenticated) {
          setSavedIds(savedData.saved_products.map((p: any) => p.id))
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    initPage()
  }, [isAuthenticated])

  const parsePrice = (priceStr: string) => {
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
  }

  const filteredProducts = products
    .filter(p => category === "All" || p.category === category)
    .filter(p => parsePrice(p.price) <= priceRange)
    .filter(p => p.rating >= minRating)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const priceA = parsePrice(a.price)
      const priceB = parsePrice(b.price)
      if (sortOption === "Price: Low to High") return priceA - priceB
      if (sortOption === "Price: High to Low") return priceB - priceA
      if (sortOption === "Rating") return b.rating - a.rating
      return 0
    })

  const toggleSave = async (id: number) => {
    if (!isAuthenticated) return
    const isSaved = savedIds.includes(id)
    
    // Optimistic Update
    if (isSaved) {
      setSavedIds(prev => prev.filter(sid => sid !== id))
    } else {
      setSavedIds(prev => [...prev, id])
    }

    try {
      if (isSaved) {
        await api.products.unsave(id)
      } else {
        await api.products.save(id)
      }
    } catch (e) {
      console.error("Save toggle failed", e)
      // Rollback on error
      if (isSaved) {
        setSavedIds(prev => [...prev, id])
      } else {
        setSavedIds(prev => prev.filter(sid => sid !== id))
      }
    }
  }

  return (
    <div className="min-h-screen bg-black pt-36 pb-20 relative">
      {/* Background Effect - Monochromatic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Explore Digital Tools</h1>
          <p className="text-gray-400 max-w-2xl">Find everything you need to build, launch, and scale your digital creations.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search tools..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center justify-between">
                  Categories <ChevronDown className="w-4 h-4 text-gray-400" />
                </h3>
                <div className="flex flex-col gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-left text-sm px-3 py-1.5 rounded-md transition-colors ${
                        category === cat ? "bg-white/10 text-white font-medium" : "text-gray-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center justify-between">
                  Max Price: ${priceRange}
                </h3>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={priceRange} 
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-white font-medium mb-3">Minimum Rating</h3>
                <div className="flex flex-col gap-2">
                  {[4, 3, 0].map(star => (
                    <button
                      key={star}
                      onClick={() => setMinRating(star)}
                      className={`text-left text-sm px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                        minRating === star ? "bg-white/10 text-white font-medium" : "text-gray-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {star === 0 ? "Any Rating" : (
                        <span className="flex items-center text-yellow-500">
                           {"★".repeat(star)}{"☆".repeat(5-star)} <span className="text-gray-500 text-xs ml-1">& up</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

            {/* Product Grid */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <span className="text-gray-400 text-sm">Showing {filteredProducts.length} results</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
                >
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <Loader2 className="w-12 h-12 text-zinc-600 animate-spin mb-4" />
                <h3 className="text-zinc-500 font-medium">Fulfilling the monochromatic catalog...</h3>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border border-red-500/20 bg-red-500/5 rounded-2xl">
                 <h3 className="text-lg font-medium text-white mb-2">Connection Error</h3>
                 <p className="text-gray-500">{error}</p>
                 <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border border-white/5 border-dashed rounded-2xl">
                <Filter className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => { setCategory("All"); setPriceRange(100); setMinRating(0); setSearch(""); }}
                  className="mt-4 text-white hover:text-gray-300 transition-colors text-sm underline decoration-white/20 underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map((prod, i) => (
                  <motion.div
                    key={prod.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group flex flex-col p-5 rounded-2xl bg-white/[0.02] backdrop-blur-lg border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                  >
                    <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 mb-4 overflow-hidden relative">
                       <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                       <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-gray-700 font-bold text-3xl">{prod.name[0]}</span>
                       </div>
                       
                       {isAuthenticated && (
                         <button 
                           onClick={() => toggleSave(prod.id)}
                           className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 ${
                             savedIds.includes(prod.id) 
                               ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                               : "bg-black/40 text-white/40 hover:text-white"
                           }`}
                         >
                           <Heart className={`w-4 h-4 ${savedIds.includes(prod.id) ? "fill-current" : ""}`} />
                         </button>
                       )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="text-xs font-semibold text-zinc-400 mb-1">{prod.category}</div>
                      <h3 className="text-lg font-bold text-gray-100 mb-1 line-clamp-1">{prod.name}</h3>
                      <div className="flex items-center text-yellow-500 text-sm mb-4">
                        {"★".repeat(Math.floor(prod.rating))}
                        <span className="text-gray-500 ml-2">{prod.rating}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-xl font-bold text-white">{prod.price}</span>
                        <button 
                          onClick={() => addToCart({ id: String(prod.id), name: prod.name, price: parsePrice(prod.price), category: prod.category })}
                          className="px-4 py-2 rounded-lg bg-white/5 text-white font-medium hover:bg-white hover:text-black transition-all duration-300 active:scale-95 border border-white/10"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
