"use client";

import { offlineStore } from "./offline-store";

export class BackgroundSyncManager {
  private isSyncing = false;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.syncQueuedActions());
    }
  }

  /**
   * Synchronizes queued offline actions with the NestJS backend upon network reconnection.
   */
  async syncQueuedActions(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const actions = await offlineStore.getQueuedActions();
      if (actions.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[BackgroundSync] Reconnected! Syncing ${actions.length} offline actions...`);

      for (const action of actions) {
        try {
          // Send queued action to backend API
          const response = await fetch("/api/v1/sync/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action),
          });

          if (response.ok || response.status === 404) {
            await offlineStore.clearAction(action.id);
            console.log(`[BackgroundSync] Successfully synced & cleared action [${action.id}]`);
          }
        } catch (err) {
          console.log(`[BackgroundSync] Failed to sync action [${action.id}], will retry next reconnect:`, err);
        }
      }
    } catch (err) {
      console.log("[BackgroundSync] Sync process error:", err);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const backgroundSync = new BackgroundSyncManager();
