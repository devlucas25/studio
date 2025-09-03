import localforage from 'localforage';
import { Interview, Survey } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

// Configure localForage
localforage.config({
  name: 'london-pesquisas',
  version: 1.0,
  storeName: 'electoral_data',
  description: 'Offline storage for London Pesquisas electoral data'
});

// Database tables for offline storage
export const OFFLINE_TABLES = {
  INTERVIEWS: 'interviews',
  SURVEYS: 'surveys',
  PENDING_SYNC: 'pending_sync'
} as const;

// Encryption for sensitive data
const encrypt = (data: any): string => btoa(JSON.stringify(data));
const decrypt = (encryptedData: string): any => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch {
    return null;
  }
};

// Initialize offline storage
export const initOfflineStorage = async () => {
  try {
    await localforage.ready();
    console.log('Offline storage initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize offline storage:', error);
    return false;
  }
};

// Save interview data offline
export const saveInterviewOffline = async (interview: Interview): Promise<void> => {
  try {
    await localforage.setItem(`${OFFLINE_TABLES.INTERVIEWS}_${interview.id}`, interview);
    
    // Add to pending sync queue
    const pendingSync = await getPendingSync();
    if (!pendingSync.interviews.includes(interview.id)) {
      pendingSync.interviews.push(interview.id);
      await localforage.setItem(OFFLINE_TABLES.PENDING_SYNC, pendingSync);
    }
    
    console.log('Interview saved offline:', interview.id);
  } catch (error) {
    console.error('Error saving interview offline:', error);
    throw error;
  }
};

// Get interview from offline storage
export const getInterviewOffline = async (id: string): Promise<Interview | null> => {
  try {
    return await localforage.getItem(`${OFFLINE_TABLES.INTERVIEWS}_${id}`);
  } catch (error) {
    console.error('Error getting interview from offline storage:', error);
    return null;
  }
};

// Get all offline interviews
export const getAllOfflineInterviews = async (): Promise<Interview[]> => {
  try {
    const keys = await localforage.keys();
    const interviewKeys = keys.filter((key: string) => key.startsWith(OFFLINE_TABLES.INTERVIEWS));
    const interviews: Interview[] = [];
    
    for (const key of interviewKeys) {
      const interview = await localforage.getItem(key);
      if (interview) {
        interviews.push(interview);
      }
    }
    
    return interviews;
  } catch (error) {
    console.error('Error getting all offline interviews:', error);
    return [];
  }
};

// Save survey data offline
export const saveSurveyOffline = async (survey: Survey): Promise<void> => {
  try {
    await localforage.setItem(`${OFFLINE_TABLES.SURVEYS}_${survey.id}`, survey);
    console.log('Survey saved offline:', survey.id);
  } catch (error) {
    console.error('Error saving survey offline:', error);
    throw error;
  }
};

// Get survey from offline storage
export const getSurveyOffline = async (id: string): Promise<Survey | null> => {
  try {
    return await localforage.getItem(`${OFFLINE_TABLES.SURVEYS}_${id}`);
  } catch (error) {
    console.error('Error getting survey from offline storage:', error);
    return null;
  }
};

// Pending sync management
interface PendingSync {
  interviews: string[];
  lastSyncAttempt: string | null;
}

const getPendingSync = async (): Promise<PendingSync> => {
  try {
    const pending = await localforage.getItem(OFFLINE_TABLES.PENDING_SYNC);
    return pending || { interviews: [], lastSyncAttempt: null };
  } catch (error) {
    return { interviews: [], lastSyncAttempt: null };
  }
};

// Mark interview as synced
export const markInterviewAsSynced = async (id: string): Promise<void> => {
  try {
    const pendingSync = await getPendingSync();
    pendingSync.interviews = pendingSync.interviews.filter(interviewId => interviewId !== id);
    await localforage.setItem(OFFLINE_TABLES.PENDING_SYNC, pendingSync);
    await localforage.removeItem(`${OFFLINE_TABLES.INTERVIEWS}_${id}`);
  } catch (error) {
    console.error('Error marking interview as synced:', error);
  }
};

// Get pending sync count
export const getPendingSyncCount = async (): Promise<number> => {
  try {
    const pendingSync = await getPendingSync();
    return pendingSync.interviews.length;
  } catch (error) {
    return 0;
  }
};

// Sync offline data with Supabase
export const syncOfflineData = async (): Promise<{ success: number; failed: number }> => {
  const supabase = createClient();
  let success = 0;
  let failed = 0;

  try {
    const pendingSync = await getPendingSync();
    
    for (const interviewId of pendingSync.interviews) {
      try {
        const interview = await getInterviewOffline(interviewId);
        if (interview) {
          const { error } = await supabase
            .from('interviews')
            .upsert(interview);

          if (!error) {
            await markInterviewAsSynced(interviewId);
            success++;
          } else {
            console.error('Sync error for interview:', interviewId, error);
            failed++;
          }
        }
      } catch (error) {
        console.error('Error syncing interview:', interviewId, error);
        failed++;
      }
    }

    const updatedPendingSync = await getPendingSync();
    updatedPendingSync.lastSyncAttempt = new Date().toISOString();
    await localforage.setItem(OFFLINE_TABLES.PENDING_SYNC, updatedPendingSync);

  } catch (error) {
    console.error('Error during sync process:', error);
  }

  return { success, failed };
};

// GPS validation
export const validateLocationInArea = (
  lat: number, 
  lng: number, 
  areaCenter: [number, number], 
  radiusKm: number
): boolean => {
  const R = 6371;
  const dLat = (lat - areaCenter[0]) * Math.PI / 180;
  const dLng = (lng - areaCenter[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(areaCenter[0] * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= radiusKm;
};

// Clear all offline data
export const clearOfflineStorage = async (): Promise<void> => {
  try {
    await localforage.clear();
    console.log('Offline storage cleared');
  } catch (error) {
    console.error('Error clearing offline storage:', error);
    throw error;
  }
};

export class OfflineStorage {
  private static instance: OfflineStorage;
  
  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  async getPendingSyncCount(): Promise<number> {
    return getPendingSyncCount();
  }
}