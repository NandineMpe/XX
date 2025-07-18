import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/state'
import { useSettingsStore } from '@/stores/settings'
import { loginToServer, getAuthStatus } from '@/api/lightrag'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ZapIcon } from 'lucide-react'
import AppSettings from '@/components/AppSettings'
import './LoginPage.css'; // Import the new CSS (to be created)
import { SignInPage } from '@/components/ui/sign-in';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Dummy sign-in handler: logs in as guest, no credentials required
  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Simulate guest login (no credentials required)
    login('guest-token', true, 'core-version', 'api-version', 'Augentik', '');
    navigate('/');
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
