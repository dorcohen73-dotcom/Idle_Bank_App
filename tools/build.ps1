# PowerShell implementation of the Service Worker cache name build automation.
# This serves as a native alternative to build.js for Windows environments that do not have Node.js installed.
# NOTE: this script only recomputes the SW cache-busting hash — it does NOT regenerate
# app.bundle.js (that requires esbuild, i.e. Node.js). If ui/tabs/*.js, ui-events.js or
# app.js changed, run `npm run bundle` first, or the shipped bundle will be stale.

$projectRoot = Join-Path $PSScriptRoot ".."
$excludedDirs = @('node_modules', 'android', 'www', '.git', '.netlify', 'tests', 'agents-library', 'tools', 'marketing', '.claude', '.vscode')
$excludedFiles = @('build.js', 'capacitor.config.json', 'eslint.config.js', 'package.json', 'package-lock.json', 'sw.js', 'test.js', 'test2.js', 'test3.js', '__static-server.js', '__verify_marketing.js', '__verify_marketing2.js', 'app.bundle.js', 'app.bundle.js.map')
$includedExtensions = @('.js', '.css', '.html')

# Recursively collects every source file that actually ships with the game, so new
# files (e.g. under ui/tabs/) automatically participate in cache-busting instead of
# relying on a hand-maintained list that silently goes stale.
function Get-SourceFiles($dir) {
    $results = @()
    Get-ChildItem -LiteralPath $dir -Force | ForEach-Object {
        if ($_.Name.StartsWith('.') -and $_.Name -ne '.') { return }
        if ($_.PSIsContainer) {
            if ($excludedDirs -contains $_.Name) { return }
            $results += Get-SourceFiles $_.FullName
        } else {
            if ($excludedFiles -contains $_.Name) { return }
            if ($includedExtensions -contains $_.Extension -or $_.Name -eq 'manifest.json') {
                $results += $_.FullName
            }
        }
    }
    return $results
}

Write-Host "Starting Service Worker Cache Name build automation via PowerShell..."

$sourceFiles = Get-SourceFiles $projectRoot | Sort-Object
Write-Host "Hashing $($sourceFiles.Count) source files..."

$combinedContent = ""
foreach ($filePath in $sourceFiles) {
    $combinedContent += [System.IO.File]::ReadAllText($filePath)
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

$swPath = Join-Path $projectRoot "sw.js"
if (Test-Path $swPath) {
    $swContent = [System.IO.File]::ReadAllText($swPath)
    $updatedContent = $swContent -replace 'const\s+CACHE_NAME\s*=\s*[''"`][^''"`]+[''"`];', "const CACHE_NAME = '$cacheName';"
    [System.IO.File]::WriteAllText($swPath, $updatedContent)
    Write-Host "Successfully updated sw.js with the new CACHE_NAME!"
} else {
    Write-Error "sw.js not found in workspace root."
}
