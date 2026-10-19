# Deploy 9-ball scorer to PRODUCTION. Requires explicit confirmation.
# Usage: .\deploy-prod.ps1

$ErrorActionPreference = "Stop"
$env:CLOUDFLARE_ACCOUNT_ID = "180f457e46d097180035f855959ee95a"

Write-Host ""
Write-Host "  *** PRODUCTION DEPLOY: 9ballscores ***" -ForegroundColor Red
Write-Host "  Live: https://www.9ballscores.com (+ 9ballscores.pages.dev)" -ForegroundColor Red
Write-Host ""
$ok = Read-Host "Type PROD to deploy to production (anything else aborts)"
if ($ok -ne "PROD") {
  Write-Host "Aborted. Use .\deploy-demo.ps1 for the demo environment." -ForegroundColor Yellow
  exit 1
}

# Refuse to deploy a folder that is behind GitHub main: an old local copy
# would overwrite newer production changes (ads, privacy, about pages).
Set-Location $PSScriptRoot
git fetch --quiet origin main
if ($LASTEXITCODE -ne 0) { Write-Host "Aborted: could not reach GitHub to check for newer changes." -ForegroundColor Yellow; exit 1 }
$behind = [int](git rev-list --count HEAD..origin/main)
if ($behind -gt 0) {
  Write-Host "Aborted: this folder is $behind commit(s) behind GitHub main. Run 'git pull origin main' first." -ForegroundColor Yellow
  exit 1
}

# Do not stuff wrangler's oauth_token into CLOUDFLARE_API_TOKEN.
# That token is not an API token and Pages deploy then fails with 10000/9109.

Set-Location $PSScriptRoot
wrangler pages deploy . --project-name=9ballscores --branch=main --commit-dirty=true
Write-Host ">>> Production deploy complete." -ForegroundColor Green
