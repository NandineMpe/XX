"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: React.ReactNode
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  logoUrl?: string
}

export function TubelightNavBar({ items, className, logoUrl }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-black/80 shadow-md backdrop-blur-lg",
        className,
      )}
    >
      {/* Logo left */}
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Augentik Logo"
          className="w-20 h-20 mr-6"
          style={{ minWidth: 64, minHeight: 64 }}
        />
      )}
      {/* Nav buttons right */}
      <div className="flex items-center gap-3 ml-auto">
        {items.map((item) => {
          const isActive = activeTab === item.name
          return (
            <a
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-lg font-semibold px-6 py-2 rounded-full transition-colors",
                "text-white/80 hover:text-primary",
                isActive && "bg-purple-900/40 text-white",
                item.name === "Sign In" && "ml-4 bg-emerald-500 text-white hover:bg-emerald-600"
              )}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="inline">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
} 