/*
  Utility helpers to load Klaviyo's onsite script on demand and interact with it safely
*/

declare global {
  interface Window {
    _klOnsite?: any[]
  }
}

export const loadKlaviyoScript = (publicApiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!publicApiKey) {
      reject(new Error('Klaviyo public API key is missing'))
      return
    }

    // Ensure onsite queue exists
    window._klOnsite = window._klOnsite || []

    // If a Klaviyo script is already present, assume it's loading/loaded
    const existing = document.querySelector(
      'script[src*="static.klaviyo.com/onsite/js/klaviyo.js"]'
    ) as HTMLScriptElement | null

    if (existing) {
      if ((existing as any)._klReady) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Klaviyo script')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${encodeURIComponent(publicApiKey)}`
    ;(script as any)._klReady = false
    script.onload = () => {
      ;(script as any)._klReady = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Klaviyo script'))
    document.head.appendChild(script)
  })
}

export const ensureKlaviyoFormEmbedded = (formId: string): void => {
  // Ensure the container has the expected attributes; Klaviyo auto-embeds by scanning the DOM
  const container = document.querySelector(`.klaviyo-form-${formId}`) as HTMLElement | null
  if (container) {
    container.setAttribute('data-klaviyo-form-id', formId)
  }
  // Klaviyo should auto-embed when the script loads and the container is present.
}


