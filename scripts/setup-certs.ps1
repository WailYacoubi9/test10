# Folder for certificates
$certDir = "D:\Projet_CIS\cis-oidc\webapp2\certs"

# Create folder if it does not exist
if (!(Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir | Out-Null
}

# Certificate file paths
$cert = Join-Path $certDir "localhost+2.pem"
$key  = Join-Path $certDir "localhost+2-key.pem"

# If certificates already exist -> nothing to do
if ((Test-Path $cert) -and (Test-Path $key)) {
    Write-Host "Certificates already exist in $certDir"
    exit 0
}

Write-Host "Generating certificates with mkcert..."

# Go to certs directory
Push-Location $certDir

# Generate certificates
mkcert localhost 127.0.0.1 ::1

# Return to previous location
Pop-Location

Write-Host "Certificates generated in $certDir"
