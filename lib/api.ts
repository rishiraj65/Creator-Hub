const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || "Something went wrong")
  }

  return response.json()
}

export const api = {
  auth: {
    // Auth is now handled by Supabase in auth-context.tsx
  },
  products: {
    list: () => fetcher("/products/"),
    get: (id: number) => fetcher(`/products/${id}/`),
    save: (id: number) => fetcher(`/products/${id}/save`, { method: "POST" }),
    unsave: (id: number) => fetcher(`/products/${id}/save`, { method: "DELETE" }),
  },
  forum: {
    threads: () => fetcher("/forum/threads/"),
    thread: (id: number) => fetcher(`/forum/threads/${id}/`),
    createThread: (data: any) => fetcher("/forum/threads/", { method: "POST", body: JSON.stringify(data) }),
    createPost: (data: any) => fetcher("/forum/posts/", { method: "POST", body: JSON.stringify(data) }),
    likeThread: (id: number) => fetcher(`/forum/threads/${id}/like`, { method: "POST" }),
    likePost: (id: number) => fetcher(`/forum/posts/${id}/like`, { method: "POST" }),
    deleteThread: (id: number) => fetcher(`/forum/threads/${id}`, { method: "DELETE" }),
  },
  dashboard: {
    get: () => fetcher("/dashboard/"),
    getOrders: () => fetcher("/dashboard/orders"),
    getSavedTools: () => fetcher("/dashboard/saved"),
    updateProfile: (data: { full_name: string }) => fetcher("/dashboard/profile", { 
      method: "PATCH", 
      body: JSON.stringify(data) 
    }),
  },
  cart: {
    get: () => fetcher("/cart/"),
    add: (productId: number, quantity: number = 1) => fetcher("/cart/", { 
      method: "POST", 
      body: JSON.stringify({ product_id: productId, quantity })
    }),
    remove: (productId: number) => fetcher(`/cart/${productId}`, { method: "DELETE" }),
    updateQuantity: (productId: number, delta: number) => fetcher(`/cart/${productId}`, { 
      method: "PUT", 
      body: JSON.stringify({ delta })
    }),
  },
  chat: {
    send: (messages: any[]) => fetcher("/chat/", { 
      method: "POST", 
      body: JSON.stringify({ messages })
    }),
  }
}
