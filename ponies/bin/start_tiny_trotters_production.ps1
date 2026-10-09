# 1. Install the module automatically if it isn't found on the system
if (-not (Get-Module -ListAvailable -Name ThreadJob)) {
    Write-Host "ThreadJob module not found. Installing..." -ForegroundColor Cyan
    Install-Module -Name Microsoft.PowerShell.ThreadJob -Force -AllowClobber -Scope CurrentUser -Repository PSGallery
}

# 2. Explicitly load the module into the current session
Import-Module -Name ThreadJob


# Configuration - Update these paths and names for your project
$ProjectDir = 'C:\Users\Public\tiny-trotters\ponies\bin'
$TunnelNameOrId = "tiny-trotters-pony-parties-tunnel"

# 1. Navigate to your project directory
Set-Location -Path $ProjectDir

Write-Host "Starting Node.js project with nodemon..." -ForegroundColor Cyan

# 2. Start nodemon in a background script block to keep the console responsive
$NodeJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location -Path $dir
    # Uses npx to run nodemon locally or globally
    npx node .\app.js
} -ArgumentList $ProjectDir

# Brief pause to let node initialize
Start-Sleep -Seconds 3

# Check if the background job failed immediately
if ($NodeJob.State -eq "Failed") {
    Write-Error "Failed to start nodemon. Check your project configuration or node installation."
    Exit
}

Write-Host "Establishing Cloudflare Tunnel connection..." -ForegroundColor Cyan
Write-Host "Press Ctrl + C in this window to stop both the tunnel and nodemon." -ForegroundColor Yellow

# 3. Start the Cloudflare tunnel in the foreground so you can see its logs
try {
    # If your tunnel requires a specific configuration file path, append: --config "C:\path\to\config.yml"
    cloudflared tunnel run $TunnelNameOrId
}
catch {
    Write-Error "Cloudflare tunnel encountered an error: $_"
}
finally {
    # 4. Cleanup: This block runs when you press Ctrl + C to stop the script
    Write-Host "`nStopping background Node.js process..." -ForegroundColor Red
    Stop-Job $NodeJob
    Remove-Job $NodeJob
    Write-Host "Cleanup complete." -ForegroundColor Green
}
