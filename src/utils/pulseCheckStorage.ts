// Utility functions for storing and retrieving pulse check data during authentication flow

export interface PulseCheckData {
  Career: number;
  Finances: number;
  Health: number;
  Connections: number;
}

const PULSE_CHECK_STORAGE_KEY = 'infinitelife_pulse_check_data';

export const savePulseCheckData = (data: PulseCheckData): void => {
  try {
    localStorage.setItem(PULSE_CHECK_STORAGE_KEY, JSON.stringify(data));
    console.log('[PulseCheckStorage] Data saved to localStorage', data);
  } catch (error) {
    console.error('[PulseCheckStorage] Failed to save data:', error);
  }
};

export const retrievePulseCheckData = (): PulseCheckData | null => {
  try {
    const stored = localStorage.getItem(PULSE_CHECK_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      console.log('[PulseCheckStorage] Data retrieved from localStorage', data);
      return data;
    }
    return null;
  } catch (error) {
    console.error('[PulseCheckStorage] Failed to retrieve data:', error);
    return null;
  }
};

export const clearPulseCheckData = (): void => {
  try {
    localStorage.removeItem(PULSE_CHECK_STORAGE_KEY);
    console.log('[PulseCheckStorage] Data cleared from localStorage');
  } catch (error) {
    console.error('[PulseCheckStorage] Failed to clear data:', error);
  }
};