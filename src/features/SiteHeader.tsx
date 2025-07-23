import Button from '@/components/ui/Button'
import { webuiPrefix } from '@/lib/constants'
import AppSettings from '@/components/AppSettings'
import { TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/state'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { navigationService } from '@/services/navigation'
import { LogOutIcon } from 'lucide-react'

interface NavigationTabProps {
  value: string
  currentTab: string
  children: React.ReactNode
  onClick?: () => void
}

function NavigationTab({ value, currentTab, children, onClick }: NavigationTabProps) {
  const isActive = currentTab === value;
  return (
    <TabsTrigger
      value={value}
      className={cn(
        'relative cursor-pointer text-lg font-semibold px-6 py-2 rounded-full transition-colors',
        'text-white/80 hover:text-primary',
        isActive && 'bg-purple-900/20 text-white',
        !isActive && 'bg-black/40',
        'mx-1',
      )}
      style={{ fontFamily: '"Playfair Display", serif' }}
      onClick={onClick}
    >
      {children}
      {isActive && (
        <div className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
            <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
            <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
            <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
          </div>
        </div>
      )}
    </TabsTrigger>
  );
}

function TabsNavigation() {
  const currentTab = useSettingsStore.use.currentTab()
  const setCurrentTab = useSettingsStore.use.setCurrentTab()
  const { t } = useTranslation()

  return (
    <div className="flex h-8 self-center">
      <TabsList className="h-full gap-2 bg-transparent shadow-none p-0">
        <NavigationTab value="support" currentTab={currentTab} onClick={() => setCurrentTab('support')}>
          Supporting Document Retrieval
        </NavigationTab>
        <NavigationTab value="process-walkthrough" currentTab={currentTab} onClick={() => setCurrentTab('process-walkthrough')}>
          Process Walkthrough Library
        </NavigationTab>
        <NavigationTab value="audit-queries" currentTab={currentTab} onClick={() => setCurrentTab('audit-queries')}>
          Audit Query Assistant
        </NavigationTab>
        <NavigationTab value="audit-co-pilot" currentTab={currentTab} onClick={() => setCurrentTab('audit-co-pilot')}>
          Audit Co-Pilot
        </NavigationTab>
        {/* <NavigationTab value="knowledge-graph" currentTab={currentTab} onClick={() => setCurrentTab('knowledge-graph')}>
          Data Connections
        </NavigationTab> */}
      </TabsList>
    </div>
  )
}

export default function SiteHeader() {
  const { t } = useTranslation()
  const { isGuestMode, username } = useAuthStore()

  const handleLogout = () => {
    navigationService.navigateToLogin();
  }

  return (
    <header className='fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-black/80 shadow-md backdrop-blur-lg'>
      {/* Logo far left */}
      <div className='flex items-center'>
        <a href={webuiPrefix} className='flex items-center gap-2'>
          <img
            src='https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/Augentik%20Logo.png'
            alt='Augentik Logo'
            className='w-20 h-20 mr-6 object-contain'
            style={{ minWidth: 80, minHeight: 80, maxWidth: 120, maxHeight: 120 }}
          />
          <span className='font-bold md:inline-block text-white text-2xl' style={{ fontFamily: "'Playfair Display', serif" }}>Augentik</span>
        </a>
        <div className='flex items-center'>
          <span className='mx-1 text-xs text-gray-400'>|</span>
          <span className='font-medium text-lg cursor-default text-white' style={{ fontFamily: '\'Playfair Display\', serif' }}>
            Client Side Audit Management
          </span>
        </div>
      </div>

      {/* Center nav tabs */}
      <div className='flex h-10 flex-1 items-center justify-center'>
        <TabsNavigation />
        {isGuestMode && (
          <div className='ml-2 self-center px-2 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded-md'>
            {t('login.guestMode', 'Guest Mode')}
          </div>
        )}
      </div>

      {/* Right side settings and logout */}
      <div className='flex items-center gap-2'>
        <AppSettings />
        {!isGuestMode && (
          <Button
            variant='ghost'
            size='icon'
            side='bottom'
            tooltip={`${t('header.logout')} (${username})`}
            onClick={handleLogout}
          >
            <LogOutIcon className='size-4 text-white' aria-hidden='true' />
          </Button>
        )}
      </div>
    </header>
  )
}
