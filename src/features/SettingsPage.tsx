import AppSettings from '@/components/AppSettings';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start py-12">
      <div className="w-full max-w-2xl bg-card rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>
        {/* Render the AppSettings form content as a page, not a modal */}
        <AppSettings asPage />
      </div>
    </div>
  );
} 