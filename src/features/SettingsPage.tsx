import AppSettings from '@/components/AppSettings';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start py-12">
      <div className="w-full max-w-2xl bg-card rounded-xl shadow-lg p-8 relative">
        {/* Back Arrow Button */}
        <button
          className="absolute left-4 top-4 p-2 rounded-full hover:bg-accent focus:outline-none"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>
        {/* Render the AppSettings form content as a page, not a modal */}
        <AppSettings asPage />
      </div>
    </div>
  );
} 