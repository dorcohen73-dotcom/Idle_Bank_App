$ErrorActionPreference = 'Stop'
$url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
$zipPath = "C:\Users\dorco\Desktop\ffmpeg.zip"
$extractPath = "C:\Users\dorco\Desktop\ffmpeg"

if (-not (Test-Path "$extractPath\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe")) {
    Write-Host "Downloading FFmpeg..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $url -OutFile $zipPath
    Write-Host "Extracting FFmpeg..."
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
}
Write-Host "FFmpeg ready."
