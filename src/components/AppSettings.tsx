import { useState, useCallback } from 'react'
import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { backendBaseUrl } from '@/lib/constants'
import { useSettingsStore } from '@/stores/settings'
import NumberInput from '@/components/ui/NumberInput'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/Select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import { useNavigate } from 'react-router-dom';
import QuerySettings from '@/components/retrieval/QuerySettings';

interface AppSettingsProps {
  className?: string
  asPage?: boolean
}

export default function AppSettings({ className, asPage }: AppSettingsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation()

  const language = useSettingsStore.use.language()
  const setLanguage = useSettingsStore.use.setLanguage()

  const theme = useSettingsStore.use.theme()
  const setTheme = useSettingsStore.use.setTheme()

  const querySettings = useSettingsStore((state) => state.querySettings)
  const updateQuerySettings = useSettingsStore.use.updateQuerySettings()

  const handleLanguageChange = useCallback((value: string) => {
    setLanguage(value as 'en' | 'zh' | 'fr' | 'ar' | 'zh_TW')
  }, [setLanguage])

  const handleThemeChange = useCallback((value: string) => {
    setTheme(value as 'light' | 'dark' | 'system')
  }, [setTheme])

  const handleQuerySetting = useCallback((key, value) => {
    updateQuerySettings({ [key]: value })
  }, [updateQuerySettings])

  if (asPage) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">{t('settings.title', 'Settings')}</h2>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium">{t('settings.language')}</label>
            <select
              className="block w-full mt-1 border rounded p-2"
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="zh_TW">繁體中文</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">{t('settings.theme')}</label>
            <select
              className="block w-full mt-1 border rounded p-2"
              value={theme}
              onChange={e => handleThemeChange(e.target.value)}
            >
              <option value="light">{t('settings.light')}</option>
              <option value="dark">{t('settings.dark')}</option>
              <option value="system">{t('settings.system')}</option>
            </select>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('settings.retrievalSettings', 'Retrieval & Query Settings')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Query Mode */}
              <div>
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.queryMode')}</label>
                <Select
                  value={querySettings.mode}
                  onValueChange={v => handleQuerySetting('mode', v)}
                >
                  <SelectTrigger className="mt-1" id="query_mode_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="naive">{t('retrievePanel.querySettings.queryModeOptions.naive')}</SelectItem>
                      <SelectItem value="local">{t('retrievePanel.querySettings.queryModeOptions.local')}</SelectItem>
                      <SelectItem value="global">{t('retrievePanel.querySettings.queryModeOptions.global')}</SelectItem>
                      <SelectItem value="hybrid">{t('retrievePanel.querySettings.queryModeOptions.hybrid')}</SelectItem>
                      <SelectItem value="mix">{t('retrievePanel.querySettings.queryModeOptions.mix')}</SelectItem>
                      <SelectItem value="bypass">{t('retrievePanel.querySettings.queryModeOptions.bypass')}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* Response Format */}
              <div>
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.responseFormat')}</label>
                <Select
                  value={querySettings.response_type}
                  onValueChange={v => handleQuerySetting('response_type', v)}
                >
                  <SelectTrigger className="mt-1" id="response_format_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Multiple Paragraphs">{t('retrievePanel.querySettings.responseFormatOptions.multipleParagraphs')}</SelectItem>
                      <SelectItem value="Single Paragraph">{t('retrievePanel.querySettings.responseFormatOptions.singleParagraph')}</SelectItem>
                      <SelectItem value="Bullet Points">{t('retrievePanel.querySettings.responseFormatOptions.bulletPoints')}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* Top K */}
              <div>
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.topK')}</label>
                <NumberInput
                  id="top_k"
                  stepper={1}
                  value={querySettings.top_k}
                  onValueChange={v => handleQuerySetting('top_k', v)}
                  min={1}
                  placeholder={t('retrievePanel.querySettings.topKPlaceholder')}
                />
              </div>
              {/* Max Tokens for Text Unit */}
              <div>
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.maxTokensTextUnit')}</label>
                <NumberInput
                  id="max_token_for_text_unit"
                  stepper={500}
                  value={querySettings.max_token_for_text_unit}
                  onValueChange={v => handleQuerySetting('max_token_for_text_unit', v)}
                  min={1}
                  placeholder={t('retrievePanel.querySettings.maxTokensTextUnit')}
                />
              </div>
              {/* Max Tokens for Global Context */}
              <div>
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.maxTokensGlobalContext')}</label>
                <NumberInput
                  id="max_token_for_global_context"
                  stepper={500}
                  value={querySettings.max_token_for_global_context}
                  onValueChange={v => handleQuerySetting('max_token_for_global_context', v)}
                  min={1}
                  placeholder={t('retrievePanel.querySettings.maxTokensGlobalContext')}
                />
              </div>
              {/* Max Tokens for Local Context */}
              <div>
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.maxTokensLocalContext')}</label>
                <NumberInput
                  id="max_token_for_local_context"
                  stepper={500}
                  value={querySettings.max_token_for_local_context}
                  onValueChange={v => handleQuerySetting('max_token_for_local_context', v)}
                  min={1}
                  placeholder={t('retrievePanel.querySettings.maxTokensLocalContext')}
                />
              </div>
              {/* History Turns */}
              <div>
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.historyTurns')}</label>
                <NumberInput
                  id="history_turns"
                  stepper={1}
                  value={querySettings.history_turns}
                  onValueChange={v => handleQuerySetting('history_turns', v)}
                  min={0}
                  placeholder={t('retrievePanel.querySettings.historyTurnsPlaceholder')}
                />
              </div>
              {/* User Prompt */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.userPrompt')}</label>
                <Input
                  id="user_prompt"
                  value={querySettings.user_prompt || ''}
                  onChange={e => handleQuerySetting('user_prompt', e.target.value)}
                  placeholder={t('retrievePanel.querySettings.userPromptPlaceholder')}
                />
              </div>
              {/* Stream */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Checkbox
                    checked={!!querySettings.stream}
                    onCheckedChange={v => handleQuerySetting('stream', !!v)}
                    id="stream"
                  />
                  {t('retrievePanel.querySettings.stream')}
                </label>
              </div>
              {/* Only Need Context */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Checkbox
                    checked={!!querySettings.only_need_context}
                    onCheckedChange={v => handleQuerySetting('only_need_context', !!v)}
                    id="only_need_context"
                  />
                  {t('retrievePanel.querySettings.onlyNeedContext')}
                </label>
              </div>
              {/* Only Need Prompt */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Checkbox
                    checked={!!querySettings.only_need_prompt}
                    onCheckedChange={v => handleQuerySetting('only_need_prompt', !!v)}
                    id="only_need_prompt"
                  />
                  {t('retrievePanel.querySettings.onlyNeedPrompt')}
                </label>
              </div>
              {/* Highlighted Keywords */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.hlKeywords')}</label>
                <Input
                  id="hl_keywords"
                  value={Array.isArray(querySettings.hl_keywords) ? querySettings.hl_keywords.join(', ') : ''}
                  onChange={e => handleQuerySetting('hl_keywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder={t('retrievePanel.querySettings.hlKeywordsPlaceholder')}
                />
              </div>
              {/* Low-Level Keywords */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">{t('retrievePanel.querySettings.llKeywords')}</label>
                <Input
                  id="ll_keywords"
                  value={Array.isArray(querySettings.ll_keywords) ? querySettings.ll_keywords.join(', ') : ''}
                  onChange={e => handleQuerySetting('ll_keywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder={t('retrievePanel.querySettings.llKeywordsPlaceholder')}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Add Query Parameters Section */}
        {asPage && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Query Parameters</h3>
            <div className="max-w-md">
              <QuerySettings />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Instead of opening a modal, navigate to /settings
  return (
    <button
      className={cn('h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent', className)}
      onClick={() => { window.location.hash = '#/settings'; }}
      aria-label={t('settings.openSettings', 'Open Settings')}
    >
      <Settings className="h-5 w-5" />
    </button>
  )
}
