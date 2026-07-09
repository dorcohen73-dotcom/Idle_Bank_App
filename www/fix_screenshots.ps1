Add-Type -AssemblyName System.Drawing

$srcFolder = 'C:\Users\dorco\Desktop\תמונות מסך'
$destFolder = 'C:\Users\dorco\Desktop\תמונות מסך\fixed'

if (-Not (Test-Path $destFolder)) {
    New-Item -ItemType Directory -Path $destFolder | Out-Null
}

$files = Get-ChildItem -Path $srcFolder -Filter *.png
$bgColor = [System.Drawing.Color]::FromArgb(255, 12, 16, 26)

foreach ($file in $files) {
    if ($file.PSIsContainer) { continue }
    
    $imgPath = $file.FullName
    $outPath = Join-Path $destFolder $file.Name
    
    $img = [System.Drawing.Image]::FromFile($imgPath)
    
    $targetW = 1080
    $targetH = 1920
    
    $bmp = New-Object System.Drawing.Bitmap $targetW, $targetH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear($bgColor)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $scale = [math]::Min($targetW / $img.Width, $targetH / $img.Height)
    $newW = [int]($img.Width * $scale)
    $newH = [int]($img.Height * $scale)
    
    $xOffset = [int](($targetW - $newW) / 2)
    $yOffset = [int](($targetH - $newH) / 2)
    
    $g.DrawImage($img, $xOffset, $yOffset, $newW, $newH)
    
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
}

Write-Host "Done resizing screenshots."
