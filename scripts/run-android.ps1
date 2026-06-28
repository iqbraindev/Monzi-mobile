$ErrorActionPreference = "Stop"

$javaHome = "C:\Program Files\Android\Android Studio\jbr"
$androidHome = Join-Path $env:LOCALAPPDATA "Android\Sdk"

if (-not (Test-Path $javaHome)) {
  Write-Error "Android Studio JDK not found at: $javaHome"
}

if (-not (Test-Path $androidHome)) {
  Write-Error "Android SDK not found at: $androidHome"
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

Set-Location (Join-Path $PSScriptRoot "..")
npx expo run:android @args
