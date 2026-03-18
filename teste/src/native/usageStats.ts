import { NativeModules, Platform } from "react-native";

export type UsageStatItem = {
  packageName: string;
  appName: string;
  totalTimeInForeground: number;
  firstTimeStamp: number;
  lastTimeStamp: number;
  lastTimeUsed: number;
};

type UsageStatsNativeModule = {
  hasUsageStatsPermission: () => Promise<boolean>;
  openUsageAccessSettings: () => void;
  getUsageStats: (startTimeMillis: number, endTimeMillis: number) => Promise<UsageStatItem[]>;
};

const moduleRef = NativeModules.UsageStatsModule as UsageStatsNativeModule | undefined;

function ensureAndroidSupport() {
  if (Platform.OS !== "android") {
    throw new Error("UsageStatsManager is available only on Android");
  }

  if (!moduleRef) {
    throw new Error("UsageStatsModule is not linked in the native Android project");
  }
}

export async function hasUsageStatsPermission() {
  ensureAndroidSupport();
  return moduleRef!.hasUsageStatsPermission();
}

export function openUsageAccessSettings() {
  ensureAndroidSupport();
  moduleRef!.openUsageAccessSettings();
}

export async function getUsageStats(startTimeMillis: number, endTimeMillis: number) {
  ensureAndroidSupport();
  return moduleRef!.getUsageStats(startTimeMillis, endTimeMillis);
}
