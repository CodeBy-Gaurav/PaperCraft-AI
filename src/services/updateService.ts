import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import * as Linking from 'expo-linking';

export interface RemoteVersionInfo {
  latestVersion: string;
  versionCode: number;
  minRequiredVersion: string;
  releaseDate: string;
  title: string;
  releaseNotes: string[];
  downloadUrl: string;
  isCritical: boolean;
}

export interface UpdateCheckResult {
  currentVersion: string;
  currentVersionCode: number;
  hasOtaUpdate: boolean;
  hasMajorUpdate: boolean;
  majorUpdateInfo?: RemoteVersionInfo;
  otaDownloaded?: boolean;
  message?: string;
}

const REMOTE_VERSION_URL =
  'https://raw.githubusercontent.com/CodeBy-Gaurav/PaperCraft-AI/main/version.json';

export const CURRENT_APP_VERSION =
  Constants.expoConfig?.version ?? '1.0.1';

export const CURRENT_VERSION_CODE =
  Constants.expoConfig?.android?.versionCode ?? 2;

/**
 * Compare two semver strings: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareSemVer(v1: string, v2: string): number {
  const p1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = v2.split('.').map((n) => parseInt(n, 10) || 0);
  const maxLen = Math.max(p1.length, p2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Check for Over-The-Air (OTA) updates using expo-updates
 */
export async function checkOtaUpdateAsync(): Promise<{
  isAvailable: boolean;
  isDownloaded: boolean;
}> {
  try {
    if (!Updates.isEnabled) {
      return { isAvailable: false, isDownloaded: false };
    }

    const check = await Updates.checkForUpdateAsync();
    if (check.isAvailable) {
      const fetchResult = await Updates.fetchUpdateAsync();
      return { isAvailable: true, isDownloaded: fetchResult.isNew };
    }
    return { isAvailable: false, isDownloaded: false };
  } catch (err) {
    // Gracefully handle offline or network errors
    console.log('[UpdateService] OTA check skipped or offline:', err);
    return { isAvailable: false, isDownloaded: false };
  }
}

/**
 * Immediately reload the app to apply the downloaded OTA update
 */
export async function applyOtaUpdateAsync(): Promise<void> {
  try {
    if (Updates.isEnabled) {
      await Updates.reloadAsync();
    }
  } catch (err) {
    console.warn('[UpdateService] Failed to reload for OTA update:', err);
  }
}

/**
 * Check if a major APK version is available on GitHub
 */
export async function checkMajorUpdateAsync(): Promise<{
  isAvailable: boolean;
  info?: RemoteVersionInfo;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(`${REMOTE_VERSION_URL}?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { isAvailable: false };
    }

    const info: RemoteVersionInfo = await res.json();

    // Check if remote version or versionCode is higher than currently installed
    const hasNewerVersionCode = info.versionCode > CURRENT_VERSION_CODE;
    const hasNewerSemVer = compareSemVer(info.latestVersion, CURRENT_APP_VERSION) > 0;

    if (hasNewerVersionCode || hasNewerSemVer) {
      return { isAvailable: true, info };
    }

    return { isAvailable: false, info };
  } catch (err) {
    // Offline or network timeout - silent fallback
    return { isAvailable: false };
  }
}

/**
 * Complete dual-tier check: checks OTA first, then major binary release
 */
export async function performFullUpdateCheckAsync(): Promise<UpdateCheckResult> {
  const result: UpdateCheckResult = {
    currentVersion: CURRENT_APP_VERSION,
    currentVersionCode: CURRENT_VERSION_CODE,
    hasOtaUpdate: false,
    hasMajorUpdate: false
  };

  try {
    // 1. Check for Major Binary / APK update first
    const majorCheck = await checkMajorUpdateAsync();
    if (majorCheck.isAvailable && majorCheck.info) {
      result.hasMajorUpdate = true;
      result.majorUpdateInfo = majorCheck.info;
      return result;
    }

    // 2. Check for Over-The-Air (OTA) update
    const otaCheck = await checkOtaUpdateAsync();
    if (otaCheck.isAvailable) {
      result.hasOtaUpdate = true;
      result.otaDownloaded = otaCheck.isDownloaded;
    }
  } catch (err) {
    console.log('[UpdateService] Update check failed gracefully:', err);
  }

  return result;
}

/**
 * Open the APK download link in external browser or package manager
 */
export async function launchApkUpdateDownload(url: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  } catch (err) {
    console.warn('[UpdateService] Failed to open download URL:', err);
  }
}
