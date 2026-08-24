# Deploy 9-ball scorer to PRODUCTION. Requires explicit confirmation.
# Usage: .\deploy-prod.ps1

$ErrorActionPreference = "Stop"
$env:CLOUDFLARE_ACCOUNT_ID = "180f457e46d097180035f855959ee95a"

Write-Host ""
Write-Host "  *** PRODUCTION DEPLOY: 9ballscores ***" -ForegroundColor Red
Write-Host "  Live: https://9ballscores.pages.dev + 9ballscores.jamesnetworks.net" -ForegroundColor Red
Write-Host ""
$ok = Read-Host "Type PROD to deploy to production (anything else aborts)"
if ($ok -ne "PROD") {
  Write-Host "Aborted. Use .\deploy-demo.ps1 for the demo environment." -ForegroundColor Yellow
  exit 1
}

# Do not stuff wrangler's oauth_token into CLOUDFLARE_API_TOKEN.
# That token is not an API token and Pages deploy then fails with 10000/9109.

Set-Location $PSScriptRoot
wrangler pages deploy . --project-name=9ballscores --branch=main --commit-dirty=true
Write-Host ">>> Production deploy complete." -ForegroundColor Green
