"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  MessageSquare, 
  ThumbsUp, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Search, 
  Plus,
  User,
  MoreVertical,
  Filter,
  Trash2,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

const categories = [
  "All Discussions",
  "Product Help",
  "Design Tips",
  "Development",
  "Marketplace News",
  "Showcase"
]

const transition = {
  duration: 0.6,
}

export default function ForumPage() {
  const { user, isAuthenticated } = useAuth()
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [activeCategory, setActiveCategory] = useState("All Discussions")
  const [searchQuery, setSearchQuery] = useState("")

  // Thread Creation State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newThreadTitle, setNewThreadTitle] = useState("")
  const [newThreadCategory, setNewThreadCategory] = useState("Development")
  const [newThreadContent, setNewThreadContent] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Thread Detail State
  const [selectedThread, setSelectedThread] = useState<any>(null)
  const [newComment, setNewComment] = useState("")
  const [isCommenting, setIsCommenting] = useState(false)

  const fetchThreads = async () => {
    try {
      setLoading(true)
      const data = await api.forum.threads()
      setThreads(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [])

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newThreadTitle || !newThreadContent) return
    
    try {
      setIsCreating(true)
      await api.forum.createThread({
        title: newThreadTitle,
        category: newThreadCategory,
        content: newThreadContent
      })
      setShowCreateModal(false)
      setNewThreadTitle("")
      setNewThreadContent("")
      fetchThreads()
    } catch (err) {
      console.error("Failed to create thread", err)
    } finally {
      setIsCreating(false)
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment || !selectedThread) return

    try {
      setIsCommenting(true)
      await api.forum.createPost({
        thread_id: selectedThread.id,
        content: newComment
      })
      setNewComment("")
      // Refresh thread details
      const updatedThread = await api.forum.thread(selectedThread.id)
      setSelectedThread(updatedThread)
      fetchThreads() // Refresh list for comment count
    } catch (err) {
      console.error("Failed to post comment", err)
    } finally {
      setIsCommenting(false)
    }
  }

  const handleLikeThread = async (e: React.MouseEvent, threadId: number) => {
    e.stopPropagation()
    try {
      const resp = await api.forum.likeThread(threadId)
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, likes: resp.likes } : t))
      if (selectedThread?.id === threadId) {
        setSelectedThread((prev: any) => ({ ...prev, likes: resp.likes }))
      }
    } catch (err) {
      console.error("Like failed", err)
    }
  }

  const handleLikePost = async (postId: number) => {
    try {
      const resp = await api.forum.likePost(postId)
      setSelectedThread((prev: any) => ({
        ...prev,
        posts: prev.posts.map((p: any) => p.id === postId ? { ...p, likes: resp.likes } : p)
      }))
    } catch (err) {
      console.error("Like failed", err)
    }
  }

  const handleDeleteThread = async (e: React.MouseEvent, threadId: number) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this discussion?")) return
    
    try {
      await api.forum.deleteThread(threadId)
      setThreads(prev => prev.filter(t => t.id !== threadId))
      if (selectedThread?.id === threadId) {
        setSelectedThread(null)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  useEffect(() => {
    if (showCreateModal || selectedThread) {
      document.documentElement.classList.add("hide-navbar")
    } else {
      document.documentElement.classList.remove("hide-navbar")
    }
    return () => document.documentElement.classList.remove("hide-navbar")
  }, [showCreateModal, selectedThread])

  const filteredThreads = threads
    .filter(t => activeCategory === "All Discussions" || t.category === activeCategory)
    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-black pt-36 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transition}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Community Forum
            </h1>
            <p className="text-zinc-500 font-medium">Connect, share, and grow with fellow creators.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transition}
            className="flex items-center gap-3"
          >
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-black hover:bg-zinc-200 font-bold px-6 py-6 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Plus className="mr-2 h-5 w-5" /> Start Discussion
            </Button>
          </motion.div>
        </div>

        {/* Search & Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="lg:col-span-3 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search discussions..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all backdrop-blur-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Active Now</span>
            </div>
            <span className="text-white font-bold">1,284</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <aside className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...transition, delay: 0.2 }}
              className="space-y-1"
            >
              <h3 className="text-white font-bold mb-4 px-2 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Categories
              </h3>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                    activeCategory === cat 
                      ? "bg-white text-black font-bold shadow-lg" 
                      : "text-zinc-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </aside>

          {/* Threads List */}
          <main className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Loader2 className="w-12 h-12 text-zinc-600 animate-spin mb-4" />
                <h3 className="text-zinc-500 font-medium">Fetching community discussions...</h3>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-red-500/20 bg-red-500/5 rounded-2xl font-bold">
                 <h3 className="text-lg text-white mb-2">Failed to load forum</h3>
                 <p className="text-gray-500">{error}</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-white/5 border-dashed rounded-2xl">
                 <MessageSquare className="w-12 h-12 text-zinc-600 mb-4" />
                 <h3 className="text-lg font-medium text-white mb-2">No threads in this category yet</h3>
                 <p className="text-gray-500">Be the first to start a conversation!</p>
              </div>
            ) : (
              filteredThreads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...transition, delay: 0.1 * index + 0.3 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedThread(thread)}
                  className="group p-6 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-white/20 transition-all backdrop-blur-xl relative overflow-hidden cursor-pointer text-left"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    {user?.email === thread.author_email && (
                      <button 
                        onClick={(e) => handleDeleteThread(e, thread.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <MoreVertical className="h-5 w-5 text-zinc-500 cursor-pointer hover:text-white" />
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 shrink-0">
                      <User className="h-6 w-6 text-zinc-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{thread.category}</span>
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-600">{new Date(thread.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-white mb-2 group-hover:text-zinc-100 transition-colors">
                        {thread.title}
                      </h2>
                      
                      <p className="text-zinc-500 text-sm mb-6 line-clamp-2 md:line-clamp-none">
                        {thread.content}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={(e) => handleLikeThread(e, thread.id)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm font-bold">{thread.likes || 0}</span>
                          </button>
                          <button 
                            onClick={() => setSelectedThread(thread)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm font-bold">{thread.posts?.length || 0}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <span className="text-xs font-medium">By</span>
                          <span className="text-sm font-bold text-zinc-300">Creator #{thread.author_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center py-8"
            >
              <Button variant="ghost" className="text-zinc-500 hover:text-white hover:bg-white/5 font-bold">
                Load More Discussions
              </Button>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Create Thread Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Start a New Discussion</h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Category</label>
                <select 
                  value={newThreadCategory}
                  onChange={(e) => setNewThreadCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30"
                >
                  {categories.filter(c => c !== "All Discussions").map(c => (
                    <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Title</label>
                <Input 
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Content</label>
                <Textarea 
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="bg-black/40 border-white/10 text-white min-h-[150px]"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 text-zinc-500 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-white text-black font-bold"
                >
                  {isCreating ? "Creating..." : "Post Discussion"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Thread Detail Modal */}
      {selectedThread && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedThread(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                      {selectedThread.category}
                    </span>
                    <span className="text-sm font-bold text-zinc-300">Creator #{selectedThread.author_id}</span>
                  </div>
                  {user?.email === selectedThread.author_email && (
                    <button 
                      onClick={(e) => handleDeleteThread(e, selectedThread.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-xs font-bold shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>
              <span className="text-xs text-zinc-600">{new Date(selectedThread.created_at).toLocaleDateString()}</span>
              
              <h2 className="text-3xl font-bold text-white mb-4">{selectedThread.title}</h2>
              
              <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <span className="text-sm font-bold text-zinc-300">Creator #{selectedThread.author_id}</span>
              </div>
              
              <p className="text-zinc-400 leading-relaxed mb-8 whitespace-pre-wrap">{selectedThread.content}</p>
              
              <div className="border-t border-white/10 pt-8 mt-8">
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" /> Replies ({selectedThread.posts?.length || 0})
                </h3>
                
                <div className="space-y-4 mb-8">
                  {selectedThread.posts?.map((post: any) => (
                    <div key={post.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-400">Creator #{post.author_id}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{post.likes || 0}</span>
                          </button>
                          <span className="text-[10px] text-zinc-600 uppercase font-bold">{new Date(post.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <p className="text-zinc-300 text-sm whitespace-pre-wrap">{post.content}</p>
                    </div>
                  ))}
                  {(!selectedThread.posts || selectedThread.posts.length === 0) && (
                    <p className="text-center text-zinc-600 italic py-4">No replies yet. Be the first to join the conversation!</p>
                  )}
                </div>
                
                <form onSubmit={handlePostComment} className="space-y-4">
                  <Textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Join the discussion..."
                    className="bg-black/40 border-white/10 text-white min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={isCommenting || !isAuthenticated}
                      className="bg-white text-black font-bold px-8"
                    >
                      {isCommenting ? "Posting..." : "Reply"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedThread(null)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
