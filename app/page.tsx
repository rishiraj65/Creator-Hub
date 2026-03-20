"use client"

import { useRef } from "react"
import { Component as RevolutionHero } from "@/components/revolution-hero"
import { motion, useScroll, useTransform, Variants } from "framer-motion"
import { Bot, LineChart, Code, PenTool, Zap, BarChart, Heart, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { useState, useEffect } from "react"

const categories = [
  { icon: Bot, name: "AI Tools", desc: "Automate and generate" },
  { icon: BarChart, name: "Marketing Tools", desc: "Grow your audience" },
  { icon: PenTool, name: "Design Resources", desc: "Assets & templates" },
  { icon: Code, name: "Developer Tools", desc: "Libraries & APIs" },
  { icon: Zap, name: "Business Automation", desc: "Streamline operations" },
  { icon: LineChart, name: "Analytics Tools", desc: "Data insights" },
]

// We will fetch products dynamically from the backend

// Premium easing curve
const transition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      ...transition,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition },
}

export default function Page() {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const [products, setProducts] = useState<any[]>([])
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const productsData = await api.products.list()
        setProducts(productsData.slice(0, 8))
        setError(null)
      } catch (err: any) {
        console.error("Homepage fetch error:", err)
        setError(err.message || "Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchSaved = async () => {
      if (!isAuthenticated) {
        setSavedIds([])
        return
      }
      try {
        const savedData = await api.dashboard.getSavedTools()
        setSavedIds(savedData.saved_products.map((p: any) => p.id))
      } catch (err) {
        console.error("Failed to fetch saved tools:", err)
      }
    }
    fetchSaved()
  }, [isAuthenticated])

  const toggleSave = async (id: number) => {
    if (!isAuthenticated) return
    const isSaved = savedIds.includes(id)
    if (isSaved) {
      setSavedIds(prev => prev.filter(sid => sid !== id))
    } else {
      setSavedIds(prev => [...prev, id])
    }
    try {
      if (isSaved) await api.products.unsave(id)
      else await api.products.save(id)
    } catch (e) {
      if (isSaved) setSavedIds(prev => [...prev, id])
      else setSavedIds(prev => prev.filter(sid => sid !== id))
    }
  }

  const parsePrice = (priceStr: string) => {
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
  }

  // Subtle parallax for background blobs
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -150])

  return (
    <main className="min-h-screen bg-black w-full overflow-hidden flex flex-col scroll-smooth">
      {/* 1. Hero Section (100vh WebGL) */}
      <RevolutionHero />

      {/* 2. Content Container with overlapping relative stack */}
      <div ref={containerRef} className="relative z-10 w-full bg-black">
        {/* Background Blobs for the sections with parallax - Monochromatic */}
        <motion.div 
          style={{ y: blob1Y }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" 
        />
        <motion.div 
          style={{ y: blob2Y }}
          className="absolute top-[40%] right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" 
        />
        
        {/* Categories Section */}
        <section className="container mx-auto px-6 py-24 relative">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-white mb-4">
              Explore by Category
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-500 max-w-2xl mx-auto">
              Find exactly what you need to build, scale, and manage your projects efficiently in our new monochromatic workspace.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.name}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute inset-0 bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{cat.name}</h3>
                  <p className="text-gray-500 group-hover:text-gray-400 transition-colors">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Featured Tools Section */}
        <section className="container mx-auto px-6 py-24 border-t border-white/5 relative">
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Featured Tools</h2>
              <p className="text-gray-500">Handpicked premium resources for modern creators.</p>
            </motion.div>
            <motion.button variants={itemVariants} className="mt-6 md:mt-0 text-white hover:text-gray-300 font-medium transition-colors flex items-center gap-2">
              View All Products <span className="hover:translate-x-1 transition-transform">→</span>
            </motion.button>
          </motion.div>

          <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {loading ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
                <p className="text-gray-400">Loading premium tools...</p>
              </div>
            ) : error ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border border-white/5 bg-white/5 rounded-2xl">
                <p className="text-red-400 mb-2">Error: {error}</p>
                <button onClick={() => window.location.reload()} className="text-sm text-white underline">Try Again</button>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border border-white/5 border-dashed rounded-2xl">
                <p className="text-gray-500">No tools found in the spotlight.</p>
              </div>
            ) : products.map((prod) => (
              <motion.div
                key={prod.id}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
                className="group p-5 rounded-2xl bg-white/[0.02] backdrop-blur-lg border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col"
              >
                <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 mb-4 overflow-hidden relative">
                   <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-zinc-500 font-bold text-2xl group-hover:scale-110 transition-transform duration-500">{prod.name[0]}</span>
                   </div>
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       if (!isAuthenticated) {
                         window.location.href = "/login";
                         return;
                       }
                       toggleSave(prod.id);
                     }}
                     className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 ${
                       savedIds.includes(prod.id) 
                         ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                         : "bg-black/40 text-white/40 hover:text-white"
                     }`}
                   >
                     <Heart className={`w-4 h-4 ${savedIds.includes(prod.id) ? "fill-current" : ""}`} />
                   </button>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="text-xs font-semibold text-zinc-400 mb-1">{prod.category}</div>
                  <h3 className="text-lg font-bold text-gray-100 mb-1 line-clamp-1">{prod.name}</h3>
                  <div className="flex items-center text-zinc-400 text-sm mb-4">
                    {"★".repeat(Math.floor(prod.rating))}
                    <span className="text-zinc-600 ml-2">{prod.rating}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{prod.price}</span>
                    <button 
                      onClick={() => addToCart({ id: String(prod.id), name: prod.name, price: parsePrice(prod.price), category: prod.category })}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white hover:text-black text-gray-300 text-sm font-medium transition-colors active:scale-95 shadow-lg"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Call to Action Section */}
        <section className="relative py-32 overflow-hidden border-t border-white/5 bg-black">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/[0.02]" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/[0.05] blur-[150px] rounded-full mix-blend-screen pointer-events-none" 
          />
          
          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={transition}
              className="max-w-3xl mx-auto backdrop-blur-xl bg-white/[0.02] border border-white/10 p-12 rounded-3xl"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Start Building Faster <br className="hidden md:block" /> with CreatorHub
              </h2>
              <p className="text-xl text-gray-500 mb-10">
                Join thousands of creators in the most premium monochromatic marketplace on the web.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link href="/signup" className="w-full sm:w-auto">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full px-8 py-4 rounded-xl bg-white text-black font-bold text-lg shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)] transition-all"
                      >
                        Create Account
                      </motion.button>
                    </Link>
                    <Link href="/products" className="w-full sm:w-auto">
                      <motion.button 
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full px-8 py-4 rounded-xl bg-white/10 text-white font-bold text-lg backdrop-blur-md transition-all border border-white/10"
                      >
                        Explore Tools
                      </motion.button>
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-8 py-4 rounded-xl bg-white text-black font-bold text-lg shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)] transition-all"
                    >
                      Go to Dashboard
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}
