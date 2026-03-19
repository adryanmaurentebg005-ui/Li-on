package com.anonymous.teste.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class UsageStatsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "UsageStatsModule"

  @ReactMethod
  fun hasUsageStatsPermission(promise: Promise) {
    promise.resolve(hasUsageStatsPermissionInternal())
  }

  @ReactMethod
  fun openUsageAccessSettings() {
    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    reactContext.startActivity(intent)
  }

  @ReactMethod
  fun getUsageStats(startTimeMillis: Double, endTimeMillis: Double, promise: Promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
      promise.reject("UNSUPPORTED_ANDROID_VERSION", "UsageStatsManager requires Android 5.0+")
      return
    }

    if (!hasUsageStatsPermissionInternal()) {
      promise.reject("PERMISSION_DENIED", "Usage access permission is not granted")
      return
    }

    try {
      val usageStatsManager =
        reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val stats = usageStatsManager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        startTimeMillis.toLong(),
        endTimeMillis.toLong()
      )

      val response = Arguments.createArray()
      stats
        .asSequence()
        .filter { it.totalTimeInForeground > 0L }
        .sortedByDescending { it.totalTimeInForeground }
        .forEach { item ->
          val map = Arguments.createMap()
          map.putString("packageName", item.packageName)
          map.putString("appName", getAppName(item.packageName))
          map.putDouble("totalTimeInForeground", item.totalTimeInForeground.toDouble())
          map.putDouble("firstTimeStamp", item.firstTimeStamp.toDouble())
          map.putDouble("lastTimeStamp", item.lastTimeStamp.toDouble())
          map.putDouble("lastTimeUsed", item.lastTimeUsed.toDouble())
          response.pushMap(map)
        }

      promise.resolve(response)
    } catch (e: Exception) {
      promise.reject("USAGE_STATS_ERROR", e.message, e)
    }
  }

  private fun hasUsageStatsPermissionInternal(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
      return false
    }

    val appOpsManager = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOpsManager.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(),
        reactContext.packageName
      )
    } else {
      @Suppress("DEPRECATION")
      appOpsManager.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(),
        reactContext.packageName
      )
    }

    return mode == AppOpsManager.MODE_ALLOWED
  }

  private fun getAppName(packageName: String): String {
    return try {
      val pm = reactContext.packageManager
      val appInfo = pm.getApplicationInfo(packageName, 0)
      pm.getApplicationLabel(appInfo).toString()
    } catch (e: Exception) {
      packageName
    }
  }
}
