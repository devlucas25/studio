import { createClient } from './supabase/client'
import { OfflineStorage, OfflineInterview } from './offline-storage'

export class SyncService {
  private static instance: SyncService
  private supabase = createClient()
  private offlineStorage = OfflineStorage.getInstance()

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  async syncPendingInterviews(): Promise<{ success: number; failed: number }> {
    const pendingInterviews = await this.offlineStorage.getAllInterviews()
    const completedInterviews = pendingInterviews.filter(
      interview => interview.status === 'completed'
    )

    let success = 0
    let failed = 0

    for (const interview of completedInterviews) {
      try {
        await this.uploadInterview(interview)
        await this.offlineStorage.deleteInterview(interview.id)
        success++
      } catch (error) {
        console.error('Failed to sync interview:', error)
        failed++
      }
    }

    return { success, failed }
  }

  private async uploadInterview(interview: OfflineInterview): Promise<void> {
    const { error } = await this.supabase
      .from('interviews')
      .insert({
        id: interview.id,
        survey_id: interview.surveyId,
        answers: interview.answers,
        latitude: interview.location?.lat,
        longitude: interview.location?.lng,
        accuracy: interview.location?.accuracy,
        status: 'submitted',
        is_offline: true,
        offline_synced: true,
        created_at: new Date(interview.timestamp).toISOString()
      })

    if (error) throw error
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine
  }

  startAutoSync(): void {
    // Sync when coming back online
    window.addEventListener('online', () => {
      this.syncPendingInterviews()
    })

    // Periodic sync every 5 minutes when online
    setInterval(async () => {
      if (await this.isOnline()) {
        this.syncPendingInterviews()
      }
    }, 5 * 60 * 1000)
  }
}