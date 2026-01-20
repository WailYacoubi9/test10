# Webapp certs
$webappCertDir = "C:\Users\waily\test10\webapp2\certs"
if (!(Test-Path $webappCertDir)) {
    New-Item -ItemType Directory -Path $webappCertDir | Out-Null
}

$webappCert = Join-Path $webappCertDir "localhost+2.pem"
$webappKey  = Join-Path $webappCertDir "localhost+2-key.pem"

if (!(Test-Path $webappCert) -or !(Test-Path $webappKey)) {
    Write-Host "Generating certificates for WebApp..."
    Push-Location $webappCertDir
    mkcert localhost 127.0.0.1 ::1
    Pop-Location
    Write-Host "✅ WebApp certificates generated"
} else {
    Write-Host "✅ WebApp certificates already exist"
}

# Device-app certs
$deviceCertDir = "C:\Users\waily\test10\device-app\certs"
if (!(Test-Path $deviceCertDir)) {
    New-Item -ItemType Directory -Path $deviceCertDir | Out-Null
}

$deviceCert = Join-Path $deviceCertDir "localhost+2.pem"
$deviceKey  = Join-Path $deviceCertDir "localhost+2-key.pem"

if (!(Test-Path $deviceCert) -or !(Test-Path $deviceKey)) {
    Write-Host "Generating certificates for Device-App..."
    Push-Location $deviceCertDir
    mkcert localhost 127.0.0.1 ::1
    Pop-Location
    Write-Host "✅ Device-App certificates generated"
} else {
    Write-Host "✅ Device-App certificates already exist"
}

Write-Host ""
Write-Host "==================================="
Write-Host "All certificates generated!"
Write-Host "==================================="