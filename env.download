
import { SurveyResponse, AppConfig } from '../types';
import { DEFAULT_PRODUCTS } from '../constants.tsx';

const SURVEY_KEY = 'jd_survey_responses_v1';
const CONFIG_KEY = 'jd_survey_config_v1';
const DEVICE_ID_KEY = 'jd_device_id';

const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const saveResponse = (response: SurveyResponse): void => {
  try {
    const existing = getResponses();
    const config = getConfig();
    const newResponse = { 
      ...response, 
      id: response.id || generateId(),
      deviceId: getDeviceId(),
      sectorName: config.sectorName, // Capture current sector name
      synced: false 
    };
    const updated = [...existing, newResponse];
    localStorage.setItem(SURVEY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Storage error", e);
  }
};

export const getResponses = (): SurveyResponse[] => {
  try {
    const data = localStorage.getItem(SURVEY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const mergeResponses = (externalResponses: SurveyResponse[]): { added: number, duplicates: number } => {
  const local = getResponses();
  const localIds = new Set(local.map(r => r.id));
  
  let added = 0;
  let duplicates = 0;
  
  const toAdd: SurveyResponse[] = [];
  
  externalResponses.forEach(ext => {
    if (localIds.has(ext.id)) {
      duplicates++;
    } else {
      toAdd.push({ ...ext, synced: true });
      added++;
    }
  });
  
  if (toAdd.length > 0) {
    localStorage.setItem(SURVEY_KEY, JSON.stringify([...local, ...toAdd]));
  }
  
  return { added, duplicates };
};

export const getConfig = (): AppConfig => {
  const data = localStorage.getItem(CONFIG_KEY);
  if (!data) {
    const defaultConfig: AppConfig = {
      adminPin: 'JDENCUESTA',
      availableProducts: DEFAULT_PRODUCTS,
      standId: 'EXPO_2025',
      sectorName: 'GENERAL' // Default sector
    };
    saveConfig(defaultConfig);
    return defaultConfig;
  }
  const config = JSON.parse(data);
  // Migration for existing configs without sectorName
  if (!config.sectorName) {
    config.sectorName = 'GENERAL';
    saveConfig(config);
  }
  return config;
};

export const saveConfig = (config: AppConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const clearAllData = (): void => {
  localStorage.removeItem(SURVEY_KEY);
};

export const getDeviceInfo = () => ({
  id: getDeviceId(),
  isOnline: navigator.onLine
});
