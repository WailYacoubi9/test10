# 🔄 MERGE AUTOMATIQUE: test2 → test10
# ============================================================================
# Source: C:\Users\waily\cisf\test2 (Device Flow complet)
# Destination: C:\Users\waily\test10 (Docker setup)
# ============================================================================

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Merge Device Flow: test2 → test10" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# CHEMINS CORRECTS
$test2Path = "C:\Users\waily\cisf\test2"
$test10Path = "C:\Users\waily\test10"

Write-Host "Source:      $test2Path" -ForegroundColor Yellow
Write-Host "Destination: $test10Path" -ForegroundColor Yellow
Write-Host ""

# Vérifier que les répertoires existent
if (-not (Test-Path $test2Path)) {
    Write-Host "❌ ERREUR: test2 non trouvé à $test2Path" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $test10Path)) {
    Write-Host "❌ ERREUR: test10 non trouvé à $test10Path" -ForegroundColor Red
    exit 1
}

Write-Host "✅ test2 trouvé: $test2Path" -ForegroundColor Green
Write-Host "✅ test10 trouvé: $test10Path" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PHASE 1: Copier device-app
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 1: Copie de device-app" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$deviceAppSource = Join-Path $test2Path "device-app"
$deviceAppDest = Join-Path $test10Path "device-app"

if (Test-Path $deviceAppDest) {
    Write-Host "⚠️  device-app existe déjà dans test10" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous le remplacer? (o/n)"
    if ($response -ne 'o') {
        Write-Host "❌ Opération annulée" -ForegroundColor Red
        exit 1
    }
    Remove-Item -Path $deviceAppDest -Recurse -Force
}

Write-Host "📦 Copie de device-app..." -ForegroundColor Cyan
Copy-Item -Path $deviceAppSource -Destination $deviceAppDest -Recurse
Write-Host "✅ device-app copié!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PHASE 2: Copier realm.json
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 2: Mise à jour realm.json" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$realmSource = Join-Path $test2Path "realm.json"
$realmDest = Join-Path $test10Path "webapp2\imports\realm.json"

# Backup de l'ancien realm.json
if (Test-Path $realmDest) {
    $backupPath = "$realmDest.backup"
    Write-Host "💾 Backup de realm.json → $backupPath" -ForegroundColor Cyan
    Copy-Item $realmDest $backupPath -Force
}

Write-Host "📝 Copie de realm.json (avec client devicecis)..." -ForegroundColor Cyan
Copy-Item $realmSource $realmDest -Force
Write-Host "✅ realm.json mis à jour!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PHASE 3: Copier device-activation.js
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 3: Copie de device-activation.js" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$deviceActivationSource = Join-Path $test2Path "webapp2\routes\device-activation.js"
$deviceActivationDest = Join-Path $test10Path "webapp2\routes\device-activation.js"

Write-Host "📝 Copie de device-activation.js..." -ForegroundColor Cyan
Copy-Item $deviceActivationSource $deviceActivationDest -Force
Write-Host "✅ device-activation.js copié!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PHASE 4: Copier pages.js (avec Keycloak Account API)
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 4: Mise à jour pages.js" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$pagesSource = Join-Path $test2Path "webapp2\routes\pages.js"
$pagesDest = Join-Path $test10Path "webapp2\routes\pages.js"

# Backup
if (Test-Path $pagesDest) {
    $backupPath = "$pagesDest.backup"
    Write-Host "💾 Backup de pages.js → $backupPath" -ForegroundColor Cyan
    Copy-Item $pagesDest $backupPath -Force
}

Write-Host "📝 Copie de pages.js..." -ForegroundColor Cyan
Copy-Item $pagesSource $pagesDest -Force
Write-Host "✅ pages.js mis à jour!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PHASE 5: Copier les vues (activate.ejs, devices.ejs)
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 5: Copie des vues" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

# activate.ejs
$activateSource = Join-Path $test2Path "webapp2\views\pages\activate.ejs"
$activateDest = Join-Path $test10Path "webapp2\views\pages\activate.ejs"

Write-Host "📝 Copie de activate.ejs..." -ForegroundColor Cyan
Copy-Item $activateSource $activateDest -Force
Write-Host "✅ activate.ejs copié!" -ForegroundColor Green

# devices.ejs
$devicesSource = Join-Path $test2Path "webapp2\views\pages\devices.ejs"
$devicesDest = Join-Path $test10Path "webapp2\views\pages\devices.ejs"

# Backup
if (Test-Path $devicesDest) {
    $backupPath = "$devicesDest.backup"
    Write-Host "💾 Backup de devices.ejs → $backupPath" -ForegroundColor Cyan
    Copy-Item $devicesDest $backupPath -Force
}

Write-Host "📝 Copie de devices.ejs..." -ForegroundColor Cyan
Copy-Item $devicesSource $devicesDest -Force
Write-Host "✅ devices.ejs copié!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PHASE 6: Copier main.js (auto-refresh)
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 6: Mise à jour main.js" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$mainJsSource = Join-Path $test2Path "webapp2\public\js\main.js"
$mainJsDest = Join-Path $test10Path "webapp2\public\js\main.js"

# Backup
if (Test-Path $mainJsDest) {
    $backupPath = "$mainJsDest.backup"
    Write-Host "💾 Backup de main.js → $backupPath" -ForegroundColor Cyan
    Copy-Item $mainJsDest $backupPath -Force
}

Write-Host "📝 Copie de main.js..." -ForegroundColor Cyan
Copy-Item $mainJsSource $mainJsDest -Force
Write-Host "✅ main.js mis à jour!" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PHASE 7: Mettre à jour package.json (ajouter axios)
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 7: Vérification package.json" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$packageJsonPath = Join-Path $test10Path "webapp2\package.json"
$packageContent = Get-Content $packageJsonPath -Raw

if ($packageContent -notmatch '"axios"') {
    Write-Host "⚠️  axios n'est pas dans package.json" -ForegroundColor Yellow
    Write-Host "📝 Vous devez ajouter manuellement:" -ForegroundColor Cyan
    Write-Host '   "axios": "^1.6.2"' -ForegroundColor White
    Write-Host "   dans la section dependencies" -ForegroundColor White
} else {
    Write-Host "✅ axios déjà présent dans package.json" -ForegroundColor Green
}
Write-Host ""

# ============================================================================
# PHASE 8: Vérifier server.js
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 8: Vérification server.js" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$serverJsPath = Join-Path $test10Path "webapp2\server.js"
$serverContent = Get-Content $serverJsPath -Raw

if ($serverContent -notmatch 'device-activation') {
    Write-Host "⚠️  device-activation route non trouvée dans server.js" -ForegroundColor Yellow
    Write-Host "📝 Vous devez ajouter manuellement ces lignes:" -ForegroundColor Cyan
    Write-Host '   const deviceActivationRoutes = require("./routes/device-activation");' -ForegroundColor White
    Write-Host '   app.use("/", deviceActivationRoutes);' -ForegroundColor White
} else {
    Write-Host "✅ device-activation route déjà dans server.js" -ForegroundColor Green
}
Write-Host ""

# ============================================================================
# PHASE 9: Créer Dockerfile pour device-app
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 9: Création Dockerfile pour device-app" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$dockerfilePath = Join-Path $test10Path "device-app\Dockerfile"

if (-not (Test-Path $dockerfilePath)) {
    Write-Host "📝 Création de device-app/Dockerfile..." -ForegroundColor Cyan
    
    $dockerfileContent = @"
# Image Node officielle légère
FROM node:18-alpine

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord (pour profiter du cache Docker)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code de l'application
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 4000

# Commande de démarrage
CMD ["npm", "start"]
"@
    
    Set-Content -Path $dockerfilePath -Value $dockerfileContent
    Write-Host "✅ Dockerfile créé!" -ForegroundColor Green
} else {
    Write-Host "✅ Dockerfile existe déjà" -ForegroundColor Green
}
Write-Host ""

# ============================================================================
# PHASE 10: Copier documentation
# ============================================================================
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "PHASE 10: Copie de la documentation" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

# ARCHITECTURE_FIX.md
$archSource = Join-Path $test2Path "ARCHITECTURE_FIX.md"
$archDest = Join-Path $test10Path "ARCHITECTURE_FIX.md"
if (Test-Path $archSource) {
    Write-Host "📝 Copie de ARCHITECTURE_FIX.md..." -ForegroundColor Cyan
    Copy-Item $archSource $archDest -Force
    Write-Host "✅ ARCHITECTURE_FIX.md copié!" -ForegroundColor Green
}

# USE_CASES.md
$useCasesSource = Join-Path $test2Path "USE_CASES.md"
$useCasesDest = Join-Path $test10Path "USE_CASES.md"
if (Test-Path $useCasesSource) {
    Write-Host "📝 Copie de USE_CASES.md..." -ForegroundColor Cyan
    Copy-Item $useCasesSource $useCasesDest -Force
    Write-Host "✅ USE_CASES.md copié!" -ForegroundColor Green
}

# TESTS.md
$testsSource = Join-Path $test2Path "TESTS.md"
$testsDest = Join-Path $test10Path "TESTS.md"
if (Test-Path $testsSource) {
    Write-Host "📝 Copie de TESTS.md..." -ForegroundColor Cyan
    Copy-Item $testsSource $testsDest -Force
    Write-Host "✅ TESTS.md copié!" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# RÉSUMÉ
# ============================================================================
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "   ✅ MERGE TERMINÉ AVEC SUCCÈS!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Fichiers copiés:" -ForegroundColor Cyan
Write-Host "   ✅ device-app/ (répertoire complet)" -ForegroundColor White
Write-Host "   ✅ realm.json (avec client devicecis)" -ForegroundColor White
Write-Host "   ✅ device-activation.js" -ForegroundColor White
Write-Host "   ✅ pages.js (avec Keycloak Account API)" -ForegroundColor White
Write-Host "   ✅ activate.ejs" -ForegroundColor White
Write-Host "   ✅ devices.ejs (avec liste devices)" -ForegroundColor White
Write-Host "   ✅ main.js (avec auto-refresh)" -ForegroundColor White
Write-Host "   ✅ device-app/Dockerfile" -ForegroundColor White
Write-Host "   ✅ Documentation (ARCHITECTURE_FIX.md, etc.)" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Actions manuelles restantes:" -ForegroundColor Yellow
Write-Host ""

# Vérifier si axios est présent
$packageJsonPath = Join-Path $test10Path "webapp2\package.json"
$packageContent = Get-Content $packageJsonPath -Raw
if ($packageContent -notmatch '"axios"') {
    Write-Host "   1️⃣  Ajouter axios dans webapp2/package.json" -ForegroundColor Yellow
    Write-Host "      Éditer: C:\Users\waily\test10\webapp2\package.json" -ForegroundColor White
    Write-Host "      Ajouter dans dependencies:" -ForegroundColor White
    Write-Host '      "axios": "^1.6.2"' -ForegroundColor White
    Write-Host ""
}

# Vérifier si device-activation est présent
$serverJsPath = Join-Path $test10Path "webapp2\server.js"
$serverContent = Get-Content $serverJsPath -Raw
if ($serverContent -notmatch 'device-activation') {
    Write-Host "   2️⃣  Ajouter device-activation route dans server.js" -ForegroundColor Yellow
    Write-Host "      Éditer: C:\Users\waily\test10\webapp2\server.js" -ForegroundColor White
    Write-Host "      Ajouter après les imports de routes:" -ForegroundColor White
    Write-Host '      const deviceActivationRoutes = require("./routes/device-activation");' -ForegroundColor White
    Write-Host '      app.use("/", deviceActivationRoutes);' -ForegroundColor White
    Write-Host ""
}

Write-Host "   3️⃣  Mettre à jour docker-compose.yml" -ForegroundColor Yellow
Write-Host "      Ajouter le service device-app (voir fichier fourni)" -ForegroundColor White
Write-Host ""

Write-Host "   4️⃣  Générer les certificats" -ForegroundColor Yellow
Write-Host "      cd C:\Users\waily\test10" -ForegroundColor White
Write-Host "      .\scripts\setup-certs.ps1" -ForegroundColor White
Write-Host ""

Write-Host "   5️⃣  Installer les dépendances" -ForegroundColor Yellow
Write-Host "      cd C:\Users\waily\test10\webapp2" -ForegroundColor White
Write-Host "      npm install" -ForegroundColor White
Write-Host ""
Write-Host "      cd C:\Users\waily\test10\device-app" -ForegroundColor White
Write-Host "      npm install" -ForegroundColor White
Write-Host ""

Write-Host "   6️⃣  Lancer avec Docker" -ForegroundColor Yellow
Write-Host "      cd C:\Users\waily\test10" -ForegroundColor White
Write-Host "      docker compose up" -ForegroundColor White
Write-Host ""

Write-Host "=============================================" -ForegroundColor Green
Write-Host "Pour plus d'aide, consultez:" -ForegroundColor Cyan
Write-Host "  - IMPLEMENTATION_GUIDE.md" -ForegroundColor White
Write-Host "  - ARCHITECTURE_FIX.md" -ForegroundColor White
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
