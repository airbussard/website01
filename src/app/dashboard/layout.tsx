'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      router.replace('/auth/login?redirect=/dashboard');

      // Fallback: Nach 2 Sekunden hart redirecten falls Next.js Router hängt
      const timeout = setTimeout(() => {
        window.location.href = '/auth/login?redirect=/dashboard';
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [user, loading, router, isRedirecting]);

  if (loading || (!user && isRedirecting)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">
            {loading ? 'Lade Dashboard...' : 'Weiterleitung zur Anmeldung...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Sollte nie erreicht werden, aber als Fallback
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?redirect=/dashboard';
    }
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
