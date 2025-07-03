import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/state'
import { getAuthStatus } from '@/api/lightrag'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2 } from 'lucide-react'
import Spline from '@splinetool/react-spline'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const authCheckRef = useRef(false); // Prevent duplicate calls in Vite dev mode

  useEffect(() => {
    console.log('LoginPage mounted')
  }, []);

  // Check if authentication is configured, skip login if not
  useEffect(() => {

    const checkAuthConfig = async () => {
      // Prevent duplicate calls in Vite dev mode
      if (authCheckRef.current) {
        return;
      }
      authCheckRef.current = true;

      try {
        // If already authenticated, redirect to home
        if (isAuthenticated) {
          navigate('/')
          return
        }

        // Check auth status
        const status = await getAuthStatus()

        // Set session flag for version check to avoid duplicate checks in App component
        if (status.core_version || status.api_version) {
          sessionStorage.setItem('VERSION_CHECKED_FROM_LOGIN', 'true');
        }

        if (!status.auth_configured && status.access_token) {
          // If auth is not configured, use the guest token and redirect
          login(status.access_token, true, status.core_version, status.api_version, status.webui_title || null, status.webui_description || null)
          if (status.message) {
            toast.info(status.message)
          }
          navigate('/')
          return
        }

        // Only set checkingAuth to false if we need to show the login page
        setCheckingAuth(false);

      } catch (error) {
        console.error('Failed to check auth configuration:', error)
        // Also set checkingAuth to false in case of error
        setCheckingAuth(false);
      }
      // Removed finally block as we're setting checkingAuth earlier
    }

    // Execute immediately
    checkAuthConfig()

    // Cleanup function to prevent state updates after unmount
    return () => {
    }
  }, [isAuthenticated, login, navigate])

  // Don't render anything while checking auth
  if (checkingAuth) {
    return null
  }

  const handleContinueToDashboard = async () => {
    try {
      setLoading(true)
      
      // Create a guest token for demo purposes
      const guestToken = 'guest-token-' + Date.now()
      
      // Set up guest authentication
      login(guestToken, true, '1.0.0', '1.0.0', 'Augentik Dashboard', 'Legal Document Analysis Platform')
      
      // Set session flag for version check
      sessionStorage.setItem('VERSION_CHECKED_FROM_LOGIN', 'true')
      
      // Show success message
      toast.success('Welcome to Augentik Dashboard!')
      
      // Navigate to dashboard
      navigate('/app')
    } catch (error) {
      console.error('Navigation failed:', error)
      toast.error('Failed to access dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Full Screen Spline Animation */}
        <div className="hidden lg:block fixed inset-0 w-1/2">
          <Spline 
            scene="https://cvjdrblhcif4qupj.public.blob.vercel-storage.com/Agentik/clarity_stream-0VzBbd4AYCXvjq8CdNjqeLA3KZ1OfS.spline"
            className="w-full h-full"
          />
        </div>
        
        {/* Right side - Login Form */}
        <div className="flex justify-center ml-auto w-full lg:w-1/2 min-h-screen bg-gray-900/80 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 m-auto">
            <CardHeader className="space-y-4">
              <div className="flex flex-col items-center">
                <img 
                  src="https://cvjdrblhcif4qupj.public.blob.vercel-storage.com/Augentik%20Logo-CDcsVmjbPnbL0nC7CFyGAtKNwc0f6U.png" 
                  alt="Augentik Logo" 
                  className="h-16 w-auto mb-4"
                />
                <CardTitle className="text-2xl font-bold text-center">
                  {t('login.welcome')}
                </CardTitle>
                <CardDescription className="text-center">
                  {t('login.subtitle')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-gray-300">
                    Welcome to Augentik Dashboard
                  </p>
                  <p className="text-sm text-gray-400">
                    No credentials required for demo access
                  </p>
                </div>
                <Button
                  onClick={handleContinueToDashboard}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/20"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accessing Dashboard...
                    </>
                  ) : (
                    <>
                      <span>Continue to Dashboard</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-2"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 text-gray-400">
                    {t('login.orContinueWith')}{/* Changed from 'or' to 'orContinueWith' */}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button
                  variant="outline"
                  type="button"
                  disabled={loading}
                  className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={loading}
                  className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  Facebook
                </Button>
              </div>
              <p className="text-center text-sm text-gray-400">
                {t('login.noAccount')}{' '}
                <Link to="/register" className="text-emerald-400 hover:underline">
                  {t('login.signUp')}{/* Changed from 'signUp' to 'signUp' */}
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Back to landing link */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to home
      </Link>
    </div>
  )
}

export default LoginPage
