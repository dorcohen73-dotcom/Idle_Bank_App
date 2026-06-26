# PowerShell implementation of the Service Worker cache name build automation.
# This serves as a native alternative to build.js for Windows environments that do not have Node.js installed.
$files = @(
  "index.html",
  "style.css",
  "config.js",
  "audio.js",
  "locales.js",
  "economy-manager.js",
  "save-manager.js",
  "mission-controller.js",
  "game.js",
  "ui-draw.js",
  "ui-tabs.js",
  "ui-events.js",
  "app.js",
  "manifest.json"
)

Write-Host "Starting Service Worker Cache Name build automation via PowerShell..."

$combinedContent = ""
foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot ".." $file
    if (Test-Path $filePath) {
        $combinedContent += [System.IO.File]::ReadAllText($filePath)
    } else {
        Write-Warning "Source file not found for hashing: $file"
    }
}

# Calculate MD5
$md5 = [System.Security.Cryptography.MD5]::Create()
$stringBytes = [System.Text.Encoding]::UTF8.GetBytes($combinedContent)
$hashBytes = $md5.ComputeHash($stringBytes)
$hashString = ""
foreach ($byte in $hashBytes) {
    $hashString += $byte.ToString("x2")
}

$md5Hash = $hashString.Substring(0, 10)
$cacheName = "bank-empire-$md5Hash"

Write-Host "Generated MD5 Hash: $md5Hash"
Write-Host "New Cache Name: $cacheName"

$swPath = Join-Path $PSScriptRoot ".." "sw.js"
if (Test-Path $swPath) {
    $swContent = [System.IO.File]::ReadAllText($swPath)
    $updatedContent = $swContent -replace 'const\s+CACHE_NAME\s*=\s*[''"`][^''"`]+[''"`];', "const CACHE_NAME = '$cacheName';"
    [System.IO.File]::WriteAllText($swPath, $updatedContent)
    Write-Host "Successfully updated sw.js with the new CACHE_NAME!"
} else {
    Write-Error "sw.js not found in workspace root."
}
