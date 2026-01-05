import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Gallery } from './components/Gallery';
import { ActivityFeed } from './components/ActivityFeed';
import { useUserStore } from './store/useUserStore';
import { UserCircle, AlertTriangle } from 'lucide-react';
import { isConfigured } from './config/instant';
import { FocusedImageView } from './components/FocusedImageView';
import { AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient();

function App() {
  const { username, color, selectedImage, setSelectedImage } = useUserStore();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
        {/* Config Warning */}
        {!isConfigured && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 py-2">
            <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-amber-500 text-xs font-medium uppercase tracking-wider">
              <AlertTriangle size={14} />
              <span>InstantDB App ID missing or invalid. Real-time features disabled.</span>
            </div>
          </div>
        )}
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              PicSync
            </h1>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <UserCircle size={20} style={{ color }} />
              <span className="text-sm font-medium">{username}</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Gallery Section */}
          <section className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-6">Explore Gallery</h2>
            <Gallery />
          </section>

          {/* Feed Section (Real-Time) */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Live Activity</h2>
              <ActivityFeed />
            </div>
          </aside>
        </main>

        {/* Global Modal */}
        <AnimatePresence>
          {selectedImage && (
            <FocusedImageView
              image={selectedImage}
              onClose={() => setSelectedImage(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </QueryClientProvider>
  );
}

export default App;
