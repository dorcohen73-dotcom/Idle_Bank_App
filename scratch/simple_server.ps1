$port = 8081
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
} catch {
    Write-Error "Failed to start listener on port $port. It might already be in use."
    exit 1
}
Write-Output "Listening on port $port..."
$cwd = "c:\Users\dorco\Desktop\אנטי גרפיטי\IDLE בנק"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        # URL decode path to support Hebrew folders/filenames correctly
        $urlPath = [System.Uri]::UnescapeDataString($urlPath)
        
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        # Clean path, replace forward slashes with backward slashes
        $cleanPath = $urlPath.Replace("/", "\")
        if ($cleanPath.StartsWith("\")) { $cleanPath = $cleanPath.Substring(1) }
        
        # Combine paths safely
        $filePath = Join-Path $cwd $cleanPath
        
        Write-Output "Requested: $urlPath -> File: $filePath"
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Content type mapping
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            if ($ext -eq ".html" -or $ext -eq ".htm") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            elseif ($ext -eq ".webp") { $contentType = "image/webp" }
            elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            Write-Output "Not Found: $filePath"
        }
        $response.Close()
    } catch {
        # Handle exceptions to keep the server running
        Write-Output "Error: $_"
        if ($null -ne $response) {
            try { $response.Close() } catch {}
        }
    }
}
