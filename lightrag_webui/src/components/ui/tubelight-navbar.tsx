"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { LogIn } from "lucide-react"

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
  // Set default active tab to 'Sign In' if present, else first item
  const defaultTab = items.find(i => i.name === 'Sign In') ? 'Sign In' : items[0].name;
  const [activeTab, setActiveTab] = useState(defaultTab);
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
      {/* Logo far left */}
      <div className="flex items-center">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Augentik Logo"
            className="w-28 h-28 mr-6 object-contain"
            style={{ minWidth: 80, minHeight: 80, maxWidth: 120, maxHeight: 120 }}
          />
        )}
      </div>
      {/* Nav buttons center */}
      <div className="flex-1 flex items-center justify-center gap-3">
        {items.map((item) => {
          const isActive = activeTab === item.name
          if (item.name === "Sign In") {
            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative cursor-pointer text-lg font-semibold px-6 py-2 rounded-full transition-colors flex items-center gap-2",
                  "text-white/80 hover:text-primary",
                  isActive && "bg-purple-900/20 text-white",
                  "ml-4"
                )}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <LogIn className="w-5 h-5 mr-2" />
                <span className="inline">{item.name}</span>
                {isActive && (
                  <div
                    className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                      <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </div>
                )}
              </Link>
            )
          }
          return (
            <a
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-lg font-semibold px-6 py-2 rounded-full transition-colors",
                "text-white/80 hover:text-primary",
                isActive && "bg-purple-900/20 text-white"
              )}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="inline">{item.name}</span>
              {isActive && (
                <div
                  className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
} 