Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$folder = "C:\Users\dorco\Desktop\אנטי גרפיטי\IDLE בנק"

function Take-Screenshot($filename) {
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $bmp = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
    $bmp.Save("$folder\$filename")
    $g.Dispose(); $bmp.Dispose()
    Write-Host "Saved: $filename"
}

Take-Screenshot "game_screen1.png"
Start-Sleep -Milliseconds 800
Take-Screenshot "game_screen2.png"
Start-Sleep -Milliseconds 800
Take-Screenshot "game_screen3.png"

Write-Host "DONE - 3 screenshots saved to IDLE בנק folder"
