"use client"

import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input as NumberInput } from "@/components/ui/number-input"

declare global {
  interface Window {
    Razorpay: any
  }
}

export function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert("Please login to proceed with checkout.")
      return
    }

    try {
      setIsProcessing(true)
      
      // 1. Create Order on Backend
      const productNames = items.map(i => i.name).join(", ")
      const order = await api.payments.createOrder({
        amount: totalPrice,
        product_name: productNames
      })

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_id",
        amount: order.amount,
        currency: order.currency,
        name: "CreatorHub",
        description: `Purchase of ${productNames}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 3. Verify Payment on Backend
            const result = await api.payments.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              product_name: productNames,
              amount: totalPrice
            })

            if (result.status === "success") {
              setLastOrderId(result.order_id)
              setIsSuccess(true)
              clearCart()
            }
          } catch (err) {
            console.error("Verification failed", err)
            alert("Payment verification failed. Please contact support.")
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: user?.full_name || user?.email?.split('@')[0] || "User",
          email: user?.email
        },
        theme: {
          color: "#10b981"
        },
        modal: {
          ondismiss: () => setIsProcessing(false)
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      
    } catch (err) {
      console.error("Checkout initialization failed", err)
      alert("Could not initialize checkout. Please try again.")
      setIsProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsCartOpen(false); setIsSuccess(false); }}
            className="fixed inset-0 z-[12000] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[12001] h-screen w-full sm:w-[400px] bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Your Cart</h2>
              </div>
              <button
                onClick={() => { setIsCartOpen(false); setIsSuccess(false); }}
                className="p-2 text-gray-400 hover:text-white transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
                   >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                  <p className="text-gray-400 mb-8">Thank you for your purchase. Your tools are now available in your dashboard.</p>
                  <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 text-left">Order ID</p>
                    <p className="text-emerald-400 font-mono text-sm text-left">{lastOrderId}</p>
                  </div>
                  <Button 
                    onClick={() => { setIsCartOpen(false); setIsSuccess(false); }}
                    className="w-full py-6 bg-white text-black font-bold rounded-xl"
                  >
                    Continue Exploring
                  </Button>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <ShoppingCart className="w-16 h-16 mb-4 text-gray-500" />
                  <p className="text-gray-400">Your cart is empty.</p>
                  <p className="text-sm border-t mt-4 border-gray-700 w-1/2 pt-4">Explore our tools and resources.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-white/5">
                      <span className="text-lg font-bold text-white">{item.name[0]}</span>
                    </div>
                    
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.category}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <NumberInput
                            value={item.quantity}
                            min={1}
                            max={99}
                            onChange={(val) => updateQuantity(item.id, val - item.quantity)}
                            className="text-sm scale-90 origin-left"
                          />
                        </div>
                        <span className="font-bold text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && !isSuccess && (
              <div className="p-6 border-t border-white/10 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-xl font-bold text-white">₹{totalPrice.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-6 text-base font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border-0 shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)] transition-all rounded-xl disabled:opacity-50"
                 >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
