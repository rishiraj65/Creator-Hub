"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Hexagon, ShoppingCart, Home, LayoutDashboard, LayoutGrid, MessageSquare, UserPlus, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { AnimeNavBar } from "@/components/ui/anime-navbar"

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const { totalItems, setIsCartOpen } = useCart()
  const { user, logout, isAuthenticated } = useAuth()

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "HOME", url: "/", icon: Home },
    { name: "PRODUCTS", url: "/products", icon: LayoutGrid },
    { name: "DASHBOARD", url: "/dashboard", icon: LayoutDashboard },
    { name: "FORUM", url: "/forum", icon: MessageSquare },
  ]

  if (!isAuthenticated) {
    navItems.push({ name: "JOIN US", url: "/signup", icon: UserPlus })
  }

  const handleNavClick = (name: string, url: string) => {
    // Nav actions handled here if needed
  }

  const logo = (
    <Link href="/" className="flex items-center gap-2 group relative">
      <div className="relative">
        <Hexagon className="h-8 w-8 text-white group-hover:text-zinc-400 transition-colors" />
        <div className="absolute inset-0 bg-white/10 blur-sm rounded-full group-hover:bg-white/20 transition-all" />
      </div>
      <span className="text-xl font-bold text-white tracking-tight hidden sm:inline">
        CreatorHub
      </span>
    </Link>
  )

  const rightActions = (
    <div className="flex items-center gap-4">
      {isAuthenticated && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle Cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-white text-[10px] font-bold text-black flex items-center justify-center translate-x-1 -translate-y-1">
              {totalItems}
            </span>
          )}
        </button>
      )}
      
      {!isAuthenticated ? (
        <Link href="/login">
          <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold uppercase tracking-wider">
            Login
          </Button>
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Creator</span>
            <span className="text-xs text-white font-semibold leading-tight">{user?.email.split('@')[0]}</span>
          </div>
          <div className="relative group">
            <Link href="/dashboard">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                {user?.email.charAt(0).toUpperCase()}
              </div>
            </Link>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
              <div className="p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Integrated Unified NavBar */}
      <AnimeNavBar 
        items={navItems} 
        defaultActive="HOME" 
        onItemClick={handleNavClick} 
        leftContent={logo}
        rightContent={rightActions}
      />
    </>
  )
}
