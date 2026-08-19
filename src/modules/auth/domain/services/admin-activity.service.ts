const ACTIVITY_CHANNEL_NAME = 'cafe-admin-activity-v1';
const SERVER_TOUCH_THROTTLE_MS = 30_000;

let lastActivityAt = Date.now();
let lastServerTouchAt = 0;
let pendingServerTouch = false;
let activityChannel: BroadcastChannel | null = null;
let stopListeners: (() => void) | null = null;

function getActivityChannel(): BroadcastChannel | null {
  if (activityChannel || typeof window === 'undefined' || typeof window.BroadcastChannel === 'undefined') {
    return activityChannel;
  }
  activityChannel = new window.BroadcastChannel(ACTIVITY_CHANNEL_NAME);
  activityChannel.addEventListener('message', (event: MessageEvent<{ type: 'activity'; at: number }>) => {
    if (event.data?.type === 'activity' && Number.isFinite(event.data.at)) {
      lastActivityAt = Math.max(lastActivityAt, event.data.at);
    }
  });
  return activityChannel;
}

export function noteAdminActivity(broadcast = true): void {
  lastActivityAt = Date.now();
  pendingServerTouch = true;
  if (broadcast) {
    getActivityChannel()?.postMessage({ type: 'activity', at: lastActivityAt });
  }
}

export function startAdminActivityTracking(): () => void {
  getActivityChannel();
  if (stopListeners || typeof window === 'undefined') {
    return () => undefined;
  }
  const onActivity = () => noteAdminActivity();
  const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart'];
  events.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
  stopListeners = () => {
    events.forEach((eventName) => window.removeEventListener(eventName, onActivity));
    stopListeners = null;
  };
  return stopListeners;
}

export function consumeAdminActivitySignal(now = Date.now()): boolean {
  if (!pendingServerTouch || now - lastServerTouchAt < SERVER_TOUCH_THROTTLE_MS) {
    return false;
  }
  pendingServerTouch = false;
  lastServerTouchAt = now;
  return true;
}

export function getLastAdminActivityAt(): number {
  return lastActivityAt;
}

export function resetAdminActivityClock(): void {
  lastActivityAt = Date.now();
  lastServerTouchAt = 0;
  pendingServerTouch = false;
}
