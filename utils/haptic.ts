/**
 * Haptic feedback utility for mobile/supported browsers.
 * Uses the Web Vibration API where available.
 */
export const triggerHaptic = (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
) => {
  if (typeof window === 'undefined') return
  if (!window.navigator || !window.navigator.vibrate) return
  try {
    switch (type) {
      case 'light':    window.navigator.vibrate(10);           break
      case 'medium':   window.navigator.vibrate(25);           break
      case 'heavy':    window.navigator.vibrate(55);           break
      case 'success':  window.navigator.vibrate([15, 30, 15]); break
      case 'warning':  window.navigator.vibrate([35, 45, 35]); break
      case 'error':    window.navigator.vibrate([80, 45, 80]); break
    }
  } catch (_) {}
}
