Add-Type -AssemblyName System.Drawing

# Resize Icon
$iconPath = 'C:\Users\dorco\.gemini\antigravity-ide\brain\6bfd46f6-2d46-4c70-acbf-6e505d89136d\bank_app_icon_1783365939704.png'
$outIcon = 'C:\Users\dorco\Desktop\icon_512x512.png'

$img1 = [System.Drawing.Image]::FromFile($iconPath)
$bmp1 = New-Object System.Drawing.Bitmap 512, 512
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.DrawImage($img1, 0, 0, 512, 512)
$bmp1.Save($outIcon, [System.Drawing.Imaging.ImageFormat]::Png)
$g1.Dispose()
$bmp1.Dispose()
$img1.Dispose()

# Crop Feature Graphic
$featPath = 'C:\Users\dorco\.gemini\antigravity-ide\brain\6bfd46f6-2d46-4c70-acbf-6e505d89136d\bank_feature_graphic_1783365947892.png'
$outFeat = 'C:\Users\dorco\Desktop\feature_1024x500.png'

$img2 = [System.Drawing.Image]::FromFile($featPath)
$w = $img2.Width
$h = $img2.Height

$bmp2 = New-Object System.Drawing.Bitmap 1024, 500
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$scale = 1024.0 / $w
$scaledHeight = [int]($h * $scale)
$yOffset = -($scaledHeight - 500) / 2
$g2.DrawImage($img2, 0, $yOffset, 1024, $scaledHeight)

$bmp2.Save($outFeat, [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose()
$bmp2.Dispose()
$img2.Dispose()

Write-Host "Done resizing images to desktop."
