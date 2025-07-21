import AppSettings from '@/components/AppSettings';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-stretch justify-start py-0">
      <div className="w-full h-full bg-card rounded-none shadow-none p-0 relative flex-1 flex">
        {/* Back Arrow Button */}
        <button
          className="absolute left-8 top-8 p-2 rounded-full hover:bg-accent focus:outline-none z-10"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {/* Render the AppSettings form content as a page, not a modal */}
        <div className="flex-1 flex">
          <AppSettings asPage sidebarClassName="mt-16" />
        </div>
      </div>
    </div>
  );
} 