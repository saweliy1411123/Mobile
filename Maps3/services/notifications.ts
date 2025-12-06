import * as Notifications from 'expo-notifications';
import { MarkerType } from '../types';

export interface ActiveNotification {
  markerId: number;
  notificationId: string;
  timestamp: number;
}

export class NotificationManager {
  private activeNotifications: Map<number, ActiveNotification>;

  constructor() {
    this.activeNotifications = new Map();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  async requestNotificationPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async showNotification(marker: MarkerType): Promise<string | null> {
    if (this.activeNotifications.has(marker.id)) {
      return this.activeNotifications.get(marker.id)?.notificationId || null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Вы рядом с меткой!",
          body: `Вы находитесь рядом с сохранённой точкой ${marker.id}.`,
        },
        trigger: null
      });

      this.activeNotifications.set(marker.id, {
        markerId: marker.id,
        notificationId,
        timestamp: Date.now()
      });

      return notificationId;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  async removeNotification(markerId: number): Promise<void> {
    const notification = this.activeNotifications.get(markerId);
    if (notification) {
      try {
        await Notifications.dismissNotificationAsync(notification.notificationId);
      } catch (dismissError) {
        console.error('Не удалось скрыть отображаемое уведомление:', dismissError);
      }

      this.activeNotifications.delete(markerId);
    }
  }

  getActiveNotifications(): ActiveNotification[] {
    return Array.from(this.activeNotifications.values());
  }

  hasActiveNotification(markerId: number): boolean {
    return this.activeNotifications.has(markerId);
  }

  clearNotifications(): void {
    this.activeNotifications.clear();
  }

  async updateNotifications(
    nearbyMarkers: { id: number; coordinate: { latitude: number; longitude: number } }[],
    allMarkers: MarkerType[]
  ): Promise<void> {
    const nearbyMarkerIds = new Set(nearbyMarkers.map(m => m.id));
    const allMarkerIds = new Set(allMarkers.map(m => m.id));

    for (const [markerId, notification] of this.activeNotifications.entries()) {
      if (!nearbyMarkerIds.has(markerId) && allMarkerIds.has(markerId)) {
        await this.removeNotification(markerId);
      }
    }

    for (const nearbyMarker of nearbyMarkers) {
      if (!this.hasActiveNotification(nearbyMarker.id)) {
        const fullMarker = allMarkers.find(m => m.id === nearbyMarker.id);
        if (fullMarker) {
          await this.showNotification(fullMarker);
        }
      }
    }
  }
}