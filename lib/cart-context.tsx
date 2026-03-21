"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./auth-context"
import { api } from "./api"

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  totalPrice: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { isAuthenticated } = useAuth()

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const backendItems = await api.cart.get()
      const formattedItems = backendItems.map((item: any) => ({
        id: item.product_id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      }))
      setItems(formattedItems)
    } catch (e) {
      console.error("Failed to fetch cart", e)
    }
  }, [isAuthenticated])

  // Sync on mount and auth change
  useEffect(() => {
    setIsMounted(true)
    if (isAuthenticated) {
      refreshCart()
    } else {
      setItems([]) // Clear cart when logged out
    }
  }, [isAuthenticated, refreshCart])

  const addToCart = async (newItem: Omit<CartItem, "quantity">) => {
    if (isAuthenticated) {
      try {
        await api.cart.add(parseInt(newItem.id), 1)
        await refreshCart()
      } catch (e) {
        console.error("Failed to add to cart", e)
      }
    } else {
      // Logic for guest if needed, but UI hides cart anyway
      setItems(prev => {
        const existing = prev.find(i => i.id === newItem.id)
        if (existing) {
          return prev.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i)
        }
        return [...prev, { ...newItem, quantity: 1 }]
      })
    }
    setIsCartOpen(true)
  }

  const removeFromCart = async (id: string) => {
    if (isAuthenticated) {
      try {
        await api.cart.remove(parseInt(id))
        await refreshCart()
      } catch (e) {
        console.error("Failed to remove from cart", e)
      }
    } else {
      setItems(prev => prev.filter(i => i.id !== id))
    }
  }

  const updateQuantity = async (id: string, delta: number) => {
    if (isAuthenticated) {
      try {
        await api.cart.updateQuantity(parseInt(id), delta)
        await refreshCart()
      } catch (e) {
        console.error("Failed to update quantity", e)
      }
    } else {
      setItems(prev => prev.map(i => {
        if (i.id === id) {
          const newQ = Math.max(1, i.quantity + delta)
          return { ...i, quantity: newQ }
        }
        return i
      }))
    }
  }

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const clearCart = () => {
    setItems([])
    if (!isAuthenticated) {
      localStorage.removeItem("guest-cart")
    }
  }

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      totalPrice,
      totalItems,
      isCartOpen,
      setIsCartOpen,
      refreshCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
