"use client";

import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, CheckCircle, Clock } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { useEffect, useState } from 'react';
import { getPendingSyncCount } from '@/lib/offline-storage';

export function ConnectionStatus() {
  const { isOnline } = usePWA();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    };

    updatePendingCount();
    
    // Update every 30 seconds
    const interval = setInterval(updatePendingCount, 30000);
    return () => clearInterval(interval);
  }, [isOnline]);

  if (isOnline && pendingCount === 0) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="mr-2 h-4 w-4" />
        Online
      </Badge>
    );
  }

  if (isOnline && pendingCount > 0) {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="mr-2 h-4 w-4" />
        Sincronizando ({pendingCount})
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
      <WifiOff className="mr-2 h-4 w-4" />
      Offline {pendingCount > 0 && `(${pendingCount} pendentes)`}
    </Badge>
  );
}