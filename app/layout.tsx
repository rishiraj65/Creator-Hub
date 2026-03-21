import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Chatbot } from "@/components/chatbot"
import { CartProvider } from "@/lib/cart-context"
import { CartSidebar } from "@/components/cart-sidebar"
import { PageTransition } from "@/components/page-transition"
import { AuthProvider } from "@/lib/auth-context"
import { cn } from "@/lib/utils";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "CreatorHub - Digital Tools Marketplace",
    template: "%s | CreatorHub"
  },
  description: "Explore powerful tools, templates, and resources designed to help creators and startups grow faster with a premium liquid morphism experience.",
  keywords: ["Digital Marketplace", "SaaS Tools", "Creator Resources", "Developer Templates", "Liquid Morphism"],
  authors: [{ name: "CreatorHub Team" }],
  creator: "CreatorHub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://creatorhub.example.com",
    title: "CreatorHub - Digital Tools Marketplace",
    description: "The ultimate destination for premium digital assets and liquid morphism designs.",
    siteName: "CreatorHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorHub - Digital Tools Marketplace",
    description: "The ultimate destination for premium digital assets and liquid morphism designs.",
    creator: "@creatorhub",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", fontSans.variable)}
    >
      <body className="bg-background text-foreground min-h-screen flex flex-col pt-0">
        <AuthProvider>
          <CartProvider>
            <ThemeProvider>
              <Navbar />
              <PageTransition>
                {children}
              </PageTransition>
              <Footer />
              <Chatbot />
              <CartSidebar />
              <Script
                id="razorpay-checkout"
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
              />
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
