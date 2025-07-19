import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/state'
import { loginToServer } from '@/api/lightrag'
import { toast } from 'sonner'
import { SignInPage } from '@/components/ui/sign-in';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Real sign-in handler: authenticates with backend
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    if (!username) {
      toast.error('Please enter your username.');
      return;
    }
    if (!password) {
      toast.error('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      const resp = await loginToServer(username, password);
      login(
        resp.access_token,
        false, // not guest
        resp.core_version,
        resp.api_version,
        resp.webui_title || null,
        resp.webui_description || null
      );
      window.location.href = 'https://lightrag-production-71c6.up.railway.app/webui/';
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <SignInPage
        title={<span className="font-light text-foreground tracking-tighter">Sign in to Augentik</span>}
        description="Access your account and continue your journey with us"
        onSignIn={handleSignIn}
      />
    </div>
  );
};

export default LoginPage;
