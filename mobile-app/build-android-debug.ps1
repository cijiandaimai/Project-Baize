param(
  [string]$SdkDir = ""
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$AndroidRoot = Join-Path $ProjectRoot "android"
$DefaultJdk = "D:\11\baize\jdk-21"
$DefaultSdkCandidates = @(
  $SdkDir,
  "D:\11\baize\android-sdk",
  "D:\Android\Sdk",
  "$env:LOCALAPPDATA\Android\Sdk",
  "C:\Android\Sdk"
) | Where-Object { $_ -and $_.Trim() }

if (-not (Test-Path -LiteralPath $DefaultJdk)) {
  throw "JDK 21 was not found: $DefaultJdk. Please install JDK 21 first."
}

$ResolvedSdk = $DefaultSdkCandidates | Where-Object {
  Test-Path -LiteralPath (Join-Path $_ "platforms")
} | Select-Object -First 1

if (-not $ResolvedSdk) {
  Write-Host "Android SDK was not found." -ForegroundColor Yellow
  Write-Host "Recommended SDK location: D:\11\baize\android-sdk" -ForegroundColor Yellow
  Write-Host "Open Android Studio -> SDK Manager, set Android SDK Location to D:\11\baize\android-sdk, then install Android SDK Platform 36, Build-Tools, and Platform-Tools." -ForegroundColor Yellow
  Write-Host "After installation, run:" -ForegroundColor Yellow
  Write-Host ".\build-android-debug.ps1 -SdkDir `"D:\11\baize\android-sdk`"" -ForegroundColor Cyan
  exit 1
}

$env:JAVA_HOME = $DefaultJdk
$env:ANDROID_HOME = $ResolvedSdk
$env:ANDROID_SDK_ROOT = $ResolvedSdk
$env:Path = "$env:JAVA_HOME\bin;C:\Program Files\nodejs;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:Path"

function Use-MirrorRepositories {
  param([string]$GradleFile)

  if (-not (Test-Path -LiteralPath $GradleFile)) {
    return
  }

  $content = Get-Content -LiteralPath $GradleFile -Raw
  if ($content.Contains("maven.aliyun.com/repository/google")) {
    return
  }

  $content = $content -replace "repositories \{\s+google\(\)\s+mavenCentral\(\)\s+\}", "repositories {`r`n        maven { url 'https://maven.aliyun.com/repository/google' }`r`n        maven { url 'https://maven.aliyun.com/repository/central' }`r`n        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }`r`n        google()`r`n        mavenCentral()`r`n    }"
  $content = $content -replace "repositories \{\s+google\(\)\s+mavenCentral\(\)\s+flatDir", "repositories {`r`n    maven { url 'https://maven.aliyun.com/repository/google' }`r`n    maven { url 'https://maven.aliyun.com/repository/central' }`r`n    google()`r`n    mavenCentral()`r`n    flatDir"
  Set-Content -LiteralPath $GradleFile -Value $content -Encoding ASCII
}

$localProperties = Join-Path $AndroidRoot "local.properties"
$escapedSdk = $ResolvedSdk.Replace("\", "\\")
"sdk.dir=$escapedSdk" | Set-Content -LiteralPath $localProperties -Encoding ASCII

Push-Location $ProjectRoot
try {
  npm run android:sync
  Use-MirrorRepositories -GradleFile (Join-Path $AndroidRoot "capacitor-cordova-android-plugins\build.gradle")
}
finally {
  Pop-Location
}

Push-Location $AndroidRoot
try {
  .\gradlew.bat assembleDebug
}
finally {
  Pop-Location
}

$apk = Join-Path $AndroidRoot "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path -LiteralPath $apk) {
  Write-Host "APK generated:" -ForegroundColor Green
  Write-Host $apk -ForegroundColor Green
} else {
  throw "Build finished, but APK was not found: $apk"
}
