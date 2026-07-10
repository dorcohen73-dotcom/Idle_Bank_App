$ErrorActionPreference = 'Stop'
$url = "https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_windows-x64_bin.zip"
$zipPath = "C:\Users\dorco\Desktop\jdk21.zip"
$extractPath = "C:\Users\dorco\Desktop\jdk21"

if (-Not (Test-Path "$extractPath\jdk-21.0.2")) {
    Write-Host "Downloading portable JDK 21..."
    Invoke-WebRequest -Uri $url -OutFile $zipPath
    Write-Host "Extracting JDK 21..."
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    Remove-Item -Path $zipPath -Force
}

$env:JAVA_HOME = "$extractPath\jdk-21.0.2"
Write-Host "Set JAVA_HOME to $env:JAVA_HOME"

cd C:\Users\dorco\Desktop\AntiGravity\IdleBank
Write-Host "Syncing web assets into the Android project..."
npm run cap-sync
if ($LASTEXITCODE -ne 0) { throw "cap-sync failed" }

cd C:\Users\dorco\Desktop\AntiGravity\IdleBank\android
Write-Host "Building Release App Bundle (AAB)..."
.\gradlew bundleRelease

Write-Host "Build finished!"
