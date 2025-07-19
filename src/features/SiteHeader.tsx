import Button from '@/components/ui/Button'
import { SiteInfo, webuiPrefix } from '@/lib/constants'
import AppSettings from '@/components/AppSettings'
import { TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/state'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { navigationService } from '@/services/navigation'
import { ZapIcon, LogOutIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

interface NavigationTabProps {
  value: string
  currentTab: string
  children: React.ReactNode
  onClick?: () => void
}

function NavigationTab({ value, currentTab, children, onClick }: NavigationTabProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        'cursor-pointer px-2 py-1 transition-all rounded-md',
        currentTab === value ? '!bg-emerald-400 !text-zinc-50' : 'hover:bg-background/60'
      )}
      onClick={onClick}
    >
      {children}
    </TabsTrigger>
  )
}

function TabsNavigation() {
  const currentTab = useSettingsStore.use.currentTab()
  const setCurrentTab = useSettingsStore.use.setCurrentTab()
  const { t } = useTranslation()

  return (
    <div className="flex h-8 self-center">
      <TabsList className="h-full gap-2">
        <NavigationTab value="audit-queries" currentTab={currentTab} onClick={() => setCurrentTab('audit-queries')}>
          {t('header.auditQueries')}
        </NavigationTab>
        <NavigationTab value="knowledge-graph" currentTab={currentTab} onClick={() => setCurrentTab('knowledge-graph')}>
          {t('header.knowledgeGraphVisualisations')}
        </NavigationTab>
        <NavigationTab value="support" currentTab={currentTab} onClick={() => setCurrentTab('support')}>
          {t('header.support')}
        </NavigationTab>
      </TabsList>
    </div>
  )
}

export default function SiteHeader() {
  const { t } = useTranslation()
  const { isGuestMode, username, webuiTitle, webuiDescription } = useAuthStore()

  const handleLogout = () => {
    navigationService.navigateToLogin();
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-black/80 shadow-md backdrop-blur-lg">
      {/* Logo far left */}
      <div className="flex items-center">
        <a href={webuiPrefix} className="flex items-center gap-2">
          <img
            src="https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/Augentik%20Logo.png"
            alt="Augentik Logo"
            className="w-20 h-20 mr-6 object-contain"
            style={{ minWidth: 80, minHeight: 80, maxWidth: 120, maxHeight: 120 }}
          />
          <span className="font-bold md:inline-block text-white text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>Augentik</span>
        </a>
        <div className="flex items-center">
          <span className="mx-1 text-xs text-gray-400">|</span>
          <span className="font-medium text-lg cursor-default text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Client Side Audit Management
          </span>
        </div>
      </div>

      {/* Center nav tabs */}
      <div className="flex h-10 flex-1 items-center justify-center">
        <TabsNavigation />
        {isGuestMode && (
          <div className="ml-2 self-center px-2 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded-md">
            {t('login.guestMode', 'Guest Mode')}
          </div>
        )}
      </div>

      {/* Right side settings and logout */}
      <div className="flex items-center gap-2">
        <AppSettings />
        {!isGuestMode && (
          <Button
            variant="ghost"
            size="icon"
            side="bottom"
            tooltip={`${t('header.logout')} (${username})`}
            onClick={handleLogout}
          >
            <LogOutIcon className="size-4 text-white" aria-hidden="true" />
          </Button>
        )}
      </div>
    </header>
  )
}
