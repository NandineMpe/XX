import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/state'
import { toast } from 'sonner'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error('Please enter both username and password')
      return
    }

    // Check hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
      try {
        setLoading(true)
        
        // Create a token for the authenticated user
        const authToken = 'auth-token-' + Date.now()
        
        // Set up authentication
        login(authToken, false, null, null, 'Augentik Dashboard', 'Audit Intelligence Platform')
        
        // Set session flag for version check
        sessionStorage.setItem('VERSION_CHECKED_FROM_LOGIN', 'true')
        
        // Show success message
        toast.success('Login successful! Welcome to Augentik.')
        
        // Navigate to dashboard
        navigate('/app')
      } catch (error) {
        console.error('Login failed:', error)
        toast.error('Login failed. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      toast.error('Invalid credentials. Use admin/admin123')
    }
  }

  const handleReset = () => {
    setUsername('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <style>{`
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-left: 2em;
          padding-right: 2em;
          padding-bottom: 0.4em;
          background-color: #171717;
          border-radius: 25px;
          transition: .4s ease-in-out;
        }

        .login-form:hover {
          transform: scale(1.05);
          border: 1px solid black;
        }

        .login-heading {
          text-align: center;
          margin: 2em;
          color: rgb(255, 255, 255);
          font-size: 1.2em;
        }

        .login-field {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5em;
          border-radius: 25px;
          padding: 0.6em;
          border: none;
          outline: none;
          color: white;
          background-color: #171717;
          box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
        }

        .login-input-icon {
          height: 1.3em;
          width: 1.3em;
          fill: white;
        }

        .login-input-field {
          background: none;
          border: none;
          outline: none;
          width: 100%;
          color: #d3d3d3;
        }

        .login-btn {
          display: flex;
          justify-content: center;
          flex-direction: row;
          margin-top: 2.5em;
        }

        .login-button1 {
          padding: 0.5em;
          padding-left: 1.1em;
          padding-right: 1.1em;
          border-radius: 5px;
          margin-right: 0.5em;
          border: none;
          outline: none;
          transition: .4s ease-in-out;
          background-color: #252525;
          color: white;
          cursor: pointer;
        }

        .login-button1:hover {
          background-color: black;
          color: white;
        }

        .login-button1:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-button2 {
          padding: 0.5em;
          padding-left: 2.3em;
          padding-right: 2.3em;
          border-radius: 5px;
          border: none;
          outline: none;
          transition: .4s ease-in-out;
          background-color: #252525;
          color: white;
          cursor: pointer;
        }

        .login-button2:hover {
          background-color: black;
          color: white;
        }

        .login-button2:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-button3 {
          margin-bottom: 3em;
          padding: 0.5em;
          border-radius: 5px;
          border: none;
          outline: none;
          transition: .4s ease-in-out;
          background-color: #252525;
          color: white;
          cursor: pointer;
        }

        .login-button3:hover {
          background-color: red;
          color: white;
        }

        .login-logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1em;
        }

        .login-logo {
          height: 4em;
          width: auto;
        }
      `}</style>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="login-logo-container">
          <img 
            src="https://cvjdrblhcif4qupj.public.blob.vercel-storage.com/agentic%20logo-czxgzNbq2lmA1WMRnfeJzd16ZelMFs.png" 
            alt="Agentic Logo" 
            className="login-logo"
          />
        </div>
        
        <p className="login-heading">Login to Augentik</p>
        
        <div className="login-field">
          <svg className="login-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
          </svg>
          <input 
            autoComplete="off" 
            placeholder="Username" 
            className="login-input-field" 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="login-field">
          <svg className="login-input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
          </svg>
          <input 
            placeholder="Password" 
            className="login-input-field" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="login-btn">
          <button 
            className="login-button1" 
            type="button" 
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>
          <button 
            className="login-button2" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
        
        <button 
          className="login-button3" 
          type="button"
          onClick={() => {
            toast.info('Demo Credentials: admin / admin123')
          }}
        >
          Show Demo Credentials
        </button>
      </form>
    </div>
  )
}

export default LoginPage
