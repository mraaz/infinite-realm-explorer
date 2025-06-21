
import { DEBUG_MODE } from './config';

export const logDebug = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.log("[DEBUG]", new Date().toISOString(), ...args);
  }
};

export const logError = (...args: any[]) => {
  console.error("[ERROR]", new Date().toISOString(), ...args);
};

export const logInfo = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.info("[INFO]", new Date().toISOString(), ...args);
  }
};
