$ErrorActionPreference = 'Stop'
$ffmpeg = "C:\Users\dorco\Desktop\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"

$mp4Files = Get-ChildItem -Path "C:\Users\dorco\Desktop" -Filter "*.mp4"
$inputVid = $mp4Files | Where-Object { $_.Length -gt 50MB } | Select-Object -First 1 | Select-Object -ExpandProperty FullName
$outputVid = "C:\Users\dorco\Desktop\Promo_Trailer.mp4"

$font = "C\:\\Windows\\Fonts\\arialbd.ttf"

$vf = "drawtext=fontfile='$font':text='READY TO BUILD YOUR FINANCIAL EMPIRE?':fontcolor=white:fontsize=(w/25):box=1:boxcolor=black@0.7:boxborderw=10:x=(w-text_w)/2:y=(h-text_h)*0.85:enable='between(t,0,10)',"
$vf += "drawtext=fontfile='$font':text='HIRE MANAGERS AND AUTOMATE EVERYTHING!':fontcolor=white:fontsize=(w/25):box=1:boxcolor=black@0.7:boxborderw=10:x=(w-text_w)/2:y=(h-text_h)*0.85:enable='between(t,10,20)',"
$vf += "drawtext=fontfile='$font':text='DOWNLOAD BANK EMPIRE NOW!':fontcolor=yellow:fontsize=(w/20):box=1:boxcolor=black@0.7:boxborderw=10:x=(w-text_w)/2:y=(h-text_h)*0.85:enable='between(t,20,32)'"

$args = @("-y", "-i", $inputVid, "-vf", $vf, "-c:a", "copy", $outputVid)

Write-Host "Running FFmpeg on: $inputVid"
& $ffmpeg @args
Write-Host "Done!"
