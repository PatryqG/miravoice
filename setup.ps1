# Uruchom ten skrypt RAZ w folderze projektu (PowerShell):  .\setup.ps1
# Generuje foldery android/ i windows/, dodaje uprawnienie do internetu
# i pobiera biblioteki.

$ErrorActionPreference = "Stop"

flutter create --platforms=android,windows --org pl.miravoice --project-name miravoice .

$manifest = "android/app/src/main/AndroidManifest.xml"
if (Test-Path $manifest) {
  $content = Get-Content $manifest -Raw
  if ($content -notmatch "android.permission.INTERNET") {
    $tag = '<manifest xmlns:android="http://schemas.android.com/apk/res/android">'
    $perm = '<uses-permission android:name="android.permission.INTERNET"/>'
    $content = $content.Replace($tag, "$tag`n    $perm")
    $content = $content.Replace('android:label="miravoice"', 'android:label="MiraVoice"')
    Set-Content -Path $manifest -Value $content -Encoding UTF8
  }
  if ((Get-Content $manifest -Raw) -notmatch "android.permission.INTERNET") {
    Write-Warning "Nie udalo sie dodac uprawnienia INTERNET. Dodaj recznie linie: $perm w $manifest (zobacz README)."
  }
}

flutter pub get
Write-Host "Gotowe. Uruchom:  flutter run -d windows"
