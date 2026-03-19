/**
 * Utility functions for playing notification sounds
 */

export type NotificationTone = 'ding' | 'chime' | 'bell' | 'notification' | 'magic';

interface AudioSettings {
  enable_audio_alerts: boolean;
  notification_tone: NotificationTone;
  always_play_audio_alert: boolean; // If false, play only when tab is inactive
  alert_if_unread_assigned_conversation_exist: boolean;
}

// Map of tone names to audio file paths
// Files are located in /public/audio/notifications/
const TONE_FILES: Record<NotificationTone, string> = {
  ding: '/audio/notifications/ding.mp3',
  chime: '/audio/notifications/chime.mp3',
  bell: '/audio/notifications/bell.mp3',
  notification: '/audio/notifications/ping.mp3', // Use ping.mp3 as default notification sound
  magic: '/audio/notifications/magic.mp3',
};

// Fallback: Use Web Audio API to generate simple tones if files don't exist
const generateTone = (tone: NotificationTone): string => {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Different frequencies for different tones
  const frequencies: Record<NotificationTone, number> = {
    ding: 800,
    chime: 600,
    bell: 400,
    notification: 500,
    magic: 700,
  };

  oscillator.frequency.value = frequencies[tone];
  oscillator.type = tone === 'bell' ? 'sine' : 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);

  return ''; // Return empty string as we're using Web Audio API directly
};

let audioSettingsCache: AudioSettings | null = null;

/**
 * Load audio settings from localStorage or use defaults
 */
export const getAudioSettings = (): AudioSettings => {
  if (audioSettingsCache) {
    return audioSettingsCache;
  }

  try {
    const stored = localStorage.getItem('audio_notification_settings');
    if (stored) {
      audioSettingsCache = JSON.parse(stored);
      return audioSettingsCache!;
    }
  } catch (error) {
    console.error('Error loading audio settings:', error);
  }

  // Default settings
  const defaults: AudioSettings = {
    enable_audio_alerts: false,
    notification_tone: 'ding',
    always_play_audio_alert: false,
    alert_if_unread_assigned_conversation_exist: false,
  };

  audioSettingsCache = defaults;
  return defaults;
};

/**
 * Save audio settings to localStorage
 */
export const saveAudioSettings = (settings: Partial<AudioSettings>): void => {
  const current = getAudioSettings();
  const updated = { ...current, ...settings };

  try {
    localStorage.setItem('audio_notification_settings', JSON.stringify(updated));
    audioSettingsCache = updated;
  } catch (error) {
    console.error('Error saving audio settings:', error);
  }
};

/**
 * Check if tab is currently active
 */
const isTabActive = (): boolean => {
  return !document.hidden;
};

/**
 * Play notification sound based on settings
 */
export const playNotificationSound = async (
  settings?: Partial<AudioSettings>,
  checkUnreadConversations?: () => boolean
): Promise<void> => {
  const audioSettings = settings ? { ...getAudioSettings(), ...settings } : getAudioSettings();

  // Check if audio alerts are enabled
  if (!audioSettings.enable_audio_alerts) {
    return;
  }

  // Check condition: play only when tab is inactive
  // If always_play_audio_alert is true, play regardless of tab state
  // If always_play_audio_alert is false, only play when tab is inactive
  if (!audioSettings.always_play_audio_alert && isTabActive()) {
    return;
  }

  // Check condition: alert if unread assigned conversations exist
  // This is an ADDITIONAL condition - if enabled, it requires unread conversations
  // If disabled, it doesn't block the sound
  if (audioSettings.alert_if_unread_assigned_conversation_exist) {
    if (checkUnreadConversations) {
      const hasUnread = checkUnreadConversations();
      if (!hasUnread) {
        return;
      }
    } else {
      // If checkUnreadConversations is not provided but condition is enabled, don't play
      return;
    }
  }

  const toneFile = TONE_FILES[audioSettings.notification_tone];

  try {
    // Try to play audio file first
    if (toneFile) {
      const audio = new Audio(toneFile);
      audio.volume = 0.5;

      // Handle errors (file might not exist)
      audio.onerror = () => {
        // Fallback to generated tone
        generateTone(audioSettings.notification_tone);
      };

      await audio.play().catch(() => {
        // If play fails, try generated tone
        generateTone(audioSettings.notification_tone);
      });
    } else {
      // Use generated tone
      generateTone(audioSettings.notification_tone);
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
    // Fallback to generated tone
    try {
      generateTone(audioSettings.notification_tone);
    } catch (fallbackError) {
      console.error('Error generating fallback tone:', fallbackError);
    }
  }
};

/**
 * Play a preview of the notification sound (ignores conditions)
 */
export const playNotificationSoundPreview = async (tone: NotificationTone): Promise<void> => {
  const toneFile = TONE_FILES[tone];

  try {
    // Try to play audio file first
    if (toneFile) {
      const audio = new Audio(toneFile);
      audio.volume = 0.5;

      // Handle errors (file might not exist)
      audio.onerror = () => {
        // Fallback to generated tone
        generateTone(tone);
      };

      await audio.play().catch(() => {
        // If play fails, try generated tone
        generateTone(tone);
      });
    } else {
      // Use generated tone
      generateTone(tone);
    }
  } catch (error) {
    console.error('Error playing notification sound preview:', error);
    // Fallback to generated tone
    try {
      generateTone(tone);
    } catch (fallbackError) {
      console.error('Error generating fallback tone:', fallbackError);
    }
  }
};

/**
 * Clear audio settings cache (useful when settings are updated)
 */
export const clearAudioSettingsCache = (): void => {
  audioSettingsCache = null;
};

