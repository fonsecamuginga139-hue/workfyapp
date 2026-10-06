import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { supabase } from './integrations/supabase/client';
import { User } from './types';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPages';
import { Dashboard } from './components/Dashboard';
import { OnboardingNewBiosite } from './components/OnboardingNewBiosite';
import { BiositeEditor } from './components/BiositeEditor';
import { AnalyticsView } from './components/AnalyticsView';
import { PublicBiositePage } from './components/PublicBiositePage';
import { SettingsPage } from './components/SettingsPage';

function resolveCurrentPath(): string {
  const pathname = window.location.pathname || '';
  if (pathname && pathname !== '/') {
    return pathname;
  }

  // Check URL search parameters (?b=slug or ?slug=slug)
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const bQuery = searchParams.get('b') || searchParams.get('slug');
    if (bQuery) {
      return `/b/${bQuery}`;
    }
  } catch {
    // ignore
  }

  // Check Hash fallback (#/b/slug or #b=slug)
  const hash = window.location.hash || '';
  if (hash) {
    const cleanHash = hash.replace(/^#/, '');
    if (cleanHash.startsWith('/')) {
      return cleanHash;
    }
    if (cleanHash.startsWith('b=')) {
      return `/b/${cleanHash.slice(2)}`;
    }
  }

  return pathname || '/';
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => resolveCurrentPath());
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    StorageService.loadSession().then((u) => {
      if (!active) return;
      setUser(u);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // defer to avoid deadlocks inside the auth callback
        setTimeout(() => {
          StorageService.loadSession().then((u) => active && setUser(u));
        }, 0);
      }
    });
    const unsub = StorageService.subscribe(() => setUser(StorageService.getCurrentUser()));

    const handleLocationChange = () => setCurrentPath(resolveCurrentPath());
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      active = false;
      sub.subscription.unsubscribe();
      unsub();
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await StorageService.logout();
    setUser(null);
    navigate('/');
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#155EEF] border-t-transparent" />
      </div>
    );
  }

  // 1. Check for public biosite route: /b/:slug
  const biositeMatch = currentPath.match(/^\/b\/([^/?#]+)/i);
  if (biositeMatch) {
    let slug = biositeMatch[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {
      // ignore
    }
    return <PublicBiositePage slug={slug.trim()} onNavigate={navigate} />;
  }

  // 2. Editor route: /dashboard/biosites/:id/editor
  const editorMatch = currentPath.match(/^\/dashboard\/biosites\/([a-zA-Z0-9_-]+)\/editor/);
  if (editorMatch) {
    if (!user) {
      return <AuthPage mode="login" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
    }
    const biositeId = editorMatch[1];
    return <BiositeEditor biositeId={biositeId} onNavigate={navigate} />;
  }

  // 3. Analytics route: /dashboard/biosites/:id/analytics
  const analyticsMatch = currentPath.match(/^\/dashboard\/biosites\/([a-zA-Z0-9_-]+)\/analytics/);
  if (analyticsMatch) {
    if (!user) {
      return <AuthPage mode="login" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
    }
    const biositeId = analyticsMatch[1];
    return <AnalyticsView biositeId={biositeId} onNavigate={navigate} />;
  }

  // 4. Onboarding new biosite route: /dashboard/biosites/new
  if (currentPath === '/dashboard/biosites/new') {
    if (!user) {
      return <AuthPage mode="login" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
    }
    return (
      <OnboardingNewBiosite
        userId={user.id}
        onFinished={(newBiositeId) => navigate(`/dashboard/biosites/${newBiositeId}/editor`)}
        onCancel={() => navigate('/dashboard')}
      />
    );
  }

  // 5. Dashboard routes
  if (
    currentPath === '/dashboard' ||
    currentPath === '/dashboard/biosites' ||
    currentPath === '/dashboard/manager' ||
    currentPath === '/dashboard/inbox'
  ) {
    if (!user) {
      return <AuthPage mode="login" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
    }
    const initialTab =
      currentPath === '/dashboard/manager'
        ? 'manager'
        : currentPath === '/dashboard/inbox'
        ? 'inbox'
        : 'biosites';

    return (
      <Dashboard
        user={user}
        onNavigate={navigate}
        onLogout={handleLogout}
        initialTab={initialTab}
      />
    );
  }

  // 6. Settings route: /settings
  if (currentPath === '/settings') {
    if (!user) {
      return <AuthPage mode="login" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
    }
    return <SettingsPage user={user} onNavigate={navigate} onLogout={handleLogout} />;
  }

  // 7. Auth routes: /login and /signup
  if (currentPath === '/login') {
    return <AuthPage mode="login" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
  }

  if (currentPath === '/signup') {
    return <AuthPage mode="signup" onSuccess={handleAuthSuccess} onNavigate={navigate} />;
  }

  // Default: Landing Page (/)
  return <LandingPage onNavigate={navigate} />;
}
