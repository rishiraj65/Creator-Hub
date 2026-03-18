"use client"

import Link from "next/link"
import { Hexagon, Twitter, Github, Linkedin, Disc as Discord } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black border-t border-white/5 relative overflow-hidden pt-20 pb-10">
      {/* Background Monochromatic blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="relative">
                <Hexagon className="h-8 w-8 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                CreatorHub
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              The ultimate marketplace for digital creators, developers, and designers. Build faster, design better.
            </p>
            <div className="flex items-center gap-4 text-gray-500 mt-2">
              <a href="#" className="hover:text-white hover:scale-110 transition-all"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white hover:scale-110 transition-all"><Github className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white hover:scale-110 transition-all"><Discord className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white hover:scale-110 transition-all"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Resources</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-500">
              <li><Link href="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Help Center & Support</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Community Forum</Link></li>
              <li><Link href="/api" className="hover:text-white transition-colors">API Reference</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/licenses" className="hover:text-white transition-colors">Licenses</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {currentYear} CreatorHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white animate-pulse" /> All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
